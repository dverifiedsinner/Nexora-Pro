import React from 'react';
import { motion } from 'motion/react';
import { 
  Wallet, 
  TrendingUp, 
  Users, 
  Award, 
  Zap, 
  ArrowUpRight, 
  ArrowDownRight,
  ChevronRight,
  Clock,
  Star,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { userData } = useAuth();

  const balanceCards = [
    { 
      name: 'Main Wallet', 
      amount: userData?.balances.main || 0, 
      icon: Wallet, 
      color: 'from-cyan-500 to-blue-600',
      desc: 'Top-ups & earnings'
    },
    { 
      name: 'Bonus Balance', 
      amount: userData?.balances.bonus || 0, 
      icon: Zap, 
      color: 'from-indigo-500 to-blue-700',
      desc: 'Activation & registration'
    },
    { 
      name: 'Referral Rewards', 
      amount: userData?.balances.referral || 0, 
      icon: Users, 
      color: 'from-pink-500 to-rose-600',
      desc: 'Network earnings'
    },
    { 
      name: 'Course Earnings', 
      amount: userData?.balances.investment || 0, 
      icon: Award, 
      color: 'from-emerald-500 to-teal-600',
      desc: 'Learning income'
    }
  ];

  const activities = userData?.transactions?.slice(-5).reverse().map(t => ({
    type: t.type,
    title: t.title,
    amount: t.amount,
    time: new Date(t.time).toLocaleDateString() + ' ' + new Date(t.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: t.status
  })) || [
    { type: 'bonus', title: 'Registration Bonus', amount: 500, time: 'System', status: 'completed' },
  ];

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative">
        <div className="z-10">
          <h2 className="text-4xl font-display font-black tracking-tight leading-none mb-2 text-gradient">Welcome, {userData?.displayName?.split(' ')[0]} 👋</h2>
          <p className="text-white/40 text-sm font-light italic">Your digital empire is ready for expansion.</p>
        </div>
        <div className="flex gap-4 z-10">
          {userData?.isAdmin && (
            <Link to="/admin" className="btn-outline flex items-center gap-3 py-3.5 px-8 active:scale-95 transition-all text-xs font-black uppercase tracking-widest border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 shadow-emerald-500/10 shadow-lg">
              Command Center
            </Link>
          )}
          <Link to="/wallet" className="btn-primary flex items-center gap-3 py-3.5 px-8 shadow-cyan-500/20 active:scale-95 transition-all group">
            <Zap size={20} className="group-hover:fill-white transition-all" /> 
            <span className="text-xs font-black uppercase tracking-widest">Recharge Node</span>
          </Link>
          <Link to="/wallet" className="btn-outline flex items-center gap-3 py-3.5 px-8 active:scale-95 transition-all text-xs font-black uppercase tracking-widest">
            Withdraw
          </Link>
        </div>
        
        {/* Background Accent */}
        <div className="absolute -top-10 -right-20 w-80 h-80 bg-cyan-500/5 blur-[120px] rounded-full animate-float-slow pointer-events-none"></div>
      </header>

      {/* Feature Banner */}
      <section className="relative overflow-hidden glass-card p-1 rounded-[2.5rem] border-white/5 shadow-2xl">
        <div className="bg-gradient-to-br from-cyan-600/20 via-blue-900/40 to-black rounded-[2.4rem] p-10 md:p-16 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">
          <div className="flex-1 space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300 border border-white/5">
              <Star size={10} className="fill-cyan-300" /> Featured Asset
            </div>
            <h3 className="text-4xl md:text-6xl font-display font-black leading-[0.9] tracking-tighter uppercase italic">
              Quantum <br /> <span className="text-cyan-400">Yield</span> Pro.
            </h3>
            <p className="text-white/50 text-base font-light italic max-w-sm">
              Stake your bonus wallet and earn up to 5X rewards on exclusive early-access courses.
            </p>
            <Link to="/courses" className="btn-primary inline-flex py-4 px-10 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-cyan-500/20">
              Upgrade Now
            </Link>
          </div>
          <div className="flex-1 relative group perspective-1000">
            <div className="relative z-10 transform rotate-y-12 group-hover:rotate-y-0 transition-transform duration-700">
              <img 
                src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=600" 
                alt="Feature" 
                className="rounded-3xl shadow-2xl border border-white/10 opacity-80 group-hover:opacity-100 transition-opacity animate-float"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-3xl"></div>
            </div>
            {/* Floating UI */}
            <div className="absolute -top-6 -right-6 glass p-4 rounded-2xl border-white/10 shadow-2xl animate-float-slow z-20 hidden md:block">
              <TrendingUp size={32} className="text-cyan-400 opacity-60" />
            </div>
            <div className="absolute -bottom-6 -left-6 glass p-4 rounded-2xl border-white/10 shadow-2xl animate-float z-20 hidden md:block" style={{ animationDelay: '1s' }}>
              <Award size={32} className="text-pink-400 opacity-60" />
            </div>
          </div>
          
          {/* Animated Background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent opacity-50"></div>
          <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-cyan-500/10 blur-[100px] rounded-full animate-pulse-glow"></div>
        </div>
      </section>

      {/* Balance Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 perspective-1000">
        {balanceCards.map((card, i) => (
          <motion.div 
            key={card.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`glass-card p-6 flex flex-col justify-between group rotate-3d animate-float shadow-2xl hover:shadow-cyan-500/10 cursor-default bg-gradient-to-br from-white/[0.03] to-transparent border-white/5`}
            style={{ animationDelay: `${i * 0.5}s` }}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl bg-gradient-to-br ${card.color} shadow-lg shadow-cyan-500/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                <card.icon size={20} className="text-white" />
              </div>
              <span className="text-[9px] uppercase tracking-[0.2em] text-white/30 font-black bg-white/5 px-3 py-1 rounded-full border border-white/5">{card.name}</span>
            </div>
            <div>
              <p className="text-[10px] text-white/30 mb-1 font-black uppercase tracking-widest leading-none mb-2">{card.desc}</p>
              <h2 className="text-3xl font-display font-black tracking-tighter group-hover:text-cyan-400 transition-colors">
                ₦{card.amount.toLocaleString()}
              </h2>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Featured Courses Carousel */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xl font-display font-black italic tracking-tight uppercase tracking-widest text-xs opacity-40">Featured Curriculum</h3>
          <Link to="/courses" className="text-[10px] font-black text-cyan-400 hover:text-cyan-300 tracking-[0.2em] uppercase flex items-center gap-2">
            View All <ChevronRight size={14} />
          </Link>
        </div>
        
        <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide snap-x">
          {[
            { title: 'Digital Marketing mastery', reward: '₦5,000', icon: TrendingUp, color: 'bg-cyan-500' },
            { title: 'Crypto Trading Alpha', reward: '₦12,000', icon: Zap, color: 'bg-indigo-500' },
            { title: 'UI Design Lab', reward: '₦7,000', icon: Award, color: 'bg-pink-500' },
            { title: 'Freelance Succes', reward: '₦4,500', icon: BookOpen, color: 'bg-emerald-500' },
          ].map((course, i) => (
            <motion.div 
              key={i} 
              whileHover={{ y: -5 }}
              className="min-w-[280px] md:min-w-[320px] snap-center glass-card p-6 bg-white/[0.02] border-white/5 hover:border-cyan-500/30 group transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="relative z-10 space-y-4">
                <div className={`w-12 h-12 rounded-2xl ${course.color} flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform`}>
                  <course.icon size={22} className="text-white" />
                </div>
                <h4 className="text-lg font-display font-bold leading-tight line-clamp-1">{course.title}</h4>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[9px] uppercase font-black text-white/20 tracking-widest">Potential Yield</p>
                    <p className="text-xl font-display font-black text-cyan-400">{course.reward}</p>
                  </div>
                  <button className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-white/40 group-hover:text-white group-hover:bg-cyan-500 transition-all">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 blur-3xl rounded-full group-hover:bg-cyan-500/5"></div>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Quick Actions & Recent Activity */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-display font-black flex items-center gap-3">
                <div className="h-0.5 w-8 bg-cyan-500 rounded-full"></div> Recent Activity
              </h3>
              <button className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 font-medium">
                View All <ChevronRight size={16} />
              </button>
            </div>
            <div className="glass-card p-2 space-y-1">
              {activities.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl transition-all cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl ${
                      item.amount > 0 ? 'bg-cyan-400/10 text-cyan-400' : 'bg-red-400/10 text-red-400'
                    }`}>
                      {item.amount > 0 ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                    </div>
                    <div>
                      <p className="font-bold group-hover:text-cyan-300 transition-colors">{item.title}</p>
                      <p className="text-xs text-white/40">{item.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${item.amount > 0 ? 'text-cyan-400' : 'text-red-400'}`}>
                      {item.amount > 0 ? '+' : ''}₦{Math.abs(item.amount)}
                    </p>
                    <p className="text-[10px] uppercase font-bold text-white/20 tracking-tighter">{item.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Statistics Chart Placeholder */}
          <section className="glass-card p-8 h-64 flex flex-col items-center justify-center text-center space-y-4">
             <TrendingUp size={48} className="text-cyan-500/20" />
             <div>
               <h4 className="font-bold text-white/40 uppercase tracking-widest text-xs mb-2">Earning Insights</h4>
               <p className="text-sm text-white/20 font-light italic">Your visual data will appear here as you earn.</p>
             </div>
          </section>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
          {/* Referral Widget */}
          <section className="glass-card p-6 bg-gradient-to-br from-cyan-600/20 to-blue-600/20 border-cyan-500/20">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Users size={18} className="text-cyan-400" /> Invite Friends
            </h3>
            <p className="text-sm text-white/60 mb-6 leading-relaxed font-light">
              Earn ₦500 for every friend who joins NEXORA with your link.
            </p>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 mb-4">
              <p className="text-[10px] uppercase font-bold text-white/30 mb-1">Your Link</p>
              <p className="text-sm font-mono truncate text-cyan-300">{window.location.origin}?ref={userData?.referralCode}</p>
            </div>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}?ref=${userData?.referralCode}`);
                alert('Referral link copied!');
              }}
              className="w-full btn-primary py-2.5 text-sm"
            >
              Copy Link
            </button>
          </section>

          {/* Quick Tasks Widget */}
          <section className="glass-card p-6">
            <h3 className="text-lg font-bold mb-4">Quick Tasks</h3>
            <div className="space-y-4">
              {[
                { title: 'Follow on Twitter', reward: 50 },
                { title: 'Share on WhatsApp', reward: 50 },
                { title: 'Rate NEXORA', reward: 100 },
              ].map((task, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                  <div>
                    <p className="text-xs font-semibold">{task.title}</p>
                    <p className="text-[10px] text-cyan-400 font-bold">Earn ₦{task.reward}</p>
                  </div>
                  <button className="p-1 px-3 bg-white text-black text-[10px] font-bold rounded-lg hover:bg-white/90 transition-colors uppercase">
                    Go
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
