import React from 'react';
import { motion } from 'framer-motion';
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
  Wifi
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

export default function Dashboard() {
  const { userData, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const services = [
    { name: 'Daily Task', icon: Trophy, path: '/tasks', color: 'bg-blue-50 text-blue-600' },
    { name: 'Sponsored Post', icon: Send, path: '/tasks', color: 'bg-pink-50 text-pink-600' },
    { name: 'Referral', icon: Users, path: '/referrals', color: 'bg-purple-50 text-purple-600' },
    { name: 'Contest', icon: Medal, path: '/games', color: 'bg-yellow-50 text-yellow-600' },
    { name: 'Digital Skill', icon: Globe, path: '/courses', color: 'bg-indigo-50 text-indigo-600' },
    { name: 'Course', icon: BookOpen, path: '/courses', color: 'bg-emerald-50 text-emerald-600' },
    { name: 'Marketplace', icon: ShoppingBag, path: '/marketplace', color: 'bg-orange-50 text-orange-600' },
    { name: 'Monetization', icon: Store, path: '/profile', color: 'bg-cyan-50 text-cyan-600' },
  ];

  const topEarners = [
    { name: 'herssern1115', amount: 68000, reward: 30000, rank: '1st', status: 'Champion', icon: '🏆' },
    { name: 'evergreenstar', amount: 57400, reward: 15000, rank: '2nd', status: 'Runner-up', icon: '🥈' },
    { name: 'sulesn01', amount: 56000, reward: 5000, rank: '3rd', status: 'Finalist', icon: '🥉' },
    { name: 'friday208', amount: 52400, reward: 0, rank: '#4', status: '', icon: '' },
  ];

  const copyReferral = () => {
    const link = `earnpalsolutions.com/register?ref=${userData?.uid}`;
    navigator.clipboard.writeText(link);
    alert('Referral link copied!');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pb-32">
      {/* App Header */}
      <header className="p-6 flex justify-between items-center bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-400">
            {userData?.displayName?.split(' ').map(n => n[0]).join('') || 'ND'}
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Welcome back 👋</p>
            <h2 className="text-lg font-bold leading-none">{userData?.displayName || 'Operator'}</h2>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="p-2 text-slate-600 dark:text-slate-400">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
            <span className="text-lg">🇳🇬</span>
            <ChevronRight size={14} className="text-slate-400 rotate-90" />
          </div>
          <button className="relative p-2 text-slate-600 dark:text-slate-400">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
          </button>
        </div>
      </header>

      <div className="p-6 space-y-8 max-w-lg mx-auto lg:max-w-none lg:grid lg:grid-cols-2 lg:gap-12 lg:space-y-0">
        <div className="space-y-8">
          {/* Wallet Card */}
          <section className="bg-slate-950 dark:bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
            
            <div className="space-y-8">
              <div className="flex items-center gap-2 text-slate-400">
                <Wallet size={18} />
                <span className="text-sm font-medium">Wallet Balance</span>
              </div>
              
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black">₦</span>
                <span className="text-6xl font-black tracking-tight">
                  {(userData?.balances?.main || 0).toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4">
                {[
                  { label: 'Withdraw', icon: ArrowUpRight, path: '/wallet' },
                  { label: 'Referrals', icon: Users, path: '/referrals' },
                  { label: 'Upgrade', icon: Trophy, path: '/courses' },
                ].map(action => (
                  <Link key={action.label} to={action.path} className="flex flex-col items-center gap-3 group">
                    <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center group-active:scale-95 transition-transform">
                      <action.icon size={24} />
                    </div>
                    <span className="text-xs font-semibold text-slate-400">{action.label}</span>
                  </Link>
                ))}
              </div>

              <Link 
                to="/wallet" 
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors"
                id="recharge-button"
              >
                <Plus size={20} strokeWidth={3} />
                Recharge Wallet
              </Link>
            </div>
          </section>

          {/* Sub Balances */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950 dark:bg-slate-900 p-6 rounded-[2rem] text-white">
              <div className="flex justify-between items-start mb-4">
                <p className="text-xs text-slate-400">Daily Task</p>
                <ArrowUpRight size={18} className="text-slate-600" />
              </div>
              <p className="text-2xl font-bold tracking-tight">₦{(userData?.balances?.bonus || 0).toLocaleString()}</p>
            </div>
            <div className="bg-slate-950 dark:bg-slate-900 p-6 rounded-[2rem] text-white">
              <div className="flex justify-between items-start mb-4">
                <p className="text-xs text-slate-400">Sales Commission</p>
                <ArrowUpRight size={18} className="text-slate-600" />
              </div>
              <p className="text-2xl font-bold tracking-tight">₦{(userData?.balances?.referral || 0).toLocaleString()}</p>
            </div>
          </div>

          {/* Services Grid */}
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Our Services</h3>
              <ChevronRight size={20} className="text-slate-400" />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {services.map(service => (
                <Link key={service.name} to={service.path} className="flex flex-col items-center gap-2 group">
                  <div className={`w-14 h-14 rounded-2xl ${service.color} flex items-center justify-center group-active:scale-95 transition-transform`}>
                    <service.icon size={26} />
                  </div>
                  <span className="text-[10px] font-bold text-center leading-tight">{service.name}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-8 pt-8 lg:pt-0">
          {/* Share & Earn */}
          <section className="bg-indigo-600 p-8 rounded-[2.5rem] text-white space-y-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <Share2 size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold">Share & Earn</h3>
                <p className="text-xs text-white/60">Invite friends and get paid instantly</p>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex-1 bg-white/10 rounded-xl px-4 py-3 text-sm truncate font-medium">
                earnpalsolutions.com/register?r...
              </div>
              <button 
                onClick={copyReferral}
                className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold text-sm active:scale-95 transition-transform"
              >
                Copy
              </button>
            </div>

            <button className="w-full py-4 bg-white/10 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-white/20 transition-colors">
              <Send size={18} className="rotate-[-20deg]" />
              Share to WhatsApp
            </button>
          </section>

          {/* Leaderboard */}
          <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 space-y-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Trophy className="text-yellow-600" size={24} />
                <h3 className="text-xl font-bold">Weekly Top Earners</h3>
              </div>
              <button className="text-indigo-600 font-bold text-sm flex items-center gap-1">
                View All <ChevronRight size={16} />
              </button>
            </div>
            
            <p className="text-xs text-slate-400 -mt-4">Most active community members</p>

            <div className="space-y-6">
              {topEarners.map((earner, i) => (
                <div key={earner.name} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                      i === 0 ? 'bg-yellow-100 text-yellow-600' : 
                      i === 1 ? 'bg-slate-100 text-slate-600' :
                      i === 2 ? 'bg-orange-100 text-orange-600' : 'text-slate-400'
                    }`}>
                      {earner.rank}
                    </div>
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100">
                        <img 
                          src={`https://ui-avatars.com/api/?name=${earner.name}&background=random`} 
                          alt="" 
                        />
                      </div>
                      {earner.icon && (
                        <span className="absolute -top-1 -right-1 text-xs">{earner.icon}</span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{earner.name}</span>
                        {earner.status && (
                          <span className={`${
                            i === 0 ? 'bg-yellow-100 text-yellow-600' : 
                            i === 1 ? 'bg-indigo-100 text-indigo-600' : 'bg-red-100 text-red-600'
                          } text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest`}>
                            {earner.status}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Earned this week <span className="text-emerald-500 font-bold">₦{earner.reward.toLocaleString()} Reward</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-indigo-900 dark:text-indigo-400">₦{earner.amount.toLocaleString()}</p>
                    <p className="text-[10px] text-emerald-500 font-bold">Verified</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

