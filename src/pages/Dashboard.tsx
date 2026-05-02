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
  BookOpen,
  LogOut,
  Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { userData, signOut } = useAuth();

  const balanceCards = [
    { 
      name: 'Main Wallet', 
      amount: userData?.balances?.main || 0, 
      icon: Wallet, 
      color: 'from-cyan-500 to-blue-600',
      desc: 'Top-ups & earnings'
    },
    { 
      name: 'Bonus Balance', 
      amount: userData?.balances?.bonus || 0, 
      icon: Zap, 
      color: 'from-indigo-500 to-blue-700',
      desc: 'Activation & registration'
    },
    { 
      name: 'Referral Rewards', 
      amount: userData?.balances?.referral || 0, 
      icon: Users, 
      color: 'from-pink-500 to-rose-600',
      desc: 'Network earnings'
    },
    { 
      name: 'Course Earnings', 
      amount: userData?.balances?.investment || 0, 
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
    <div className="space-y-8 pb-12 overflow-x-hidden">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8 relative px-2">
        <div className="z-10 text-center md:text-left">
          <h2 className="text-2xl md:text-4xl font-display font-black tracking-tight leading-tight mb-2 text-gradient">Welcome, {userData?.displayName?.split(' ')[0]} 👋</h2>
          <p className="text-white/40 text-[9px] md:text-sm font-light italic uppercase tracking-widest">Your digital empire is ready for expansion.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 z-10">
          {(userData?.isAdmin || userData?.email === 'denacchy@gmail.com') && (
            <Link to="/admin" className="btn-outline flex items-center justify-center gap-3 py-3 px-6 md:py-3.5 md:px-8 active:scale-95 transition-all text-[10px] font-black uppercase tracking-widest border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 shadow-emerald-500/10 shadow-lg whitespace-nowrap">
              Command Center
            </Link>
          )}
          <div className="flex gap-3 w-full sm:w-auto">
            <Link to="/wallet" className="flex-1 sm:flex-none btn-primary flex items-center justify-center gap-3 py-3 px-6 md:py-3.5 md:px-8 shadow-cyan-500/20 active:scale-95 transition-all group">
              <Zap size={16} className="md:w-5 md:h-5 group-hover:fill-white transition-all" /> 
              <span className="text-[10px] font-black uppercase tracking-widest">Recharge</span>
            </Link>
            <Link to="/wallet" className="flex-1 sm:flex-none btn-outline flex items-center justify-center gap-3 py-3 px-6 md:py-3.5 md:px-8 active:scale-95 transition-all text-[10px] font-black uppercase tracking-widest">
              Withdraw
            </Link>
          </div>
        </div>
        
        {/* Background Accent */}
        <div className="absolute -top-10 -right-20 w-80 h-80 bg-cyan-500/5 blur-[120px] rounded-full animate-float-slow pointer-events-none"></div>
      </header>

      {/* Quick Action Icons (3D Style) */}
      <section className="px-2 lg:px-0">
        <div className="flex items-center justify-between mb-8">
           <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Primary Utilities</h3>
           <div className="h-px flex-1 bg-white/5 ml-8"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Recharge', emoji: '⚡', color: 'from-cyan-500 to-blue-600', link: '/wallet' },
            { label: 'Courses', emoji: '📚', color: 'from-indigo-500 to-purple-600', link: '/courses' },
            { label: 'Referrals', emoji: '👥', color: 'from-rose-500 to-pink-600', link: '/referrals' },
            { label: 'Play & Win', emoji: '🎮', color: 'from-amber-400 to-orange-600', link: '/games' }
          ].map((action, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05, rotateY: 10, rotateX: -5 }}
              className="relative group cursor-pointer"
            >
              <Link to={action.link}>
                <div className="relative glass-card p-6 md:p-8 flex flex-col items-center justify-center text-center gap-4 overflow-hidden group">
                  {/* Background Gradient Glow */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                  
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                    className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br ${action.color} shadow-[0_10px_30px_rgba(0,0,0,0.3)] flex items-center justify-center text-4xl shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)] relative z-10`}
                  >
                    {action.emoji}
                  </motion.div>
                  
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white group-hover:text-cyan-400 transition-colors relative z-10">{action.label}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Courses Carousel (Full-Bleed style) */}
      <section className="-mx-6 md:-mx-12 overflow-hidden transition-colors duration-1000 bg-gradient-to-r from-cyan-900/10 via-black to-pink-900/10 py-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-10">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-3xl md:text-5xl font-display font-black tracking-tighter uppercase italic">Hot Nodes.</h3>
              <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em]">Top Tier Earning Modules</p>
            </div>
            <Link to="/courses" className="h-14 w-14 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-cyan-400 hover:border-cyan-400 transition-all group">
              <ArrowUpRight size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </div>
          
          <div className="flex gap-8 overflow-x-auto pb-12 scrollbar-hide snap-x">
            {[
              { title: 'Digital Marketing mastery', reward: '₦45,000', icon: TrendingUp, color: 'from-cyan-600 to-blue-900', rating: 4.9, earnings: '5×' },
              { title: 'Crypto Trading Alpha', reward: '₦120,500', icon: Zap, color: 'from-purple-600 to-indigo-900', rating: 5.0, earnings: '5×' },
              { title: 'Cyber Security Protocol', reward: '₦88,000', icon: Shield, color: 'from-emerald-600 to-teal-900', rating: 4.8, earnings: '5×' },
              { title: 'Neural Ad-Scaling', reward: '₦32,000', icon: Zap, color: 'from-pink-600 to-rose-900', rating: 4.7, earnings: '5×' },
            ].map((course, i) => (
              <motion.div 
                key={i} 
                whileHover={{ scale: 1.02 }}
                className="min-w-[320px] md:min-w-[450px] snap-center relative overflow-hidden rounded-[2.5rem] border border-white/10 group cursor-pointer aspect-[16/10]"
              >
                {/* Immersive Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${course.color} transition-all duration-700 group-hover:scale-110`} />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                
                {/* Content */}
                <div className="relative h-full p-10 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
                      <Star size={10} className="fill-amber-400 text-amber-400" />
                      <span className="text-[10px] font-black text-white">{course.rating}</span>
                    </div>
                    <div className="px-3 py-1 bg-cyan-500 rounded-full text-[9px] font-black tracking-widest text-white shadow-lg shadow-cyan-500/30">
                      {course.earnings} EARN
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-3xl md:text-4xl font-display font-black leading-none tracking-tighter text-white group-hover:translate-x-2 transition-transform duration-500">{course.title}</h4>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[9px] uppercase font-black text-white/40 tracking-[0.2em] mb-1">Projected Reward</p>
                        <p className="text-2xl md:text-3xl font-display font-black text-cyan-300">{course.reward}</p>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-all">
                        <ChevronRight size={24} />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Shimmer line */}
                <motion.div 
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Balance Grid (Moved below featured section for better flow) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-2 lg:px-0">
        {balanceCards.map((card, i) => (
          <motion.div 
            key={card.name}
            whileHover={{ y: -5 }}
            className={`glass-card p-6 flex flex-col justify-between group h-48 border-white/5 hover:border-cyan-500/30 transition-all bg-gradient-to-br from-white/[0.02] to-transparent`}
          >
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-2xl bg-gradient-to-br ${card.color} shadow-xl group-hover:rotate-12 transition-transform`}>
                <card.icon size={20} className="text-white" />
              </div>
            </div>
            <div>
              <p className="text-[9px] text-white/20 font-black uppercase tracking-[0.2em] mb-1">{card.name}</p>
              <h2 className="text-2xl md:text-3xl font-display font-black tracking-tighter group-hover:text-cyan-400 transition-colors">
                ₦{card.amount.toLocaleString()}
              </h2>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Logout & Safety Section */}
      <section className="px-2 lg:px-0 mt-8">
        <div className="glass-card p-8 md:p-12 border-white/5 bg-gradient-to-br from-white/[0.01] to-transparent flex flex-col md:flex-row items-center justify-between gap-8 group relative overflow-hidden">
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 rounded-[2rem] bg-pink-500/10 border border-pink-500/20 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl shadow-pink-500/5">
              <LogOut size={32} className="text-pink-500" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-display font-black uppercase italic tracking-tighter text-white">Secure Logout.</h3>
              <p className="text-xs md:text-sm text-white/30 font-light italic mt-1 leading-relaxed max-w-sm">
                Disconnect your current session from the neural node. Always log out when using public terminals.
              </p>
            </div>
          </div>
          <button 
            onClick={() => signOut()}
            className="relative z-10 btn-outline border-white/10 text-white/40 hover:text-pink-500 hover:border-pink-500/30 px-10 py-4 text-[10px] uppercase font-black tracking-[0.3em] transition-all active:scale-95 whitespace-nowrap bg-white/[0.02]"
          >
            Terminate Session
          </button>
          
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-48 h-48 bg-pink-500/5 blur-[80px] rounded-full pointer-events-none"></div>
        </div>
      </section>

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
