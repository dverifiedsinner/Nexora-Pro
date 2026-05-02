import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CheckSquare, Share2, Youtube, Smartphone, Eye, Award, Clock, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function Tasks() {
  const { userData } = useAuth();
  const [processingTaskId, setProcessingTaskId] = useState<string | null>(null);

  const taskCategories = [
    { title: 'Daily tasks', icon: Clock, count: '3/5', color: 'text-cyan-400' },
    { title: 'One-time', icon: CheckSquare, count: '12', color: 'text-pink-400' },
    { title: 'Sponsored', icon: Share2, count: '4', color: 'text-emerald-400' },
  ];

  const tasks = [
    {
      id: 't1',
      title: 'Watch Nexora Intro Video',
      desc: 'Watch the full 2-minute introductory video to learn how to maximize your earnings.',
      reward: 100,
      type: 'one-time',
      category: 'Video',
      icon: Youtube,
      link: 'https://youtube.com/@nexora'
    },
    {
      id: 't2',
      title: 'Share Dashboard on WhatsApp',
      desc: 'Post a screenshot of your dashboard on your WhatsApp status and get verified.',
      reward: 250,
      type: 'daily',
      category: 'Social',
      icon: Share2,
      link: 'https://wa.me/?text=Check%20out%20my%20earnings%20on%20Nexora!'
    },
    {
      id: 't3',
      title: 'Join Official Telegram',
      desc: 'Synchronize with the core community for real-time protocol updates and signals.',
      reward: 150,
      type: 'one-time',
      category: 'Social',
      icon: Share2,
      link: 'https://t.me/nexora_official'
    },
    {
      id: 't4',
      title: 'Visit Daily Ad Portal',
      desc: 'View featured ads from our sponsors to complete your daily node verification.',
      reward: 200,
      type: 'daily',
      category: 'Ad',
      icon: Eye,
      link: 'https://example.com/ads'
    },
    {
      id: 't5',
      title: 'Follow NEXORA on X',
      desc: 'Mirror our latest transmission on the X network to boost node visibility.',
      reward: 100,
      type: 'daily',
      category: 'Social',
      icon: Share2,
      link: 'https://x.com/nexora_protocol'
    },
    {
      id: 't6',
      title: 'Submit App Feedback',
      desc: 'Help us optimize the network by sharing your experience with the team.',
      reward: 500,
      type: 'one-time',
      category: 'Feedback',
      icon: Award,
      link: '#'
    }
  ];

  const handleCompleteTask = async (task: any) => {
    if (!userData) return;
    
    // Check if already completed
    if (userData.completedTasks?.includes(task.id)) {
      alert("This task has already been completed.");
      return;
    }

    if (task.link && task.link !== '#') {
      window.open(task.link, '_blank');
    }

    setProcessingTaskId(task.id);
    
    // Simulate task processing (verification)
    await new Promise(resolve => setTimeout(resolve, 3500));

    try {
      const newBalances = {
        ...userData.balances,
        bonus: Number(userData.balances.bonus || 0) + task.reward
      };
      
      const newTransaction = {
        type: 'task',
        title: `TASK: ${task.title}`,
        amount: task.reward,
        time: new Date().toISOString(),
        status: 'COMPLETED'
      };

      const completedTasks = Array.isArray(userData.completedTasks) 
        ? [...userData.completedTasks, task.id]
        : [task.id];

      const { error } = await supabase
        .from('profiles')
        .update({
          balances: newBalances,
          transactions: [...(userData.transactions || []), newTransaction],
          completedTasks: completedTasks
        })
        .eq('uid', userData.uid);

      if (error) throw error;

      alert(`Task completed! ₦${task.reward} added to your Bonus Reservoir.`);
    } catch (err) {
      console.error(err);
      alert('Failed to complete task.');
    } finally {
      setProcessingTaskId(null);
    }
  };

  const isCompleted = (taskId: string) => {
    return userData?.completedTasks?.includes(taskId);
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="space-y-2">
        <h1 className="text-4xl font-display font-black text-gradient uppercase italic tracking-tight">Earn Center.</h1>
        <p className="text-white/40 font-light italic text-sm">Complete micro-tasks and earn instant rewards to your bonus wallet.</p>
      </header>

      {/* Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {taskCategories.map((cat, i) => (
          <div key={i} className="glass-card p-6 flex items-center justify-between group active:scale-95 transition-all border-white/5">
            <div className="flex items-center gap-4">
              <div className={`p-4 bg-white/5 rounded-2xl ${cat.color} group-hover:scale-110 transition-transform shadow-2xl`}>
                <cat.icon size={24} />
              </div>
              <div>
                <h3 className="font-display font-black text-[10px] uppercase tracking-widest text-white/60">{cat.title}</h3>
                <p className="text-[9px] uppercase font-bold text-white/20 tracking-widest mt-1">{cat.count} Available</p>
              </div>
            </div>
            <ArrowRight size={18} className="text-white/20 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Task List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-xl font-display font-black italic uppercase tracking-widest text-xs opacity-40">Recommended Assets</h2>
            <div className="flex gap-2">
              <span className="text-[9px] px-4 py-1.5 bg-cyan-500 text-white rounded-full font-black uppercase tracking-widest shadow-lg shadow-cyan-500/20">All</span>
              <span className="text-[9px] px-4 py-1.5 bg-white/5 border border-white/10 text-white/40 rounded-full font-black uppercase tracking-widest hover:text-white transition-colors cursor-pointer">New</span>
            </div>
          </div>
          
          {tasks.map((task, i) => (
            <motion.div 
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`glass-card p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-8 group hover:border-cyan-500/30 relative overflow-hidden transition-all ${isCompleted(task.id) ? 'opacity-60 grayscale-[50%]' : ''}`}
            >
              <div className={`w-16 h-16 md:w-20 md:h-20 bg-white/5 rounded-[1.5rem] flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform flex-shrink-0 relative z-10 ${isCompleted(task.id) ? 'bg-emerald-500/10 border-emerald-500/20' : 'group-hover:bg-cyan-500/10'}`}>
                {isCompleted(task.id) ? (
                  <CheckCircle2 size={32} className="text-emerald-400" />
                ) : (
                  <task.icon size={32} className="text-cyan-400 group-hover:text-cyan-300" />
                )}
              </div>
              <div className="flex-1 space-y-2 relative z-10">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] uppercase font-black tracking-widest leading-none ${isCompleted(task.id) ? 'text-emerald-400' : 'text-cyan-400'}`}>{task.category}</span>
                  <span className="text-[9px] uppercase font-bold text-white/20 tracking-tighter leading-none">· {task.type}</span>
                </div>
                <h3 className={`text-xl md:text-2xl font-display font-black tracking-tight leading-tight transition-colors ${isCompleted(task.id) ? 'text-emerald-400' : 'text-white group-hover:text-cyan-400'}`}>{task.title}</h3>
                <p className="text-xs md:text-sm text-white/30 font-light italic leading-relaxed">{task.desc}</p>
              </div>
              <div className="md:text-right flex md:flex-col items-center md:items-end justify-between md:justify-center gap-6 border-t md:border-t-0 md:border-l border-white/5 pt-6 md:pt-0 md:pl-10 shrink-0 relative z-10">
                <div className="space-y-1">
                  <p className="text-[9px] uppercase font-black text-white/20 tracking-widest">Yield Reward</p>
                  <p className={`text-2xl font-display font-black ${isCompleted(task.id) ? 'text-emerald-400' : 'text-cyan-400'}`}>₦{task.reward}</p>
                </div>
                <button 
                  onClick={() => handleCompleteTask(task)}
                  disabled={processingTaskId === task.id || isCompleted(task.id)}
                  className={`btn-primary py-3 md:py-4 px-10 text-[10px] uppercase tracking-[0.2em] font-black shadow-cyan-500/20 w-full md:w-auto flex items-center justify-center gap-2 disabled:opacity-50 ${isCompleted(task.id) ? 'bg-emerald-600/20 border-emerald-500/20 text-emerald-400 cursor-default shadow-none' : ''}`}
                >
                  {processingTaskId === task.id ? (
                    <><Loader2 size={16} className="animate-spin text-white" /> Verifying</>
                  ) : isCompleted(task.id) ? (
                    'Liquidated'
                  ) : (
                    'Initiate'
                  )}
                </button>
              </div>
              {/* Abstract backround */}
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/[0.01] rounded-full group-hover:bg-cyan-500/5 transition-colors"></div>
            </motion.div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div className="glass-card p-8 md:p-10 bg-gradient-to-br from-cyan-600/40 via-blue-900/60 to-black border-white/5 relative overflow-hidden shadow-2xl group transition-all hover:translate-y-[-5px]">
             <div className="relative z-10 space-y-8">
                <div className="w-16 h-16 rounded-[1.5rem] bg-white/10 flex items-center justify-center shadow-2xl backdrop-blur-md border border-white/10 group-hover:rotate-12 transition-transform duration-500">
                  <Award size={32} className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-display font-black leading-tight italic uppercase tracking-tighter">Yield <br /> Mastery.</h3>
                  <p className="text-white/40 text-xs md:text-sm font-light italic mt-4 leading-relaxed">Complete at least 5 sponsored tasks daily to qualify for the elite leaderboard bonus pools.</p>
                </div>
                <div className="space-y-3 pt-4">
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full w-3/5 bg-gradient-to-r from-cyan-400 to-blue-600 shadow-[0_0_15px_rgba(34,211,238,0.5)]"></div>
                  </div>
                  <p className="text-[9px] text-white/20 font-black uppercase tracking-widest text-center">Protocol Level 3 Progress: 60%</p>
                </div>
             </div>
             <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] -mr-20 -mt-20 rounded-full animate-pulse"></div>
          </div>

          <div className="glass-card p-8 md:p-10 border-white/5 bg-white/[0.02] shadow-xl">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-8 border-b border-white/5 pb-4">OPERATIONAL GUIDES</h3>
            <ul className="text-xs md:text-sm text-white/40 space-y-8 font-light italic">
              <li className="flex gap-4 items-start">
                 <div className="w-5 h-5 rounded-lg bg-cyan-500/10 flex-shrink-0 flex items-center justify-center mt-0.5">
                   <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                 </div>
                 <span>Screenshot verification must be high-resolution and untampered node data.</span>
              </li>
              <li className="flex gap-4 items-start">
                 <div className="w-5 h-5 rounded-lg bg-cyan-500/10 flex-shrink-0 flex items-center justify-center mt-0.5">
                   <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                 </div>
                 <span>Audit processing typically concludes within 24-48 standard cycles.</span>
              </li>
              <li className="flex gap-4 items-start">
                 <div className="w-5 h-5 rounded-lg bg-pink-500/10 flex-shrink-0 flex items-center justify-center mt-0.5">
                   <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-pulse"></div>
                 </div>
                 <span>Engineered manipulation will result in immediate network termination (permaban).</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

