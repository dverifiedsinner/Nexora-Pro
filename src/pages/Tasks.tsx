import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, Globe, CheckCircle, Clock, 
  ArrowRight, Link as LinkIcon, ExternalLink, 
  Loader2, Search, Filter, ShieldCheck, 
  Plus, Smartphone, MessageCircle, Play,
  Target, Rocket
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { 
  collection, getDocs, doc, updateDoc, 
  serverTimestamp, addDoc, runTransaction 
} from 'firebase/firestore';

export default function Tasks() {
  const { user, userData, refreshUserData } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'tasks'));
      const taskData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(taskData);
    } catch (error) {
       console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const completeTask = async (task: any) => {
    if (!user || !userData) return;
    if (userData.completedTasks?.includes(task.id)) return;

    setCompleting(task.id);
    window.open(task.link, '_blank');

    setTimeout(async () => {
      try {
        await runTransaction(db, async (transaction) => {
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await transaction.get(userRef);
          
          if (!userDoc.exists()) throw new Error("User not found");
          
          const currentMain = userDoc.data().balances?.main || 0;
          const completedTasks = userDoc.data().completedTasks || [];
          
          if (completedTasks.includes(task.id)) return;

          transaction.update(userRef, {
            'balances.main': currentMain + task.reward,
            completedTasks: [...completedTasks, task.id]
          });

          const transRef = doc(collection(db, 'transactions'));
          transaction.set(transRef, {
            userId: user.uid,
            type: 'task',
            title: `Task Reward: ${task.title}`,
            amount: task.reward,
            status: 'settled',
            createdAt: serverTimestamp()
          });
        });

        await refreshUserData();
        alert(`Success! Reward of ₦${task.reward} added to your wallet.`);
      } catch (error) {
        console.error(error);
      } finally {
        setCompleting(null);
      }
    }, 5000); 
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  const dailyTasks = tasks.filter(t => t.type === 'daily' && t.title.toLowerCase().includes(searchTerm.toLowerCase()));
  const sponsoredTasks = tasks.filter(t => t.type === 'sponsored' && t.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pb-32">
      {/* Header */}
      <header className="p-10 bg-slate-900 text-white rounded-b-[3rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="relative z-10 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-black italic">MISSIONS</h1>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Proof of Participation</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                <Target className="text-cyan-400" size={24} />
              </div>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Query active nodes..."
              className="w-full bg-white/5 border border-white/10 p-5 pl-16 rounded-[2rem] font-bold text-sm focus:outline-none focus:ring-2 ring-cyan-500/50"
            />
          </div>
        </div>
      </header>

      <div className="p-6 space-y-12 max-w-2xl mx-auto">
        <AnimatePresence>
          {/* Daily Tasks */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center px-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Registry: Daily</h3>
              <div className="flex items-center gap-2">
                <Clock className="text-cyan-500" size={14} />
                <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">Resets 00:00 UTC</span>
              </div>
            </div>
            
            <div className="space-y-4">
              {dailyTasks.map((task) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  completing={completing} 
                  onComplete={completeTask} 
                  completed={userData?.completedTasks?.includes(task.id)} 
                />
              ))}
              {dailyTasks.length === 0 && (
                <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 opacity-50">
                   <Target className="mx-auto mb-4 text-slate-400" size={32} />
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No active cycles detected</p>
                </div>
              )}
            </div>
          </motion.section>

          {/* Sponsored Tasks */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center px-4">
               <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Registry: Sponsored</h3>
               <span className="text-[10px] font-black text-emerald-500 px-3 py-1 bg-emerald-500/10 rounded-full">ACTIVE BOUNTY</span>
            </div>
            <div className="space-y-4">
              {sponsoredTasks.map((task) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  completing={completing} 
                  onComplete={completeTask} 
                  completed={userData?.completedTasks?.includes(task.id)} 
                />
              ))}
              {sponsoredTasks.length === 0 && (
                <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 opacity-50">
                    <Rocket className="mx-auto mb-4 text-slate-400" size={32} />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No active bounties</p>
                </div>
              )}
            </div>
          </motion.section>
        </AnimatePresence>
      </div>

      <div className="px-6 max-w-2xl mx-auto">
         <div className="p-8 bg-slate-900 text-white rounded-[2.5rem] flex items-center gap-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000" />
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center shrink-0 border border-white/10">
               <ShieldCheck size={32} className="text-cyan-400" />
            </div>
            <div className="space-y-1">
               <p className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Security Note</p>
               <p className="text-xs text-slate-400 italic">All missions are audited for authenticity. Rewards are settled post-verification.</p>
            </div>
         </div>
      </div>
    </div>
  );
}

function TaskCard({ task, completing, onComplete, completed }: any) {
  const isCompleting = completing === task.id;

  return (
    <div className={`bg-white dark:bg-slate-900 p-6 rounded-[2rem] border transition-all relative group shadow-sm ${completed ? 'opacity-50 border-transparent' : 'border-slate-100 dark:border-slate-800 hover:border-cyan-500/50'}`}>
      <div className="flex items-center gap-5">
        <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
          completed ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' : 'bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white'
        }`}>
          {task.category === 'Social' && <MessageCircle size={32} />}
          {task.category === 'Video' && <Play size={32} fill="currentColor" />}
          {task.category === 'Web' && <Globe size={32} />}
          {!['Social', 'Video', 'Web'].includes(task.category) && <Zap size={32} />}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{task.category}</span>
            {completed && <CheckCircle size={12} className="text-emerald-500" />}
          </div>
          <h4 className="text-lg font-black italic tracking-tight truncate">{task.title}</h4>
          <p className="text-xs text-slate-400 font-medium truncate">{task.desc}</p>
        </div>

        <div className="text-right flex flex-col items-end gap-3 px-2">
           <div className="flex items-center gap-1">
             <span className="text-[10px] font-black text-slate-400 uppercase">₦</span>
             <p className="text-xl font-black">{task.reward.toLocaleString()}</p>
           </div>
           <button 
            onClick={() => onComplete(task)}
            disabled={completed || isCompleting}
            className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
              completed 
                ? 'bg-slate-50 dark:bg-slate-800 text-slate-400' 
                : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl shadow-slate-950/10 active:scale-95'
            }`}
          >
            {isCompleting ? <Loader2 className="animate-spin" size={16} /> : (completed ? 'Settled' : 'Execute')}
          </button>
        </div>
      </div>
    </div>
  );
}

