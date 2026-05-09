import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Globe, CheckCircle, Clock, 
  ArrowRight, Link as LinkIcon, ExternalLink, 
  Loader2, Search, Filter, ShieldCheck, 
  Plus, Smartphone, MessageCircle
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

    // Simulate verification delay
    setTimeout(async () => {
      try {
        await runTransaction(db, async (transaction) => {
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await transaction.get(userRef);
          
          if (!userDoc.exists()) throw new Error("User node not found");
          
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
            title: `PROTOCOL: ${task.title}`,
            amount: task.reward,
            status: 'settled',
            createdAt: serverTimestamp()
          });
        });

        await refreshUserData();
        alert(`PROTOCOL_VERIFIED: Reward of ₦${task.reward} synchronized to main vault.`);
      } catch (error) {
        console.error(error);
      } finally {
        setCompleting(null);
      }
    }, 5000); // 5s verification time
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-ink dark:text-white" size={48} />
      </div>
    );
  }

  const dailyTasks = tasks.filter(t => t.type === 'daily' && t.title.toLowerCase().includes(searchTerm.toLowerCase()));
  const sponsoredTasks = tasks.filter(t => t.type === 'sponsored' && t.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-ink dark:text-white pb-24">
      {/* Brutalist Header */}
      <div className="bg-ink text-yellow-400 border-b-4 border-ink p-10 md:p-16 relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          <span className="text-[10px] font-mono font-black uppercase tracking-[0.5em] opacity-40">NETWORK_OPERATIONAL_MISSIONS</span>
          <h2 className="text-6xl md:text-8xl font-display font-black tracking-tighter uppercase italic leading-none">MISSIONS.</h2>
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-end justify-between">
            <p className="max-w-xl text-xs md:text-sm font-mono font-bold leading-relaxed opacity-80 uppercase">
              Execute micro-protocols to maintain network health and secure rewards. Each mission provides instant liquidity upon verification.
            </p>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-yellow-400/40" size={20} />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="QUERY_MISSIONS..."
                className="w-full bg-white/5 border-4 border-yellow-400 p-5 pl-16 font-black text-xs uppercase focus:outline-none focus:bg-white/10"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto p-6 md:p-12 space-y-24">
        {/* Daily Missions */}
        <section className="space-y-12">
          <div className="flex items-center gap-6 border-b-4 border-ink dark:border-white pb-6">
             <Clock className="text-yellow-500" />
             <h3 className="text-4xl font-display font-black uppercase italic tracking-tighter">DAILY_NODES.</h3>
          </div>
          <div className="grid gap-6">
            {dailyTasks.map((task, i) => (
              <TaskCard key={task.id} task={task} completing={completing} onComplete={completeTask} completed={userData?.completedTasks?.includes(task.id)} />
            ))}
            {dailyTasks.length === 0 && <p className="font-mono text-xs opacity-40 uppercase">NO_DAILY_PROTOCOLS_READY</p>}
          </div>
        </section>

        {/* Sponsored Portals */}
        <section className="space-y-12">
          <div className="flex items-center gap-6 border-b-4 border-ink dark:border-white pb-6">
             <Zap className="text-yellow-500" />
             <h3 className="text-4xl font-display font-black uppercase italic tracking-tighter">SPONSORED_FLOWS.</h3>
          </div>
          <div className="grid gap-6">
            {sponsoredTasks.map((task, i) => (
              <TaskCard key={task.id} task={task} completing={completing} onComplete={completeTask} completed={userData?.completedTasks?.includes(task.id)} />
            ))}
            {sponsoredTasks.length === 0 && <p className="font-mono text-xs opacity-40 uppercase">NO_SPONSORED_FLOWS_ACTIVE</p>}
          </div>
        </section>
      </div>
    </div>
  );
}

function TaskCard({ task, completing, onComplete, completed }: any) {
  const isCompleting = completing === task.id;

  return (
    <div className={`p-8 border-4 border-ink dark:border-white bg-white dark:bg-slate-900 flex flex-col md:flex-row items-center justify-between gap-8 group transition-all ${completed ? 'opacity-40 grayscale' : 'hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)]'}`}>
      <div className="flex items-center gap-8 w-full">
        <div className="w-16 h-16 border-4 border-ink bg-slate-50 dark:bg-white/5 flex items-center justify-center shrink-0">
          {task.category === 'Social' && <MessageCircle size={32} />}
          {task.category === 'Video' && <Play size={32} fill="currentColor" />}
          {!['Social', 'Video'].includes(task.category) && <Globe size={32} />}
        </div>
        <div className="space-y-2">
           <div className="flex items-center gap-4">
              <span className="text-[10px] font-mono font-black uppercase opacity-60">/{task.category}</span>
              {completed && <span className="bg-emerald-500 text-white px-3 py-1 text-[8px] font-black uppercase tracking-widest">VERIFIED</span>}
           </div>
           <h4 className="text-3xl font-display font-black uppercase italic tracking-tighter leading-none">{task.title}</h4>
           <p className="text-xs font-mono font-bold opacity-60 line-clamp-1">{task.desc}</p>
        </div>
      </div>

      <div className="flex items-center gap-12 w-full md:w-auto justify-between md:justify-end">
        <div className="text-right">
           <p className="text-[8px] font-black uppercase opacity-40 mb-1">REWARD</p>
           <p className="text-2xl font-display font-black text-blue-600 dark:text-blue-400">₦{task.reward.toLocaleString()}</p>
        </div>
        
        <button 
          onClick={() => onComplete(task)}
          disabled={completed || isCompleting}
          className={`px-10 py-5 font-black text-xs uppercase tracking-widest transition-all skew-x-[-10deg] ${
            completed ? 'bg-slate-100 text-slate-400' : 'bg-yellow-400 text-ink border-4 border-ink active:translate-y-2 active:shadow-none'
          }`}
        >
          <span className="skew-x-[10deg] flex items-center gap-3">
             {isCompleting ? <><Loader2 className="animate-spin" /> VERIFYING...</> : (completed ? 'EXECUTED' : 'EXECUTE')}
          </span>
        </button>
      </div>
    </div>
  );
}

const Play = ({ className, size = 20, fill = "none" }: { className?: string; size?: number, fill?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill={fill} 
    stroke="currentColor" 
    strokeWidth="3" 
    strokeLinecap="square" 
    strokeLinejoin="inherit" 
    className={className}
  >
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);
