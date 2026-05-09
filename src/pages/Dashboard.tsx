import React from 'react';
import { motion } from 'motion/react';
import { 
  Wallet, 
  Users, 
  Zap, 
  ArrowUpRight,
  Shield,
  Activity,
  Plus,
  Bell,
  Moon,
  Sun,
  ChevronRight,
  Trophy,
  Send,
  Globe,
  BookOpen,
  ShoppingBag,
  Store,
  Copy,
  Share2,
  Medal,
  Smartphone,
  Wifi,
  ExternalLink,
  MessageCircle,
  LayoutGrid
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

export default function Dashboard() {
  const { userData, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const services = [
    { name: 'Daily Task', icon: Trophy, path: '/tasks', color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' },
    { name: 'Ad Mission', icon: Send, path: '/tasks', color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' },
    { name: 'Referral', icon: Users, path: '/referrals', color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' },
    { name: 'Games', icon: Medal, path: '/games', color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' },
    { name: 'Academy', icon: Globe, path: '/courses', color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' },
    { name: 'Courses', icon: BookOpen, path: '/courses', color: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400' },
    { name: 'Market', icon: ShoppingBag, path: '/marketplace', color: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-400' },
    { name: 'Profile', icon: Store, path: '/profile', color: 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
  ];

  const topEarners = [
    { name: 'herssern1115', amount: 68000, reward: 30000, rank: '1', status: 'Expert', icon: '💎' },
    { name: 'evergreenstar', amount: 57400, reward: 15000, rank: '2', status: 'Pro', icon: '⭐' },
    { name: 'sulesn01', amount: 56000, reward: 5000, rank: '3', status: 'Rising', icon: '🚀' },
  ];

  const copyReferral = () => {
    const link = `earnpalsolutions.com/register?ref=${userData?.uid}`;
    navigator.clipboard.writeText(link);
    alert('Referral link copied!');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pb-32">
      {/* Top Bar */}
      <div className="p-6 flex justify-between items-center sticky top-0 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md z-30">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-600/20">
            {userData?.displayName?.[0] || 'U'}
          </div>
          <div>
            <h2 className="text-sm font-bold leading-none">{userData?.displayName || 'User'}</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Free Member</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="p-2.5 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <div className="relative p-2.5 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full border-2 border-white dark:border-slate-900"></span>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-8 max-w-2xl mx-auto lg:max-w-none lg:grid lg:grid-cols-2 lg:gap-8 lg:px-8">
        <div className="space-y-8">
          {/* Main Balance Card */}
          <section className="bg-slate-900 dark:bg-indigo-950/40 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
            
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Balance</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black tracking-tight">
                      ₦{(userData?.balances?.main || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-white/10 rounded-2xl">
                   <Wallet size={24} className="text-indigo-400" />
                </div>
              </div>

              <div className="flex gap-2">
                <Link to="/wallet" className="flex-1 bg-indigo-600 hover:bg-indigo-500 py-4 rounded-2xl font-bold text-sm text-center shadow-lg shadow-indigo-600/20 active:scale-95 transition-all">
                  Deposit
                </Link>
                <Link to="/wallet" className="flex-1 bg-white/10 hover:bg-white/20 py-4 rounded-2xl font-bold text-sm text-center active:scale-95 transition-all">
                  Withdraw
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                   <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Affiliate</p>
                   <p className="text-xl font-bold">₦{(userData?.balances?.referral || 0).toLocaleString()}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                   <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Task Earnings</p>
                   <p className="text-xl font-bold">₦{(userData?.balances?.bonus || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Services */}
          <section className="space-y-6">
            <div className="flex justify-between items-center px-2">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <LayoutGrid size={20} className="text-indigo-600" />
                Quick Actions
              </h3>
              <Link to="/tasks" className="text-indigo-600 text-[10px] font-black uppercase tracking-widest">All Services</Link>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {services.map(service => (
                <Link key={service.name} to={service.path} className="flex flex-col items-center gap-3">
                  <div className={`w-14 h-14 rounded-[1.4rem] ${service.color} flex items-center justify-center shadow-sm active:scale-90 transition-transform`}>
                    <service.icon size={26} />
                  </div>
                  <span className="text-[10px] font-bold text-center leading-tight">{service.name}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-8 pb-12">
          {/* Viral Sharing */}
          <section className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000" />
            
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Share2 size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Earn Commission</h3>
                  <p className="text-xs text-indigo-100/60">Invite & get paid for every sync</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex bg-white/10 rounded-2xl p-2 gap-2 border border-white/10">
                  <div className="flex-1 px-4 py-3 text-xs font-bold truncate opacity-80">
                    earnpalsolutions.com/ref/{userData?.uid?.slice(0, 8)}
                  </div>
                  <button 
                    onClick={copyReferral}
                    className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold text-xs shadow-lg active:scale-95 transition-all"
                  >
                    Copy Link
                  </button>
                </div>
                <button className="w-full py-4 bg-emerald-500 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">
                  <MessageCircle size={18} fill="currentColor" />
                  Share to WhatsApp
                </button>
              </div>
            </div>
          </section>

          {/* Leaders */}
          <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Trophy size={20} className="text-amber-500" />
                Community Rank
              </h3>
              <button className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Refresh</button>
            </div>

            <div className="space-y-6">
              {topEarners.map((earner, i) => (
                <div key={earner.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-800 shadow-sm">
                        <img 
                          src={`https://ui-avatars.com/api/?name=${earner.name}&background=random`} 
                          alt="" 
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-800 text-[10px]">
                        {earner.icon}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{earner.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                          i === 0 ? 'bg-amber-100 text-amber-600' : 
                          i === 1 ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'
                        }`}>
                          {earner.status}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">₦{earner.reward.toLocaleString()} Won</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-900 dark:text-white">₦{earner.amount.toLocaleString()}</p>
                    <p className="text-[9px] font-bold text-emerald-600 uppercase">Payout verified</p>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full py-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-100 dark:border-slate-700/50 hover:bg-slate-100 transition-colors">
              View Hall of Fame
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}


