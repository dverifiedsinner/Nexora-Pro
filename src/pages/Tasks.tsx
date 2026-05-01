import React from 'react';
import { motion } from 'motion/react';
import { CheckSquare, Share2, Youtube, Smartphone, Eye, Award, Clock, ArrowRight } from 'lucide-react';

export default function Tasks() {
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
      icon: Youtube
    },
    {
      id: 't2',
      title: 'Share Dashboard on WhatsApp',
      desc: 'Post a screenshot of your dashboard on your WhatsApp status and get verified.',
      reward: 50,
      type: 'daily',
      category: 'Social',
      icon: Share2
    },
    {
      id: 't3',
      title: 'Install Partner App',
      desc: 'Download and register on our partner fintech app for a massive bonus.',
      reward: 500,
      type: 'one-time',
      category: 'App',
      icon: Smartphone
    },
    {
      id: 't4',
      title: 'Visit Daily Ad Portal',
      desc: 'View 5 featured ads from our sponsors to complete your daily routine.',
      reward: 200,
      type: 'daily',
      category: 'Ad',
      icon: Eye
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      <header>
        <h1 className="text-3xl font-display font-bold">Earn Center</h1>
        <p className="text-white/40">Complete micro-tasks and earn instant rewards to your bonus wallet.</p>
      </header>

      {/* Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {taskCategories.map((cat, i) => (
          <div key={i} className="glass-card p-6 flex items-center justify-between group active:scale-95 transition-all">
            <div className="flex items-center gap-4">
              <div className={`p-3 bg-white/5 rounded-2xl ${cat.color} group-hover:scale-110 transition-transform`}>
                <cat.icon size={24} />
              </div>
              <div>
                <h3 className="font-bold text-sm">{cat.title}</h3>
                <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest leading-none mt-1">{cat.count} Available</p>
              </div>
            </div>
            <ArrowRight size={18} className="text-white/20 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Task List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-xl font-display font-bold">Recommended for You</h2>
            <div className="flex gap-2">
              <span className="text-[10px] px-4 py-1.5 bg-cyan-500 text-white rounded-full font-black uppercase tracking-widest shadow-lg shadow-cyan-500/20">All</span>
              <span className="text-[10px] px-4 py-1.5 bg-white/5 border border-white/10 text-white/40 rounded-full font-black uppercase tracking-widest hover:text-white transition-colors">New</span>
            </div>
          </div>
          
          {tasks.map((task, i) => (
            <motion.div 
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 flex flex-col md:flex-row md:items-center gap-8 group hover:border-cyan-500/30"
            >
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform flex-shrink-0 group-hover:bg-cyan-500/10">
                <task.icon size={28} className="text-cyan-400 group-hover:text-cyan-300" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-black text-cyan-400 tracking-widest leading-none">{task.category}</span>
                  <span className="text-[10px] uppercase font-bold text-white/20 tracking-tighter leading-none">· {task.type}</span>
                </div>
                <h3 className="text-xl font-display font-bold group-hover:text-cyan-200 transition-colors">{task.title}</h3>
                <p className="text-sm text-white/40 font-light leading-relaxed">{task.desc}</p>
              </div>
              <div className="md:text-right flex md:flex-col items-center md:items-end justify-between md:justify-center gap-6 border-t md:border-t-0 md:border-l border-white/5 pt-6 md:pt-0 md:pl-8 shrink-0">
                <div className="space-y-0.5">
                  <p className="text-[10px] uppercase font-black text-white/20 tracking-widest">Reward</p>
                  <p className="text-2xl font-display font-black text-cyan-400">₦{task.reward}</p>
                </div>
                <button className="btn-primary py-2.5 px-8 text-[11px] uppercase tracking-[0.1em] font-black shadow-cyan-500/10">Start</button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div className="glass-card p-8 bg-gradient-to-br from-cyan-600 to-blue-700 border-none relative overflow-hidden shadow-2xl shadow-cyan-500/10">
             <div className="relative z-10 space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shadow-lg backdrop-blur-md">
                  <Award size={32} className="text-white" />
                </div>
                <h3 className="text-2xl font-display font-bold leading-tight">Master<br /> ₦20,000 every week.</h3>
                <p className="text-white/70 text-sm font-light">Complete at least 5 sponsored tasks daily to qualify for the elite leaderboard bonus pools.</p>
                <div className="space-y-3">
                  <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden p-0.5">
                    <div className="h-full w-3/5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                  </div>
                  <p className="text-[10px] text-white/60 font-black uppercase tracking-widest">Level 3 Mastery: 60%</p>
                </div>
             </div>
             <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 blur-[80px] -mr-20 -mt-20 rounded-full"></div>
          </div>

          <div className="glass-card p-8 bg-white/5">
            <h3 className="text-lg font-display font-bold mb-6 tracking-wide underline decoration-cyan-500/30 underline-offset-8">GUIDELINES</h3>
            <ul className="text-sm text-white/40 space-y-6 font-light">
              <li className="flex gap-3 leading-relaxed">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2 shrink-0"></div>
                Screenshot proof must be 100% clear and untampered.
              </li>
              <li className="flex gap-3 leading-relaxed">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2 shrink-0"></div>
                Rewards may take up to 24-48h for manual audit.
              </li>
              <li className="flex gap-3 leading-relaxed">
                <div className="w-1.5 h-1.5 bg-pink-500 rounded-full mt-2 shrink-0"></div>
                Manipulated entries result in permanent ban.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
