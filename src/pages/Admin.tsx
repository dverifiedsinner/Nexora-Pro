import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  BookOpen, 
  CheckSquare, 
  CreditCard, 
  Settings, 
  Plus, 
  Trash2, 
  Search,
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  Link as LinkIcon,
  Globe,
  Loader2
} from 'lucide-react';

import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { generateCourseContent } from '../services/geminiService';

export default function Admin() {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = React.useState<'users' | 'withdrawals' | 'recharges' | 'courses' | 'system' | 'tasks'>('users');
  const [isGeneratingCourse, setIsGeneratingCourse] = React.useState(false);
  const [courseForm, setCourseForm] = React.useState({ title: '', price: '5000' });
  const [taskForm, setTaskForm] = React.useState({ title: '', reward: '250', type: 'daily' as 'daily' | 'sponsored', link: '', desc: '', category: 'Social' });
  const [isAddingCourse, setIsAddingCourse] = React.useState(false);
  const [isAddingTask, setIsAddingTask] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [users, setUsers] = React.useState<any[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [withdrawals, setWithdrawals] = React.useState<any[]>([]);
  const [recharges, setRecharges] = React.useState<any[]>([]);
  const [tasks, setTasks] = React.useState<any[]>([]);
  const [selectedUser, setSelectedUser] = React.useState<any | null>(null);
  const [isEditingUser, setIsEditingUser] = React.useState(false);
  const [balanceAdjustment, setBalanceAdjustment] = React.useState({ amount: '', type: 'credit', wallet: 'main' as 'main' | 'bonus' | 'referral' | 'investment' });

  const [systemConfig, setSystemConfig] = React.useState({
    rewardMultiplier: '5',
    maintenanceMode: false,
    bannerHeadline: 'Quantum Yield Pro',
    minStake: '500',
  });

  const [courseList, setCourseList] = React.useState([
    { id: '1', title: 'Digital Marketing Mastery', price: 5000, roi: '5X', enrolled: 120, status: 'Active' },
    { id: '2', title: 'Crypto Trading Alpha', price: 12000, roi: '5X', enrolled: 85, status: 'Active' },
    { id: '3', title: 'UI Design Lab', price: 7000, roi: '5X', enrolled: 45, status: 'Standby' },
  ]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Admin: Fetching network data...');
        // Fetch Users
        const { data: usersData, error: usersError } = await supabase.from('profiles').select('*').order('createdAt', { ascending: false });
        
        if (usersError) {
          console.error('Admin: Users fetch error:', usersError);
        }

        if (usersData) {
          console.log(`Admin: Loaded ${usersData.length} users`);
          setUsers(usersData);
          
          // Derive Withdrawals & Recharges from loaded users
          const allWithdrawals: any[] = [];
          const allRecharges: any[] = [];
          
          usersData.forEach(u => {
            if (u.transactions && Array.isArray(u.transactions)) {
              u.transactions.forEach((t: any) => {
                const commonData = { ...t, userId: u.uid, userName: u.displayName, userEmail: u.email };
                if (t.type === 'withdrawal' && t.status === 'PENDING') {
                   allWithdrawals.push(commonData);
                }
                if (t.type === 'recharge' && (t.status === 'PENDING' || t.status === 'PENDING_VERIFICATION')) {
                   allRecharges.push(commonData);
                }
              });
            }
          });
          setWithdrawals(allWithdrawals);
          setRecharges(allRecharges);
        }

        // Fetch System Config
        const { data: configData } = await supabase.from('settings').select('*').eq('id', 'system').maybeSingle();
        if (configData) setSystemConfig(configData);

        // Fetch Tasks
        const { data: tasksData } = await supabase.from('tasks').select('*');
        if (tasksData && tasksData.length > 0) {
          setTasks(tasksData);
        }
      } catch (err) {
        console.error('Admin: Critical fetch error:', err);
      }
    };
    fetchData();
  }, [activeTab]);

  const handleUpdateConfig = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase.from('settings').upsert({ id: 'system', ...systemConfig });
      if (error) throw error;
      alert('Global constants synchronized.');
    } catch (err) {
      console.error(err);
      alert('Sync failed');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateCourse = async (id: string, updates: any) => {
    try {
      const { error } = await supabase.from('courses').update(updates).eq('id', id);
      if (error) throw error;
      setCourseList(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    } catch (err) {
      console.error(err);
    }
  };

  const createCourse = async () => {
    if (!courseForm.title || !courseForm.price) {
      alert("Title and price are required.");
      return;
    }

    setIsGeneratingCourse(true);
    try {
      // 1. Generate AI Content
      const aiContent = await generateCourseContent(courseForm.title);
      
      // 2. Prepare Course Object
      const newCourse = {
        title: aiContent.title,
        article: aiContent.article,
        questions: aiContent.questions,
        price: Number(courseForm.price),
        reward: Number(courseForm.price) * 3.5,
        category: 'Network AI',
        lessons: 5,
        duration: '1h 30m',
        rating: 5.0,
        members: 0,
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800',
        status: 'Active',
        createdAt: new Date().toISOString()
      };

      // 3. Save to DB
      const { data, error } = await supabase.from('courses').insert([newCourse]).select().single();
      if (error) throw error;
      
      setCourseList(prev => [data, ...prev]);
      setCourseForm({ title: '', price: '5000' });
      setIsAddingCourse(false);
      alert('AI-Generated Course deployed to network.');
    } catch (err) {
      console.error(err);
      alert('AI Generation failed. Please try a different title or check network.');
    } finally {
      setIsGeneratingCourse(false);
    }
  };

  const deleteCourse = async (id: string) => {
    if(!confirm("Terminate this curriculum node?")) return;
    try {
      const { error } = await supabase.from('courses').delete().eq('id', id);
      if (error) throw error;
      setCourseList(prev => prev.filter(c => c.id !== id));
    } catch (err) { console.error(err); }
  }

  const handleUpdateUser = async (uid: string, updates: any) => {
    try {
      const { error } = await supabase.from('profiles').update(updates).eq('uid', uid);
      if (error) throw error;
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, ...updates } : u));
      if (selectedUser?.uid === uid) {
        setSelectedUser({ ...selectedUser, ...updates });
      }
      alert('Network node updated.');
    } catch (err) {
      console.error(err);
      alert('Update failed');
    }
  };

  const approveWithdrawal = async (withdrawal: any) => {
    try {
      const user = users.find(u => u.uid === withdrawal.userId);
      if (!user) return;

      const updatedTransactions = user.transactions.map((t: any) => {
        if (t.time === withdrawal.time && t.type === 'withdrawal') {
          return { ...t, status: 'DISBURSED' };
        }
        return t;
      });

      const { error } = await supabase.from('profiles').update({ transactions: updatedTransactions }).eq('uid', user.uid);
      if (error) throw error;
      
      setUsers(prev => prev.map(u => u.uid === user.uid ? { ...u, transactions: updatedTransactions } : u));
      setWithdrawals(prev => prev.filter(w => w.time !== withdrawal.time));
      alert('Fund disbursement verified.');
    } catch (err) {
      console.error(err);
    }
  };

  const approveRecharge = async (recharge: any) => {
    try {
      const user = users.find(u => u.uid === recharge.userId);
      if (!user) return;

      const updatedTransactions = user.transactions.map((t: any) => {
        if (t.time === recharge.time && t.type === 'recharge') {
          return { ...t, status: 'VERIFIED' };
        }
        return t;
      });

      const newBalances = {
        ...user.balances,
        main: (user.balances.main || 0) + recharge.amount
      };

      const { error } = await supabase.from('profiles').update({ 
        transactions: updatedTransactions,
        balances: newBalances
      }).eq('uid', user.uid);
      
      if (error) throw error;
      
      setUsers(prev => prev.map(u => u.uid === user.uid ? { ...u, transactions: updatedTransactions, balances: newBalances } : u));
      setRecharges(prev => prev.filter(r => r.time !== recharge.time));
      alert('Node recharge verified and balance updated.');
    } catch (err) {
      console.error(err);
    }
  };

  const rejectRecharge = async (recharge: any) => {
    if (!confirm("Reject this inflow request?")) return;
    try {
      const user = users.find(u => u.uid === recharge.userId);
      if (!user) return;

      const updatedTransactions = user.transactions.map((t: any) => {
        if (t.time === recharge.time && t.type === 'recharge') {
          return { ...t, status: 'REJECTED' };
        }
        return t;
      });

      const { error } = await supabase.from('profiles').update({ 
        transactions: updatedTransactions
      }).eq('uid', user.uid);
      
      if (error) throw error;
      
      setUsers(prev => prev.map(u => u.uid === user.uid ? { ...u, transactions: updatedTransactions } : u));
      setRecharges(prev => prev.filter(r => r.time !== recharge.time));
      alert('Inflow request rejected.');
    } catch (err) {
      console.error(err);
    }
  };

  const rejectWithdrawal = async (withdrawal: any) => {
    if (!confirm("Deny this vault authorization? Funds will be returned to user balance.")) return;
    try {
      const user = users.find(u => u.uid === withdrawal.userId);
      if (!user) return;

      const updatedTransactions = user.transactions.map((t: any) => {
        if (t.time === withdrawal.time && t.type === 'withdrawal') {
          return { ...t, status: 'DENIED' };
        }
        return t;
      });

      const newBalances = {
        ...user.balances,
        main: (user.balances.main || 0) + Math.abs(withdrawal.amount)
      };

      const { error } = await supabase.from('profiles').update({ 
        transactions: updatedTransactions,
        balances: newBalances
      }).eq('uid', user.uid);
      
      if (error) throw error;
      
      setUsers(prev => prev.map(u => u.uid === user.uid ? { ...u, transactions: updatedTransactions, balances: newBalances } : u));
      setWithdrawals(prev => prev.filter(w => w.time !== withdrawal.time));
      alert('Withdrawal denied and funds restored to user.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateTask = async (id: string, updates: any) => {
    try {
      const { error } = await supabase.from('tasks').update(updates).eq('id', id);
      if (error) throw error;
      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    } catch (err) {
      console.error(err);
    }
  };

  const createTask = async () => {
    if (!taskForm.title || !taskForm.reward) {
      alert("Required fields missing.");
      return;
    }

    try {
      const newTask = {
        title: taskForm.title,
        reward: Number(taskForm.reward),
        desc: taskForm.desc || 'Standard Protocol Task',
        type: taskForm.type,
        category: taskForm.category,
        link: taskForm.link || '#',
        createdAt: new Date().toISOString()
      };
      const { data, error } = await supabase.from('tasks').insert([newTask]).select().single();
      if (error) throw error;
      setTasks(prev => [data, ...prev]);
      setTaskForm({ title: '', reward: '250', type: 'daily', link: '', desc: '', category: 'Social' });
      setIsAddingTask(false);
      alert('Operational task broadcasted.');
    } catch (err) {
      console.error(err);
      alert('Task deployment failed.');
    }
  };

  const deleteTask = async (id: string) => {
    if(!confirm("Erase this task node?")) return;
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err) { console.error(err); }
  }

  const filteredUsers = users.filter(u => 
    (u.displayName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.uid || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdjustBalance = () => {
    if (!selectedUser || !balanceAdjustment.amount) return;
    
    const amount = Number(balanceAdjustment.amount);
    if (isNaN(amount)) return;

    const currentBalances = { ...selectedUser.balances };
    const wallet = balanceAdjustment.wallet;
    
    if (balanceAdjustment.type === 'credit') {
      currentBalances[wallet] = (currentBalances[wallet] || 0) + amount;
    } else {
      currentBalances[wallet] = Math.max(0, (currentBalances[wallet] || 0) - amount);
    }

    const transaction = {
      type: balanceAdjustment.type === 'credit' ? 'system_credit' : 'system_debit',
      title: `${balanceAdjustment.type === 'credit' ? 'CREDIT' : 'DEBIT'} BY ADMIN`,
      amount: balanceAdjustment.type === 'credit' ? amount : -amount,
      time: new Date().toISOString(),
      status: 'SETTLED',
      wallet: wallet
    };

    const updatedTransactions = [...(selectedUser.transactions || []), transaction];

    setSelectedUser({
      ...selectedUser,
      balances: currentBalances,
      transactions: updatedTransactions
    });

    setBalanceAdjustment({ ...balanceAdjustment, amount: '' });
    alert(`${balanceAdjustment.type === 'credit' ? 'Credited' : 'Debited'} ₦${amount.toLocaleString()} ${balanceAdjustment.type === 'credit' ? 'to' : 'from'} ${wallet} wallet.`);
  };

  const stats = [
    { label: 'Total Nodes', value: users.length.toLocaleString(), icon: Users, color: 'text-cyan-400' },
    { 
      label: 'Outbound Flow', 
      value: `₦${users.reduce((acc, u) => acc + (u.transactions || []).filter((t: any) => t.type === 'withdrawal' && t.status === 'DISBURSED').reduce((sum: number, t: any) => sum + Math.abs(t.amount || 0), 0), 0).toLocaleString()}`, 
      icon: CreditCard, 
      color: 'text-pink-400' 
    },
    { 
      label: 'Asset Sales', 
      value: users.reduce((acc, u) => acc + (u.transactions || []).filter((t: any) => t.type === 'course_purchase').length, 0).toLocaleString(), 
      icon: BookOpen, 
      color: 'text-blue-400' 
    },
    { 
      label: 'Proof Audits', 
      value: users.reduce((acc, u) => acc + (u.transactions || []).filter((t: any) => t.type === 'recharge').length, 0).toLocaleString(), 
      icon: CheckSquare, 
      color: 'text-emerald-400' 
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 md:gap-8 relative overflow-hidden bg-white/[0.02] p-8 md:p-12 rounded-[2.5rem] border border-white/5 shadow-2xl">
        <div className="text-center lg:text-left z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 rounded-full text-[8px] font-black uppercase tracking-[0.2em] text-cyan-400 border border-cyan-500/20 mb-4">
            <ShieldCheck size={10} className="fill-cyan-400" /> Root Access Granted
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight text-gradient leading-none uppercase italic">COMMAND CENTRE.</h1>
          <p className="text-white/30 font-light italic text-[10px] uppercase tracking-[0.3em] mt-2">NEXORA INTEL CORE 4.0 // SECURE PROTOCOL</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center z-10">
          <Link to="/dashboard" className="w-full sm:w-auto btn-outline flex items-center justify-center gap-3 py-3 px-8 text-[10px] font-black uppercase tracking-widest border-white/10 hover:border-cyan-500/30">
            Exit to Planet
          </Link>
          <button 
            onClick={() => signOut()}
            className="w-full sm:w-auto btn-primary bg-pink-600 hover:bg-pink-500 shadow-pink-500/20 flex items-center justify-center gap-3 py-3 px-8 text-[10px] font-black uppercase tracking-widest"
          >
            Terminal Shutdown
          </button>
        </div>

        <div className="absolute -top-10 -right-20 w-80 h-80 bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none"></div>
      </header>

      <div className="flex gap-2 p-1.5 bg-white/5 border border-white/5 rounded-2xl backdrop-blur-md overflow-x-auto scrollbar-hide relative">
        {[
          { id: 'users', label: 'Network' },
          { id: 'recharges', label: 'Inflow' },
          { id: 'withdrawals', label: 'Vaults' },
          { id: 'courses', label: 'Curriculum' },
          { id: 'tasks', label: 'Tasks' },
          { id: 'system', label: 'System' },
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`relative px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap z-10 ${
              activeTab === tab.id ? 'text-white' : 'text-white/20 hover:text-white/60'
            }`}
          >
            {activeTab === tab.id && (
              <motion.div 
                layoutId="active-tab-bg"
                className="absolute inset-0 bg-cyan-500 rounded-xl shadow-xl shadow-cyan-500/20 -z-10"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card p-8 border-white/5 group hover:border-cyan-500/30 transition-all cursor-default relative overflow-hidden">
             <div className="flex justify-between items-start mb-6 relative z-10">
                <div className={`p-3 rounded-2xl bg-white/5 border border-white/5 group-hover:scale-110 transition-transform ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
                <ArrowUpRight size={14} className="text-white/10 group-hover:text-cyan-400 transition-colors" />
             </div>
             <div className="relative z-10">
              <p className="text-3xl font-display font-black tracking-tighter leading-none">{stat.value}</p>
              <p className="text-[9px] uppercase font-black text-white/20 tracking-[0.2em] mt-2 group-hover:text-white/40 transition-colors">{stat.label}</p>
             </div>
             <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-white/5 blur-3xl rounded-full group-hover:bg-cyan-500/10 transition-colors"></div>
          </div>
        ))}
      </div>

      <section className="glass-card overflow-hidden border-white/5 shadow-2xl">
        <div className="p-6 md:p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6 bg-white/[0.02]">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-cyan-400 md:w-4 md:h-4" size={14} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Query ${activeTab} registry...`} 
              className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl py-2.5 md:py-3 pl-12 pr-6 text-[10px] md:text-sm font-medium focus:outline-none focus:border-cyan-500/40 focus:bg-white/[0.08] transition-all"
            />
          </div>
          {activeTab === 'courses' || activeTab === 'tasks' ? (
            <button 
              onClick={() => activeTab === 'courses' ? setIsAddingCourse(true) : setIsAddingTask(true)}
              className="w-full md:w-auto btn-primary py-2.5 md:py-3 px-6 md:px-8 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 md:gap-3 shadow-cyan-500/20 active:scale-95 transition-all"
            >
              <Plus size={16} className="md:w-[18px] md:h-[18px]" /> {activeTab === 'courses' ? 'New Curriculum' : 'New Task'}
            </button>
          ) : null}
        </div>

        <AnimatePresence>
          {isAddingCourse && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-cyan-500/5 border-b border-white/5"
            >
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <Sparkles className="text-cyan-400" size={18} />
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-white/80">Deploy AI Content Node</h3>
                   </div>
                   <button onClick={() => setIsAddingCourse(false)} className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors">Cancel</button>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                   <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-white/20 uppercase tracking-widest">Scientific Title / Topic</label>
                      <input 
                        type="text" 
                        value={courseForm.title}
                        onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                        placeholder="e.g. Quantum Yield Optimization 101"
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:border-cyan-500/40"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/20 uppercase tracking-widest">Entry Fee (₦)</label>
                      <input 
                        type="number" 
                        value={courseForm.price}
                        onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm font-display font-black text-white focus:outline-none focus:border-cyan-500/40"
                      />
                   </div>
                </div>
                <button 
                  onClick={createCourse}
                  disabled={isGeneratingCourse}
                  className="w-full btn-primary py-4 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                >
                  {isGeneratingCourse ? (
                    <><Loader2 size={16} className="animate-spin text-white" /> AI is constructing curriculum...</>
                  ) : (
                    <><Sparkles size={16} /> Generate & Deploy with AI</>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {isAddingTask && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-pink-500/5 border-b border-white/5"
            >
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <Globe className="text-pink-400" size={18} />
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-white/80">Broadcast Network Mission</h3>
                   </div>
                   <button onClick={() => setIsAddingTask(false)} className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors">Cancel</button>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                   <div className="lg:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-white/20 uppercase tracking-widest">Task Intent / Title</label>
                      <input 
                        type="text" 
                        value={taskForm.title}
                        onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                        placeholder="e.g. Join the Alpha Protocol"
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/20 uppercase tracking-widest">Protocol Reward (₦)</label>
                      <input 
                        type="number" 
                        value={taskForm.reward}
                        onChange={(e) => setTaskForm({ ...taskForm, reward: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm font-display font-black text-white focus:outline-none"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/20 uppercase tracking-widest">Task Type</label>
                      <select 
                        value={taskForm.type}
                        onChange={(e) => setTaskForm({ ...taskForm, type: e.target.value as any })}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-[10px] font-black uppercase tracking-widest focus:outline-none"
                      >
                        <option value="daily">Daily Mission</option>
                        <option value="sponsored">Sponsored Node</option>
                      </select>
                   </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/20 uppercase tracking-widest">External Link (Redirect URL)</label>
                      <div className="relative">
                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                        <input 
                          type="text" 
                          value={taskForm.link}
                          onChange={(e) => setTaskForm({ ...taskForm, link: e.target.value })}
                          placeholder="https://..."
                          className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-xs font-medium focus:outline-none"
                        />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/20 uppercase tracking-widest">Technical Category</label>
                      <select 
                        value={taskForm.category}
                        onChange={(e) => setTaskForm({ ...taskForm, category: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-[10px] font-black uppercase tracking-widest focus:outline-none"
                      >
                        <option value="Social">Social Integration</option>
                        <option value="Video">Visual Asset</option>
                        <option value="Ad">Sponsored Portal</option>
                        <option value="Feedback">System Feedback</option>
                        <option value="One-time">One-time protocol</option>
                      </select>
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-white/20 uppercase tracking-widest">Protocol Description</label>
                   <textarea 
                     value={taskForm.desc}
                     onChange={(e) => setTaskForm({ ...taskForm, desc: e.target.value })}
                     placeholder="Mission parameters..."
                     rows={2}
                     className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs font-medium focus:outline-none resize-none"
                   />
                </div>
                <button 
                  onClick={createTask}
                  className="w-full btn-primary bg-pink-600 hover:bg-pink-500 shadow-pink-500/20 py-4 text-[10px] font-black uppercase tracking-widest"
                >
                  Broadcast Mission
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="overflow-x-auto">
          {activeTab === 'users' && (
            <table className="w-full text-left border-collapse animate-in fade-in duration-500 min-w-[600px]">
              <thead>
                <tr className="bg-white/[0.02] text-white/30 font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em]">
                  <th className="px-6 md:px-8 py-5 md:py-6">Operator Identity</th>
                  <th className="px-6 md:px-8 py-5 md:py-6 text-center">Protocol Status</th>
                  <th className="px-6 md:px-8 py-5 md:py-6 text-center">Vault Balance</th>
                  <th className="px-6 md:px-8 py-5 md:py-6 text-right">Execution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02] text-[10px] md:text-xs">
                {filteredUsers.length > 0 ? filteredUsers.map((u, i) => (
                  <tr key={i} className="hover:bg-white/[0.01] transition-all group">
                    <td className="px-6 md:px-8 py-4 md:py-6">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-white/5 flex items-center justify-center font-black text-[9px] md:text-[10px] border border-white/5 group-hover:border-cyan-500/20 group-hover:text-cyan-400 transition-all">
                          {(u.displayName || 'UX').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-white/90 group-hover:text-white transition-colors text-[11px] md:text-sm">{u.displayName || 'New User'}</p>
                          <p className="text-[9px] md:text-[10px] text-white/30 font-medium tracking-tight italic">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 md:px-8 py-4 md:py-6 text-center">
                      <span className={`px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest ${u.isAdmin ? 'bg-pink-500/10 text-pink-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
                        {u.isAdmin ? 'Admin' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 md:px-8 py-4 md:py-6 text-center font-display font-black text-white/80 text-xs md:text-sm">₦{Number(u.balances?.main || 0).toLocaleString()}</td>
                    <td className="px-6 md:px-8 py-4 md:py-6">
                      <div className="flex justify-end gap-2 md:gap-3 px-1">
                        <button 
                          onClick={() => { setSelectedUser(u); setIsEditingUser(true); }}
                          className="p-2.5 md:p-3 bg-white/5 rounded-xl md:rounded-2xl border border-white/5 hover:border-cyan-500/40 hover:text-cyan-400 transition-all"
                        >
                          <Settings size={12} className="md:w-3.5 md:h-3.5" />
                        </button>
                        <button className="p-2.5 md:p-3 bg-pink-500/5 text-pink-500 rounded-xl md:rounded-2xl border border-pink-500/10 hover:bg-pink-500 hover:text-white transition-all">
                          <Trash2 size={12} className="md:w-3.5 md:h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="py-24 text-center">
                      <div className="space-y-4">
                        <Users className="w-12 h-12 text-white/10 mx-auto" />
                        <p className="text-[10px] text-white/20 uppercase font-black tracking-[0.3em]">No registered nodes detected in this sector.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'system' && (
            <div className="p-8 grid md:grid-cols-2 gap-8 animate-in fade-in duration-500">
               <div className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400">Core Constants</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Global ROI Multiplier', value: systemConfig.rewardMultiplier, key: 'rewardMultiplier', suffix: 'X' },
                      { label: 'Minimum Stake Node', value: systemConfig.minStake, key: 'minStake', prefix: '₦' },
                      { label: 'Hero Banner Headline', value: systemConfig.bannerHeadline, key: 'bannerHeadline' },
                    ].map((config) => (
                      <div key={config.key} className="glass-card p-6 border-white/5 flex items-center justify-between">
                         <div>
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">{config.label}</p>
                            <input 
                              type="text" 
                              value={config.value}
                              onChange={(e) => setSystemConfig(prev => ({ ...prev, [config.key]: e.target.value }))}
                              className="bg-transparent border-none text-xl font-display font-black text-white focus:outline-none focus:text-cyan-400 transition-colors w-full"
                            />
                         </div>
                         <div className="text-white/20 font-black italic">{config.prefix || config.suffix}</div>
                      </div>
                    ))}
                  </div>
               </div>
               
               <div className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-pink-400">System State</h3>
                  <div className="glass-card p-10 border-white/5 space-y-6">
                     <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-white">Maintenance Protocol</p>
                          <p className="text-xs text-white/30 italic">Disconnect all non-admin routes</p>
                        </div>
                        <button 
                          onClick={() => setSystemConfig(prev => ({ ...prev, maintenanceMode: !prev.maintenanceMode }))}
                          className={`w-14 h-8 rounded-full p-1 transition-all ${systemConfig.maintenanceMode ? 'bg-pink-500' : 'bg-white/10'}`}
                        >
                          <div className={`w-6 h-6 rounded-full bg-white transition-transform ${systemConfig.maintenanceMode ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                     </div>
                     <button 
                        onClick={handleUpdateConfig}
                        disabled={isUpdating}
                        className="w-full btn-primary py-4 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-cyan-500/20 disabled:opacity-50"
                      >
                        {isUpdating ? 'SYNCING...' : 'Commit Global Changes'}
                      </button>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'courses' && (
            <table className="w-full text-left border-collapse animate-in fade-in duration-500">
               <thead>
                <tr className="bg-white/[0.02] text-white/30 font-black text-[10px] uppercase tracking-[0.2em]">
                  <th className="px-8 py-6">Course Identity</th>
                  <th className="px-8 py-6 text-center">Price / Roi</th>
                  <th className="px-8 py-6 text-center">Deployment</th>
                  <th className="px-8 py-6 text-right">Settings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02] text-xs">
                {courseList.map((course) => (
                  <tr key={course.id} className="hover:bg-white/[0.01] transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center font-black text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-all overflow-hidden">
                           <BookOpen size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-white/90 group-hover:text-white transition-colors">{course.title}</p>
                          <p className="text-[10px] text-white/30 font-medium italic">{course.enrolled} Nodes Joined</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <input 
                          type="text" 
                          value={`₦${Number(course.price || 0).toLocaleString()}`}
                          onChange={(e) => {
                            const val = Number(e.target.value.replace(/[^0-9]/g, ''));
                            handleUpdateCourse(course.id, { price: val });
                          }}
                          className="bg-transparent border-none text-sm font-black text-white text-center focus:outline-none focus:text-cyan-400 w-24"
                        />
                        <span className="text-[10px] font-black text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded uppercase">{course.roi} Yield</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <button 
                        onClick={() => handleUpdateCourse(course.id, { status: course.status === 'Active' ? 'Standby' : 'Active' })}
                        className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                          course.status === 'Active' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-white/5 text-white/20 hover:bg-white/10'
                        }`}
                      >
                        {course.status}
                      </button>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-end gap-3">
                        <button className="p-3 bg-white/5 rounded-2xl border border-white/5 hover:border-cyan-400/40 hover:text-cyan-400 transition-all"><Settings size={14} /></button>
                        <button 
                          onClick={() => deleteCourse(course.id)}
                          className="p-3 bg-pink-500/5 text-pink-500 rounded-2xl border border-pink-500/10 hover:bg-pink-500 hover:text-white transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'tasks' && (
            <table className="w-full text-left border-collapse animate-in fade-in duration-500">
               <thead>
                <tr className="bg-white/[0.02] text-white/30 font-black text-[10px] uppercase tracking-[0.2em]">
                  <th className="px-8 py-6">Mission Identity</th>
                  <th className="px-8 py-6 text-center">Reward</th>
                  <th className="px-8 py-6 text-center">Category</th>
                  <th className="px-8 py-6 text-right">Settings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02] text-xs">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-white/[0.01] transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center font-black text-pink-400 group-hover:bg-pink-500 group-hover:text-white transition-all overflow-hidden">
                           <CheckSquare size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-white/90 group-hover:text-white transition-colors capitalize">{task.title}</p>
                          <p className="text-[10px] text-white/30 font-medium italic truncate max-w-xs">{task.desc}</p>
                          <p className="text-[9px] text-cyan-400/60 font-black uppercase mt-1">{task.link}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                        <input 
                          type="text" 
                          value={`₦${Number(task.reward || 0).toLocaleString()}`}
                          onChange={(e) => {
                            const val = Number(e.target.value.replace(/[^0-9]/g, ''));
                            handleUpdateTask(task.id, { reward: val });
                          }}
                          className="bg-transparent border-none text-sm font-black text-cyan-400 text-center focus:outline-none w-24"
                        />
                    </td>
                    <td className="px-8 py-6 text-center">
                        <select 
                          value={task.category}
                          onChange={(e) => handleUpdateTask(task.id, { category: e.target.value })}
                          className="bg-transparent border-none text-[10px] font-black uppercase text-white/40 focus:outline-none appearance-none"
                        >
                          <option value="Social">Social</option>
                          <option value="Video">Video</option>
                          <option value="Ad">Ad</option>
                          <option value="Feedback">Feedback</option>
                        </select>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-end gap-3">
                        <button 
                          onClick={() => {
                            const newDesc = prompt("New description:", task.desc);
                            if(newDesc) handleUpdateTask(task.id, { desc: newDesc });
                          }}
                          className="p-3 bg-white/5 rounded-2xl border border-white/5 hover:border-cyan-400/40 hover:text-cyan-400 transition-all"
                        >
                          <Settings size={14} />
                        </button>
                        <button 
                          onClick={() => deleteTask(task.id)}
                          className="p-3 bg-pink-500/5 text-pink-500 rounded-2xl border border-pink-500/10 hover:bg-pink-500 hover:text-white transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'recharges' && (
            <div className="animate-in fade-in duration-500">
              {recharges.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/[0.02] text-white/30 font-black text-[10px] uppercase tracking-[0.2em]">
                      <th className="px-8 py-6">Operator</th>
                      <th className="px-8 py-6 text-center">Amount</th>
                      <th className="px-8 py-6 text-center">Timestamp</th>
                      <th className="px-8 py-6 text-right">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.02] text-xs">
                    {recharges.map((r, i) => (
                      <tr key={i} className="hover:bg-white/[0.01] transition-all">
                        <td className="px-8 py-6">
                          <p className="font-bold text-white">{r.userName}</p>
                          <p className="text-[10px] text-white/30">{r.userEmail}</p>
                        </td>
                        <td className="px-8 py-6 text-center font-display font-black text-cyan-400">
                          ₦{Number(r.amount || 0).toLocaleString()}
                        </td>
                        <td className="px-8 py-6 text-center text-white/40">
                          {new Date(r.time).toLocaleString()}
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex justify-end gap-3 items-center">
                            {r.proof && (
                              <button 
                                onClick={() => {
                                  const win = window.open();
                                  win?.document.write(`<img src="${r.proof}" style="max-width: 100%" />`);
                                }}
                                className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-cyan-500/10 hover:text-cyan-400 transition-all"
                              >
                                View Proof
                              </button>
                            )}
                            <button 
                              onClick={() => approveRecharge(r)}
                              className="btn-primary py-2 px-4 text-[9px] font-black uppercase tracking-widest"
                            >
                              Verify & credit
                            </button>
                            <button 
                              onClick={() => rejectRecharge(r)}
                              className="px-4 py-2 bg-pink-500/10 text-pink-500 border border-pink-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-pink-500 hover:text-white transition-all"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-24 text-center space-y-8">
                  <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] border border-white/5 flex items-center justify-center mx-auto shadow-2xl relative">
                    <ArrowUpRight size={48} className="text-white/5" />
                    <div className="absolute inset-0 bg-cyan-500/5 blur-3xl"></div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-display font-bold tracking-tight text-white/80 italic">Clear Records.</p>
                    <p className="text-xs text-white/20 uppercase font-black tracking-[0.3em] font-light">Zero pending inflow verifications detected.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'withdrawals' && (
            <div className="animate-in fade-in duration-500">
              {withdrawals.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/[0.02] text-white/30 font-black text-[10px] uppercase tracking-[0.2em]">
                      <th className="px-8 py-6">Operator</th>
                      <th className="px-8 py-6 text-center">Amount</th>
                      <th className="px-8 py-6 text-center">Timestamp</th>
                      <th className="px-8 py-6 text-right">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.02] text-xs">
                    {withdrawals.map((w, i) => (
                      <tr key={i} className="hover:bg-white/[0.01] transition-all">
                        <td className="px-8 py-6">
                          <p className="font-bold text-white">{w.userName}</p>
                          <p className="text-[10px] text-white/30">{w.userEmail}</p>
                        </td>
                        <td className="px-8 py-6 text-center font-display font-black text-pink-400">
                          ₦{Math.abs(w.amount || 0).toLocaleString()}
                        </td>
                        <td className="px-8 py-6 text-center text-white/40">
                          {new Date(w.time).toLocaleString()}
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex justify-end gap-3">
                            <button 
                              onClick={() => approveWithdrawal(w)}
                              className="btn-primary py-2 px-4 text-[9px] font-black uppercase tracking-widest"
                            >
                              Verify Disbursement
                            </button>
                            <button 
                              onClick={() => rejectWithdrawal(w)}
                              className="px-4 py-2 bg-pink-500/10 text-pink-500 border border-pink-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-pink-500 hover:text-white transition-all"
                            >
                              Deny
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-24 text-center space-y-8">
                  <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] border border-white/5 flex items-center justify-center mx-auto shadow-2xl relative">
                    <CreditCard size={48} className="text-white/5" />
                    <div className="absolute inset-0 bg-cyan-500/5 blur-3xl"></div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-display font-bold tracking-tight text-white/80 italic">Clear Horizons.</p>
                    <p className="text-xs text-white/20 uppercase font-black tracking-[0.3em] font-light">Zero pending vault authorizations detected.</p>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </section>

      {/* User Edit Modal */}
      {isEditingUser && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-xl glass-card p-10 border-white/10 space-y-8"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-display font-black text-white italic uppercase tracking-tighter">Node Modification</h3>
                <p className="text-xs text-white/30 uppercase font-bold tracking-widest">{selectedUser.email}</p>
              </div>
              <button onClick={() => setIsEditingUser(false)} className="text-white/20 hover:text-white transition-colors">
                <Trash2 size={24} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest">Main Vault</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">₦</span>
                  <input 
                    type="number"
                    value={selectedUser.balances?.main || 0}
                    onChange={(e) => {
                      const newBalances = { ...selectedUser.balances, main: Number(e.target.value) };
                      setSelectedUser({ ...selectedUser, balances: newBalances });
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm font-display font-black text-white focus:outline-none focus:border-cyan-500/40"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest">Bonus Vault</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">₦</span>
                  <input 
                    type="number"
                    value={selectedUser.balances?.bonus || 0}
                    onChange={(e) => {
                      const newBalances = { ...selectedUser.balances, bonus: Number(e.target.value) };
                      setSelectedUser({ ...selectedUser, balances: newBalances });
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm font-display font-black text-white focus:outline-none focus:border-cyan-500/40"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest">Referral Vault</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">₦</span>
                  <input 
                    type="number"
                    value={selectedUser.balances?.referral || 0}
                    onChange={(e) => {
                      const newBalances = { ...selectedUser.balances, referral: Number(e.target.value) };
                      setSelectedUser({ ...selectedUser, balances: newBalances });
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm font-display font-black text-white focus:outline-none focus:border-cyan-500/40"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest">Investment Vault</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">₦</span>
                  <input 
                    type="number"
                    value={selectedUser.balances?.investment || 0}
                    onChange={(e) => {
                      const newBalances = { ...selectedUser.balances, investment: Number(e.target.value) };
                      setSelectedUser({ ...selectedUser, balances: newBalances });
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm font-display font-black text-white focus:outline-none focus:border-cyan-500/40"
                  />
                </div>
              </div>
            </div>

            <div className="glass-card p-6 border-cyan-500/20 bg-cyan-500/5 space-y-4">
               <h4 className="text-[10px] font-black uppercase text-cyan-400 tracking-widest">Adjust Balance (Credit/Debit)</h4>
               <div className="flex gap-3">
                  <select 
                    value={balanceAdjustment.wallet}
                    onChange={(e) => setBalanceAdjustment({ ...balanceAdjustment, wallet: e.target.value as any })}
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-black uppercase focus:outline-none"
                  >
                    <option value="main">Main Wallet</option>
                    <option value="bonus">Bonus Wallet</option>
                    <option value="referral">Referral Wallet</option>
                  </select>
                  <select 
                    value={balanceAdjustment.type}
                    onChange={(e) => setBalanceAdjustment({ ...balanceAdjustment, type: e.target.value as any })}
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-black uppercase focus:outline-none"
                  >
                    <option value="credit">Credit (+)</option>
                    <option value="debit">Debit (-)</option>
                  </select>
               </div>
               <div className="flex gap-3">
                  <input 
                    type="number" 
                    value={balanceAdjustment.amount}
                    onChange={(e) => setBalanceAdjustment({ ...balanceAdjustment, amount: e.target.value })}
                    placeholder="AMOUNT"
                    className="flex-[2] bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none"
                  />
                  <button 
                    onClick={handleAdjustBalance}
                    className="flex-1 btn-primary py-3 text-[9px] font-black uppercase"
                  >
                    Apply
                  </button>
               </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-white/20 uppercase tracking-widest">Identify & Access</label>
              <div className="space-y-3">
                <input 
                  type="text"
                  value={selectedUser.displayName || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser, displayName: e.target.value })}
                  placeholder="Display Name"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold text-white focus:outline-none focus:border-cyan-500/40"
                />
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-xs font-bold text-white">Promote to Admin</span>
                  <button 
                    onClick={() => setSelectedUser({ ...selectedUser, isAdmin: !selectedUser.isAdmin })}
                    className={`w-12 h-7 rounded-full p-1 transition-all ${selectedUser.isAdmin ? 'bg-cyan-500' : 'bg-white/10'}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${selectedUser.isAdmin ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5">
              <button 
                onClick={() => {
                   handleUpdateUser(selectedUser.uid, { 
                     balances: selectedUser.balances, 
                     displayName: selectedUser.displayName,
                     isAdmin: selectedUser.isAdmin,
                     transactions: selectedUser.transactions
                   });
                   setIsEditingUser(false);
                }}
                className="w-full btn-primary py-5 text-[10px] font-black uppercase tracking-[0.4em]"
              >
                Sync with Network
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
