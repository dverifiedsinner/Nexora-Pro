import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Zap, CreditCard, BookOpen, CheckSquare, Settings as SettingsIcon,
  Plus, Search, ShieldCheck, Trash2, Loader2, Link as LinkIcon,
  Globe, Sparkles, ShieldAlert
} from 'lucide-react';
import { 
  collection, query, getDocs, doc, updateDoc, deleteDoc, 
  addDoc, serverTimestamp, getDoc, orderBy
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { generateCourseContent } from '../services/geminiService';
import { Link } from 'react-router-dom';

export default function Admin() {
  const { userData, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'recharges' | 'withdrawals' | 'courses' | 'tasks' | 'system'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [recharges, setRecharges] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [courseList, setCourseList] = useState<any[]>([]);
  const [systemConfig, setSystemConfig] = useState<any>({
    rewardMultiplier: '1.0',
    minStake: '5000',
    bannerHeadline: 'MARKET_VOLATILITY_ABSORBED',
    maintenanceMode: false
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isGeneratingCourse, setIsGeneratingCourse] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [courseForm, setCourseForm] = useState({ title: '', price: '2500' });
  const [taskForm, setTaskForm] = useState({ 
    title: '', reward: '50', type: 'daily', link: '', category: 'Social', desc: '' 
  });
  const [balanceAdjustment, setBalanceAdjustment] = useState({
    type: 'credit' as 'credit' | 'debit',
    wallet: 'main',
    amount: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersSnap, rechargesSnap, withdrawalsSnap, tasksSnap, coursesSnap, systemSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(query(collection(db, 'transactions'), orderBy('createdAt', 'desc'))),
        getDocs(query(collection(db, 'withdrawals'), orderBy('createdAt', 'desc'))),
        getDocs(collection(db, 'tasks')),
        getDocs(collection(db, 'courses')),
        getDoc(doc(db, 'system', 'config'))
      ]);

      setUsers(usersSnap.docs.map(d => ({ uid: d.id, ...d.data() })));
      // Filter recharges from transactions if they aren't separate yet
      setRecharges(rechargesSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter((t: any) => t.type === 'recharge' && t.status === 'pending'));
      setWithdrawals(withdrawalsSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter((w: any) => w.status === 'PENDING'));
      setTasks(tasksSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setCourseList(coursesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      if (systemSnap.exists()) setSystemConfig(systemSnap.data());
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (uid: string, data: any) => {
    try {
      await updateDoc(doc(db, 'users', uid), data);
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, ...data } : u));
    } catch (err) {
      console.error(err);
      alert('Update failed');
    }
  };

  const handleAdjustBalance = async () => {
    if (!selectedUser || !balanceAdjustment.amount) return;
    const amount = parseFloat(balanceAdjustment.amount);
    const wallet = balanceAdjustment.wallet;
    const currentBalance = selectedUser.balances?.[wallet] || 0;
    const newBalance = balanceAdjustment.type === 'credit' ? currentBalance + amount : Math.max(0, currentBalance - amount);

    try {
      await updateDoc(doc(db, 'users', selectedUser.uid), {
        [`balances.${wallet}`]: newBalance
      });

      // Log transaction
      await addDoc(collection(db, 'transactions'), {
        userId: selectedUser.uid,
        userName: selectedUser.displayName || 'Anonymous Node',
        type: 'internal',
        title: `${balanceAdjustment.type.toUpperCase()} BY ADMIN`,
        amount: balanceAdjustment.type === 'credit' ? amount : -amount,
        createdAt: serverTimestamp(),
        status: 'settled',
        walletType: wallet
      });

      alert('Balance Synchronized');
      fetchData();
      setBalanceAdjustment({ ...balanceAdjustment, amount: '' });
    } catch (err) {
      console.error(err);
      alert('Adjustment failed');
    }
  };

  const approveRecharge = async (recharge: any) => {
    try {
      const userRef = doc(db, 'users', recharge.userId);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) throw new Error('User not found');

      const userData = userSnap.data();
      const currentBalance = userData.balances?.main || 0;

      await updateDoc(userRef, {
        'balances.main': currentBalance + recharge.amount
      });

      await updateDoc(doc(db, 'transactions', recharge.id), {
        status: 'settled',
        updatedAt: serverTimestamp()
      });

      alert('Recharge Verified & Credited');
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Approval failed');
    }
  };

  const rejectRecharge = async (recharge: any) => {
    if (!confirm('Reject this inflow?')) return;
    try {
      await updateDoc(doc(db, 'transactions', recharge.id), {
        status: 'rejected',
        updatedAt: serverTimestamp()
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const approveWithdrawal = async (withdrawal: any) => {
    try {
      await updateDoc(doc(db, 'withdrawals', withdrawal.id), {
        status: 'DISBURSED',
        updatedAt: serverTimestamp()
      });

      // Also log to transactions if not already there
      await addDoc(collection(db, 'transactions'), {
        userId: withdrawal.userId,
        userName: withdrawal.userName,
        type: 'withdrawal',
        title: 'WITHDRAWAL_DISBURSED',
        amount: -withdrawal.amount,
        status: 'settled',
        createdAt: serverTimestamp()
      });

      alert('Withdrawal Disbursed');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const rejectWithdrawal = async (withdrawal: any) => {
    if (!confirm('Reject this liquidation?')) return;
    try {
      const userRef = doc(db, 'users', withdrawal.userId);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      const wallet = withdrawal.walletType || 'main';
      
      // Refund
      await updateDoc(userRef, {
        [`balances.${wallet}`]: (userData?.balances?.[wallet] || 0) + withdrawal.amount
      });

      await updateDoc(doc(db, 'withdrawals', withdrawal.id), {
        status: 'REJECTED',
        updatedAt: serverTimestamp()
      });

      alert('Withdrawal Rejected & Refunded');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const createCourse = async () => {
    if (!courseForm.title) return;
    setIsGeneratingCourse(true);
    try {
      const aiContent = await generateCourseContent(courseForm.title);
      await addDoc(collection(db, 'courses'), {
        ...aiContent,
        price: parseFloat(courseForm.price),
        createdAt: serverTimestamp(),
        status: 'Active',
        members: 0
      });
      alert('Module Deployed');
      setIsAddingCourse(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Module deployment failed');
    } finally {
      setIsGeneratingCourse(false);
    }
  };

  const deleteCourse = async (id: string) => {
    if (!confirm('Purge this module?')) return;
    try {
      await deleteDoc(doc(db, 'courses', id));
      fetchData();
    } catch (err) {
       console.error(err);
    }
  };

  const createTask = async () => {
    if (!taskForm.title) return;
    try {
      await addDoc(collection(db, 'tasks'), {
        ...taskForm,
        reward: parseFloat(taskForm.reward),
        createdAt: serverTimestamp()
      });
      alert('Protocol Broadcasted');
      setIsAddingTask(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = async (id: string) => {
    if (!confirm('Purge this protocol?')) return;
    try {
      await deleteDoc(doc(db, 'tasks', id));
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateConfig = async () => {
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, 'system', 'config'), systemConfig);
      alert('Global Config Synchronized');
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
     return (
       <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-yellow-400 font-mono">
         <Loader2 className="animate-spin mb-4" size={48} />
         <p className="text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">INITIALIZING_CMD_CENTRE...</p>
       </div>
     );
  }

  // Double check admin status
  if (!userData?.isAdmin && userData?.email !== 'denacchy@gmail.com') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-yellow-400">
        <div className="max-w-md w-full border-4 border-yellow-400 p-12 text-center space-y-8">
          <ShieldAlert size={64} className="mx-auto" />
          <h2 className="text-4xl font-display font-black uppercase italic">ACCESS_DENIED.</h2>
          <p className="text-[10px] font-mono font-black uppercase tracking-widest opacity-60">Credentials mismatched with administrative registry.</p>
          <Link to="/dashboard" className="block w-full py-4 bg-yellow-400 text-slate-950 font-black text-xs uppercase tracking-widest">Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-ink dark:text-white pb-20">
      {/* Brutalist Admin Header */}
      <div className="bg-ink text-yellow-400 border-b-4 border-ink p-10 md:p-16 relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none grayscale">
          <ShieldCheck size={300} className="translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
          <div className="space-y-4">
            <span className="text-[10px] font-mono font-black uppercase tracking-[0.5em] opacity-40">CENTRAL_COMMAND_v9.0</span>
            <h1 className="text-6xl md:text-8xl font-display font-black tracking-tighter uppercase italic leading-none">ROOT<br />ACCESS.</h1>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-4 border-yellow-400 overflow-hidden w-full max-w-2xl bg-yellow-400/10">
            <div className="p-6 border-r-4 border-yellow-400 bg-yellow-400 text-ink">
              <p className="text-[9px] font-mono font-black uppercase mb-1">TOTAL_NODES</p>
              <p className="text-4xl font-display font-black leading-none">{users.length}</p>
            </div>
            <div className="p-6 border-r-4 border-yellow-400">
              <p className="text-[9px] font-mono font-black uppercase mb-1">INFLOW_QUEUE</p>
              <p className="text-4xl font-display font-black leading-none">{recharges.length}</p>
            </div>
            <div className="p-6 border-yellow-400">
              <p className="text-[9px] font-mono font-black uppercase mb-1">PENDING_FLOWS</p>
              <p className="text-4xl font-display font-black leading-none">{withdrawals.length}</p>
            </div>
          </div>
        </div>
      </div>

      <nav className="sticky top-0 z-30 bg-white border-b-4 border-ink grid grid-cols-3 md:grid-cols-6 gap-0">
        {[
          { id: 'users', label: 'NODES', icon: Users },
          { id: 'recharges', label: 'INFLOW', icon: Zap },
          { id: 'withdrawals', label: 'OUTFLOW', icon: CreditCard },
          { id: 'courses', label: 'MODULES', icon: BookOpen },
          { id: 'tasks', label: 'PROTOCOLS', icon: CheckSquare },
          { id: 'system', label: 'CORE_SYNC', icon: SettingsIcon },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`p-4 md:p-6 border-r-4 last:border-r-0 border-ink transition-all flex flex-col md:flex-row items-center justify-center gap-3 font-mono font-black text-[8px] md:text-xs uppercase tracking-widest ${activeTab === tab.id ? 'bg-yellow-400 text-ink' : 'hover:bg-slate-50'}`}
          >
            <tab.icon size={18} />
            <span className="hidden md:inline">{tab.label}</span>
          </button>
        ))}
      </nav>

      <div className="max-w-[1600px] mx-auto p-6 md:p-12">
        <AnimatePresence mode="wait">
          {activeTab === 'users' && <UsersTabContent />}
          {activeTab === 'recharges' && <RechargesTabContent />}
          {activeTab === 'withdrawals' && <WithdrawalsTabContent />}
          {activeTab === 'courses' && <CoursesTabContent />}
          {activeTab === 'tasks' && <TasksTabContent />}
          {activeTab === 'system' && <SystemTabContent />}
        </AnimatePresence>
      </div>

      <AdminModals />
    </div>
  );

  function UsersTabContent() {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 pb-8 border-b-4 border-ink">
          <div className="space-y-4 text-center md:text-left">
            <span className="text-[10px] font-mono font-black uppercase opacity-40">USER_NODE_REGISTRY</span>
            <h3 className="text-5xl font-display font-black uppercase italic">NETWORK_NODES.</h3>
          </div>
          <div className="relative w-full max-w-md">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-ink/20" size={24} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="SEARCH_NODE_UID"
              className="w-full bg-white border-4 border-ink py-5 pl-16 pr-8 font-black text-xs uppercase focus:outline-none focus:bg-yellow-50 transition-colors"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-0 border-4 border-ink">
          {users.filter(u => 
            (u.displayName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
          ).map((u, i) => (
            <div key={i} className="p-8 border-b-4 md:border-b-0 md:border-r-4 last:border-r-0 border-ink bg-white flex flex-col justify-between group hover:bg-slate-50 transition-all">
              <div className="flex justify-between items-start mb-8">
                <div className="w-16 h-16 border-4 border-ink bg-slate-100 flex items-center justify-center relative">
                  {u.photoURL ? <img src={u.photoURL} alt={u.displayName} className="w-full h-full object-cover grayscale" /> : <Users size={32} />}
                  {u.isAdmin && <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 border-2 border-ink flex items-center justify-center"><ShieldCheck size={12} /></div>}
                </div>
                <button 
                  onClick={() => { setSelectedUser(u); setIsEditingUser(true); }}
                  className="p-3 border-2 border-ink hover:bg-ink hover:text-white transition-all scale-0 group-hover:scale-100 transform origin-right"
                >
                  <Plus size={20} />
                </button>
              </div>
              <div>
                <p className="text-[8px] font-mono font-black uppercase opacity-40 mb-1">UID: {u.uid.substring(0, 12)}</p>
                <h4 className="text-2xl font-display font-black uppercase tracking-tight">{u.displayName}</h4>
                <p className="text-xs font-mono font-bold opacity-40 line-clamp-1">{u.email}</p>
              </div>
              <div className="mt-8 pt-6 border-t-2 border-ink/5 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[7px] font-mono font-black uppercase opacity-40">MAIN_RESERVE</p>
                  <p className="text-sm font-black">₦{u.balances?.main?.toLocaleString() || 0}</p>
                </div>
                <div>
                  <p className="text-[7px] font-mono font-black uppercase opacity-40">YIELD_VAULT</p>
                  <p className="text-sm font-black">₦{u.balances?.referral?.toLocaleString() || 0}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  function RechargesTabContent() {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
        <h3 className="text-5xl font-display font-black uppercase italic">PENDING_INFLOW.</h3>
        <div className="divide-y-4 divide-ink border-4 border-ink bg-white">
          {recharges.length > 0 ? recharges.map((r, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-[1fr_200px_400px] items-center p-8 gap-8 group hover:bg-yellow-50 transition-colors">
              <div className="space-y-2">
                <span className="bg-ink text-white px-3 py-1 text-[8px] font-mono font-bold">RECH_#{r.id.substring(0,8)}</span>
                <h4 className="text-3xl font-display font-black uppercase">{r.userName}</h4>
                <p className="text-xs font-mono font-bold opacity-40 uppercase">{r.userEmail}</p>
              </div>
              <div className="text-center md:text-right">
                <p className="text-[10px] font-mono font-black opacity-40 mb-1 tracking-widest">AMOUNT</p>
                <p className="text-4xl font-display font-black tracking-tighter text-blue-600">₦{r.amount.toLocaleString()}</p>
              </div>
              <div className="flex gap-4">
                {r.proofUrl && (
                  <a href={r.proofUrl} target="_blank" rel="noreferrer" className="flex-1 py-4 border-4 border-ink bg-slate-100 flex items-center justify-center hover:bg-white transition-all text-[10px] font-black uppercase">
                    <Search className="mr-2" size={16} /> VIEW_PROOF_NODE
                  </a>
                )}
                <div className="flex flex-col gap-2 flex-1">
                  <button onClick={() => approveRecharge(r)} className="w-full py-4 bg-yellow-400 border-4 border-ink font-black text-xs uppercase tracking-widest hover:bg-yellow-500 transition-all">VERIFY</button>
                  <button onClick={() => rejectRecharge(r)} className="w-full py-2 border-2 border-ink text-red-500 font-black text-[10px] uppercase hover:bg-red-500 hover:text-white transition-all">REJECT</button>
                </div>
              </div>
            </div>
          )) : (
            <div className="p-24 text-center text-slate-400 font-mono font-black italic tracking-widest uppercase">
              CLEAN_INFLOW_REGISTRY
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  function WithdrawalsTabContent() {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
        <h3 className="text-5xl font-display font-black uppercase italic">VAULT_OUTFLOW.</h3>
        <div className="border-4 border-ink bg-white overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-ink text-white font-mono font-bold text-[10px] uppercase tracking-[0.4em]">
                <th className="p-8">Recipient</th>
                <th className="p-8">Target Settlement</th>
                <th className="p-8 text-right">Liquidity</th>
                <th className="p-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-4 divide-ink">
              {withdrawals.length > 0 ? withdrawals.map((w, i) => (
                <tr key={i} className="hover:bg-yellow-50 transition-all group">
                  <td className="p-8">
                    <p className="text-2xl font-display font-black uppercase mb-1">{w.userName}</p>
                    <p className="text-[10px] font-mono font-bold opacity-40">{w.userEmail}</p>
                  </td>
                  <td className="p-8">
                    <div className="space-y-2">
                       <p className="text-sm font-mono font-black bg-slate-100 border-2 border-ink p-3 uppercase">{w.bankName} // {w.accountNumber || w.walletAddress}</p>
                       <p className="text-[8px] font-black uppercase opacity-40 tracking-widest">{w.accountName || 'NODE_HOLDER'}</p>
                    </div>
                  </td>
                  <td className="p-8 text-right">
                    <p className="text-3xl font-display font-black text-red-600 tracking-tighter">₦{w.amount.toLocaleString()}</p>
                  </td>
                  <td className="p-8">
                    <div className="flex justify-end gap-4">
                      <button onClick={() => approveWithdrawal(w)} className="px-6 py-3 bg-yellow-400 border-4 border-ink font-black text-[10px] uppercase hover:bg-yellow-500 transition-all">SETTLE</button>
                      <button onClick={() => rejectWithdrawal(w)} className="px-6 py-3 bg-white border-4 border-ink text-red-500 font-black text-[10px] uppercase hover:bg-red-500 hover:text-white transition-all">DENY</button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="p-24 text-center text-slate-400 font-mono font-black italic tracking-widest uppercase">
                    NO_OUTFLOW_PENDING
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    );
  }

  function CoursesTabContent() {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 pb-8 border-b-4 border-ink">
          <div className="space-y-4">
            <h3 className="text-5xl font-display font-black uppercase italic">MODULES.</h3>
          </div>
          <button 
            onClick={() => setIsAddingCourse(true)}
            className="px-10 py-5 bg-ink text-yellow-400 font-black text-xs uppercase tracking-widest hover:bg-yellow-400 hover:text-ink transition-all skew-x-[-10deg]"
          >
            <span className="skew-x-[10deg] block flex items-center gap-3">
              <Plus size={20} /> DEPLOY_NEW_CURRICULUM
            </span>
          </button>
        </div>

        {isAddingCourse && (
          <div className="p-10 border-4 border-ink bg-yellow-400 space-y-8">
             <div className="grid md:grid-cols-2 gap-8">
               <div className="space-y-3">
                  <label className="text-[10px] font-mono font-black uppercase opacity-60">TOPIC_SEED</label>
                  <input type="text" value={courseForm.title} onChange={(e) => setCourseForm({...courseForm, title: e.target.value})} className="w-full bg-white border-4 border-ink p-5 font-black text-sm uppercase focus:outline-none" />
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-mono font-black uppercase opacity-60">PRICE (₦)</label>
                  <input type="number" value={courseForm.price} onChange={(e) => setCourseForm({...courseForm, price: e.target.value})} className="w-full bg-white border-4 border-ink p-5 font-black text-xl tracking-tighter focus:outline-none" />
               </div>
             </div>
             <button onClick={createCourse} disabled={isGeneratingCourse} className="w-full py-6 bg-ink text-white font-black text-sm uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-yellow-500 hover:text-ink border-4 border-white transition-all">
               {isGeneratingCourse ? <><Loader2 className="animate-spin" /> EXTRACTING_INTEL...</> : <><Zap /> GENERATE_&_BROADCAST</>}
             </button>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {courseList.map((course, i) => (
            <div key={i} className="border-4 border-ink bg-white overflow-hidden group hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div className="h-48 border-b-4 border-ink grayscale group-hover:grayscale-0 transition-all overflow-hidden relative">
                <img src={course.image} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000" alt="" />
                <div className="absolute top-4 right-4 bg-yellow-400 border-4 border-ink px-4 py-2 font-black text-xs uppercase tracking-widest">₦{course.price.toLocaleString()}</div>
              </div>
              <div className="p-8 space-y-4">
                <h4 className="text-4xl font-display font-black uppercase italic tracking-tighter italic">{course.title}</h4>
                <div className="flex gap-3 pt-6">
                  <button onClick={() => deleteCourse(course.id)} className="p-4 border-4 border-ink bg-red-100 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18} /></button>
                  <button className="flex-1 py-4 bg-ink text-white font-black text-xs uppercase hover:bg-yellow-400 hover:text-ink transition-all">VERIFY_CURRICULUM</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  function TasksTabContent() {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 pb-8 border-b-4 border-ink">
          <h3 className="text-5xl font-display font-black uppercase italic">PROTOCOLS.</h3>
          <button onClick={() => setIsAddingTask(true)} className="px-10 py-5 bg-ink text-yellow-400 font-black text-xs uppercase tracking-widest hover:bg-yellow-400 hover:text-ink transition-all">ADD_PROTOCOL</button>
        </div>
        {isAddingTask && (
          <div className="p-10 border-4 border-ink bg-slate-100 space-y-8 animate-in slide-in-from-top">
             <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
               <div className="lg:col-span-2 space-y-3">
                  <label className="text-[10px] font-mono font-black uppercase opacity-60">MISSION_TITLE</label>
                  <input type="text" value={taskForm.title} onChange={(e) => setTaskForm({...taskForm, title: e.target.value})} className="w-full border-4 border-ink p-5 font-black text-sm uppercase focus:outline-none" />
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-mono font-black uppercase opacity-60">REWARD (₦)</label>
                  <input type="number" value={taskForm.reward} onChange={(e) => setTaskForm({...taskForm, reward: e.target.value})} className="w-full border-4 border-ink p-5 font-black text-sm focus:outline-none" />
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-mono font-black uppercase opacity-60">TYPE</label>
                  <select value={taskForm.type} onChange={(e) => setTaskForm({...taskForm, type: e.target.value as any})} className="w-full border-4 border-ink p-5 font-black text-[10px] uppercase appearance-none">
                    <option value="daily">DAILY</option>
                    <option value="sponsored">SPONSORED</option>
                  </select>
               </div>
             </div>
             <button onClick={createTask} className="w-full py-6 bg-ink text-white font-black text-sm uppercase hover:bg-yellow-400 hover:text-ink border-4 border-ink transition-all">BROADCAST_PROTOCOL</button>
          </div>
        )}
        <div className="divide-y-4 divide-ink border-4 border-ink bg-white">
          {tasks.map((task, i) => (
            <div key={i} className="flex items-center justify-between p-8 group hover:bg-yellow-50 transition-colors">
              <div className="flex items-center gap-8">
                <div className="w-16 h-16 border-4 border-ink bg-slate-100 flex items-center justify-center font-black">
                  {task.type === 'sponsored' ? <Zap className="text-yellow-500 fill-yellow-500" /> : <Globe size={24} />}
                </div>
                <div>
                   <h4 className="text-2xl font-display font-black uppercase leading-none mb-1">{task.title}</h4>
                   <p className="text-[10px] font-mono font-bold opacity-40 uppercase">REWARD: ₦{task.reward} // CATEGORY: {task.category}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={() => deleteTask(task.id)} className="p-4 border-4 border-ink hover:bg-red-500 hover:text-white transition-all"><Trash2 size={20} /></button>
                <button className="px-8 py-4 bg-ink text-white font-black text-[10px] uppercase hover:bg-yellow-400 hover:text-ink transition-all">CONFIG</button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  function SystemTabContent() {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
        <h3 className="text-5xl font-display font-black uppercase italic">CORE_SYNC.</h3>
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-8 p-10 border-4 border-ink bg-white">
             <h4 className="text-xl font-display font-black uppercase tracking-tight pb-4 border-b-2 border-ink/5">SYSTEM_CALIBRATION</h4>
             <div className="space-y-6">
                {[
                  { label: 'YIELD_MULTIPLIER', key: 'rewardMultiplier', suffix: 'X' },
                  { label: 'STAKE_THRESHOLD (₦)', key: 'minStake' },
                  { label: 'NETWORK_TICKER', key: 'bannerHeadline' },
                ].map(c => (
                  <div key={c.key} className="space-y-2">
                    <label className="text-[8px] font-black uppercase opacity-40">{c.label}</label>
                    <div className="flex border-4 border-ink">
                      <input type="text" value={systemConfig[c.key as keyof typeof systemConfig]} onChange={(e) => setSystemConfig({...systemConfig, [c.key]: e.target.value})} className="flex-1 p-4 font-display font-black text-2xl uppercase focus:outline-none" />
                      {c.suffix && <div className="p-4 bg-ink text-white font-black flex items-center">{c.suffix}</div>}
                    </div>
                  </div>
                ))}
                <button onClick={handleUpdateConfig} disabled={isUpdating} className="w-full py-5 bg-yellow-400 border-4 border-ink font-black text-xs uppercase tracking-widest hover:bg-yellow-500 transition-all">
                  {isUpdating ? 'SYNCING...' : 'COMMIT_GLOBAL_CHANGES'}
                </button>
             </div>
          </div>
          <div className="space-y-8 p-10 border-4 border-ink bg-slate-950 text-yellow-400 font-mono overflow-hidden h-[500px]">
             <h4 className="text-xl font-display font-black uppercase tracking-tight pb-4 border-b-2 border-white/10 text-white italic">NODE_HEARTBEAT</h4>
             <div className="space-y-2 text-[10px] leading-relaxed">
                {[...Array(20)].map((_, i) => (
                  <p key={i} className="opacity-40"><span className="text-white">[{new Date().toISOString()}]</span> HEARTBEAT_OK // SECTOR_{Math.random().toString(16).substring(2,6).toUpperCase()} // STATUS: ACTIVE</p>
                ))}
                <p className="animate-pulse">_ TERMINAL_READY</p>
             </div>
          </div>
        </div>
      </motion.div>
    );
  }

  function AdminModals() {
    return (
      <AnimatePresence>
        {isEditingUser && selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12 bg-ink/95 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-6xl bg-white border-[8px] border-ink p-8 md:p-16 flex flex-col md:flex-row gap-12 overflow-y-auto max-h-[90vh]">
              <div className="flex-1 space-y-12">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-6xl font-display font-black uppercase italic">NODE_CFG.</h3>
                    <p className="text-[10px] font-mono font-black opacity-40 mt-1 uppercase tracking-widest">AGENT_IDENTIFIER: {selectedUser.uid}</p>
                  </div>
                  <button onClick={() => setIsEditingUser(false)} className="p-4 border-4 border-ink hover:bg-ink hover:text-white transition-all"><Plus className="rotate-45" size={48} /></button>
                </div>

                <div className="p-10 border-4 border-ink bg-slate-50 space-y-10">
                   <h4 className="text-xs font-black uppercase tracking-widest border-b-2 border-ink/5 pb-4">IDENTITY_CREDENTIALS</h4>
                   <div className="grid grid-cols-2 gap-8">
                     <div className="space-y-2 text-[10px] font-black uppercase opacity-40">DISPLAY_NAME</div>
                     <div className="space-y-2 text-[10px] font-black uppercase opacity-40 text-right">E-MAIL_ADDRESS</div>
                     <p className="text-2xl font-display font-black uppercase">{selectedUser.displayName}</p>
                     <p className="text-2xl font-display font-black text-right lowercase">{selectedUser.email}</p>
                   </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {['main', 'referral', 'investment', 'bonus'].map((wallet) => (
                    <div key={wallet} className="p-8 border-4 border-ink bg-white flex justify-between items-center group">
                       <div>
                          <p className="text-[10px] font-black uppercase opacity-40 mb-1">{wallet}_RESERVE</p>
                          <p className="text-3xl font-display font-black">₦{selectedUser.balances?.[wallet]?.toLocaleString() || 0}</p>
                       </div>
                       <button onClick={() => setBalanceAdjustment({ type: 'credit', wallet, amount: '' })} className="p-4 bg-yellow-400 border-4 border-ink opacity-0 group-hover:opacity-100 transition-all"><Zap size={24} /></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full md:w-96 space-y-8">
                 <div className="p-10 border-4 border-ink bg-yellow-400 space-y-6">
                    <h4 className="text-xs font-black uppercase tracking-widest leading-none">BALANCE_OVERRIDE</h4>
                    <select value={balanceAdjustment.wallet} onChange={(e) => setBalanceAdjustment({...balanceAdjustment, wallet: e.target.value})} className="w-full p-5 border-4 border-ink font-black text-[10px] uppercase appearance-none">
                      <option value="main">MAIN_CORE</option>
                      <option value="referral">VAULT_YIELD</option>
                      <option value="investment">MODULE_CAPITAL</option>
                      <option value="bonus">BONUS_TIER</option>
                    </select>
                    <input type="number" value={balanceAdjustment.amount} onChange={(e) => setBalanceAdjustment({...balanceAdjustment, amount: e.target.value})} placeholder="QUANTITY" className="w-full p-5 border-4 border-ink font-black text-xl tracking-tighter" />
                    <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => { setBalanceAdjustment({...balanceAdjustment, type: 'credit'}); handleAdjustBalance(); }} className="py-4 bg-ink text-white font-black text-[10px] uppercase italic tracking-widest">CREDIT</button>
                      <button onClick={() => { setBalanceAdjustment({...balanceAdjustment, type: 'debit'}); handleAdjustBalance(); }} className="py-4 bg-white text-ink font-black text-[10px] uppercase italic tracking-widest border-4 border-ink">DEBIT</button>
                    </div>
                 </div>

                 <div className="p-10 border-4 border-ink space-y-8">
                    <div className="flex justify-between items-center">
                       <p className="text-[10px] font-black uppercase tracking-widest">ADMIN_ROOT_ACL</p>
                       <button 
                        onClick={() => handleUpdateUser(selectedUser.uid, { isAdmin: !selectedUser.isAdmin })}
                        className={`w-16 h-8 border-4 border-ink relative ${selectedUser.isAdmin ? 'bg-yellow-400' : 'bg-slate-200'} transition-colors`}
                       >
                         <div className={`absolute top-0 w-1/2 h-full bg-ink transition-all ${selectedUser.isAdmin ? 'right-0' : 'left-0'}`} />
                       </button>
                    </div>
                    <button className="w-full py-4 border-4 border-ink text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">TERMINATE_NODE_SYNC</button>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  }
}
