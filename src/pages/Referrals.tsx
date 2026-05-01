import React from 'react';
import { motion } from 'motion/react';
import { Users, Gift, Share2, Copy, Check, TrendingUp, Award, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Referrals() {
  const { userData } = useAuth();
  const [copied, setCopied] = React.useState(false);

  const referralLink = `${window.location.origin}?ref=${userData?.referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const steps = [
    { title: 'Share Link', desc: 'Copy and share your unique referral link with friends.', icon: Share2 },
    { title: 'Friends Join', desc: 'Your friends sign up using your referral code.', icon: Users },
    { title: 'Get Rewarded', desc: 'Earn ₦500 instantly in your referral wallet.', icon: Gift },
  ];

  return (
    <div className="space-y-8 pb-12">
      <header>
        <h1 className="text-3xl font-display font-bold">Referral Program</h1>
        <p className="text-white/40">Invite your circle and build your passive income stream.</p>
      </header>

      {/* Rewards Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="glass-card p-6 border-cyan-500/30 bg-cyan-500/5">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-cyan-500 rounded-2xl shadow-lg shadow-cyan-500/20">
              <Award size={20} className="text-white" />
            </div>
            <p className="text-[10px] uppercase font-black text-cyan-400 tracking-widest">Total Referrals</p>
          </div>
          <h2 className="text-4xl font-display font-bold">12</h2>
          <p className="text-xs text-white/30 mt-1 font-medium italic">Active network size</p>
        </div>
        <div className="glass-card p-6 border-pink-500/30 bg-pink-500/5">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-pink-500 rounded-2xl shadow-lg shadow-pink-500/20">
              <TrendingUp size={20} className="text-white" />
            </div>
            <p className="text-[10px] uppercase font-black text-pink-400 tracking-widest">Total Earned</p>
          </div>
          <h2 className="text-4xl font-display font-bold">₦6,000</h2>
          <p className="text-xs text-white/30 mt-1 font-medium italic">Withdrawable rewards</p>
        </div>
        <div className="glass-card p-6 border-blue-500/30 bg-blue-500/5">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-500 rounded-2xl shadow-lg shadow-blue-500/20">
              <Gift size={20} className="text-white" />
            </div>
            <p className="text-[10px] uppercase font-black text-blue-400 tracking-widest">Rank Bonus</p>
          </div>
          <h2 className="text-4xl font-display font-bold">₦2,500</h2>
          <p className="text-xs text-white/30 mt-1 font-medium italic">Next: Silver Tier (5 left)</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 items-start">
        {/* Referral Link Card */}
        <section className="glass-card p-8 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-cyan-900/40 via-transparent to-transparent">
          <h3 className="text-2xl font-display font-bold mb-6 italic">Secure Your Link</h3>
          <p className="text-white/40 text-sm mb-10 leading-relaxed font-light">
            Monetize your network. Copy this link and share it on your social media platforms. For each person who registers and activates their account, you'll receive <span className="text-cyan-400 font-bold">₦500</span>.
          </p>
          
          <div className="space-y-6">
            <div className="relative">
              <div className="bg-white/5 border border-white/5 rounded-2xl py-5 px-6 pr-20 text-cyan-300 font-mono text-sm truncate shadow-inner">
                {referralLink}
              </div>
              <button 
                onClick={handleCopy}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-4 bg-white text-black hover:bg-cyan-50 rounded-xl transition-all active:scale-90 shadow-xl"
              >
                {copied ? <Check size={20} className="text-cyan-600" /> : <Copy size={20} />}
              </button>
            </div>
            
            <div className="flex flex-wrap gap-4 pt-4">
               <button className="flex-1 btn-outline flex items-center justify-center gap-3 py-4 text-[10px] font-black uppercase tracking-widest shadow-xl">
                 <Share2 size={16} /> WhatsApp
               </button>
               <button className="flex-1 btn-outline flex items-center justify-center gap-3 py-4 text-[10px] font-black uppercase tracking-widest shadow-xl">
                 <Zap size={16} /> Marketing Kits
               </button>
            </div>
          </div>
        </section>

        {/* Instructions */}
        <section className="space-y-10">
           <h3 className="text-2xl font-display font-bold tracking-tight uppercase tracking-widest text-xs opacity-40">The Blueprint</h3>
           <div className="space-y-10">
             {steps.map((step, i) => (
               <div key={i} className="flex gap-8 items-start group">
                 <div className="w-14 h-14 rounded-3xl border border-white/5 flex items-center justify-center shrink-0 font-display font-black text-2xl text-cyan-500 bg-cyan-500/5 group-hover:bg-cyan-500/10 group-hover:rotate-6 transition-all duration-500">
                   {i + 1}
                 </div>
                 <div className="space-y-1 pt-2">
                   <h4 className="font-display font-bold text-xl group-hover:text-cyan-200 transition-colors">{step.title}</h4>
                   <p className="text-sm text-white/40 leading-relaxed font-light">{step.desc}</p>
                 </div>
               </div>
             ))}
           </div>

           <div className="glass-card p-6 border-pink-500/20 bg-pink-500/5 mt-10">
              <div className="flex gap-4 items-start">
                <Zap size={20} className="text-pink-400 shrink-0 mt-1" />
                <p className="text-xs text-white/40 leading-relaxed italic font-light">
                  <span className="text-pink-400 font-bold uppercase tracking-wider text-[10px] block mb-1">Anti-Fraud Protocol</span>
                  Multiple account creation is strictly forbidden. Our AI-driven detection system will automatically suspend accounts found cheating the referral system.
                </p>
              </div>
           </div>
        </section>
      </div>

      {/* Network List */}
      <section className="pt-10">
        <div className="flex items-center justify-between mb-8 px-1">
          <h3 className="text-2xl font-display font-bold">Network Activity</h3>
          <div className="h-0.5 flex-1 bg-white/5 mx-8 rounded-full"></div>
          <button className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-white transition-all">VIEW ALL</button>
        </div>
        
        <div className="glass-card overflow-hidden border-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] text-white/30 font-black text-[10px] uppercase tracking-[0.2em]">
                  <th className="px-8 py-6">Identity</th>
                  <th className="px-8 py-6 text-center">Timestamp</th>
                  <th className="px-8 py-6 text-center">Status</th>
                  <th className="px-8 py-6 text-right">Commission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {[
                  { name: 'Emeka A.', date: 'Oct 12, 2026', status: 'Active', reward: 500 },
                  { name: 'Sarah J.', date: 'Oct 10, 2026', status: 'Pending', reward: 0 },
                  { name: 'Olamide B.', date: 'Oct 08, 2026', status: 'Active', reward: 500 },
                  { name: 'David W.', date: 'Oct 05, 2026', status: 'Active', reward: 500 },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-white/[0.01] transition-colors cursor-default group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-[10px] font-bold border border-white/5 group-hover:border-cyan-500/30 group-hover:bg-cyan-500/5 transition-all">
                           {row.name.substring(0, 2)}
                         </div>
                         <span className="font-bold text-white/80 group-hover:text-white transition-all">{row.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center text-xs text-white/30 font-medium">{row.date}</td>
                    <td className="px-8 py-6 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        row.status === 'Active' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-white/5 text-white/20'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right font-display font-black text-cyan-400 text-lg group-hover:scale-105 transition-transform origin-right">
                      ₦{row.reward}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
