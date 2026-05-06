import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Gift, Share2, Copy, Check, TrendingUp, Award, Zap, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function Referrals() {
  const { userData } = useAuth();
  const [copied, setCopied] = React.useState(false);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    // Safety timeout
    const timeoutId = setTimeout(() => {
      if (mounted && loading) {
        setLoading(false);
      }
    }, 5000);

    const fetchReferrals = async () => {
      if (!userData?.uid) {
        if (mounted) setLoading(false);
        return;
      }
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('referredBy', '==', userData.uid));
        const querySnapshot = await getDocs(q);
        
        if (!mounted) return;
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setReferrals(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) {
          setLoading(false);
          clearTimeout(timeoutId);
        }
      }
    };
    fetchReferrals();
    return () => { 
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [userData?.uid]);

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
        <div className="glass-card p-6 border-yellow-500/30 bg-yellow-500/5">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-yellow-500 rounded-2xl shadow-lg shadow-yellow-500/20">
              <Award size={20} className="text-slate-950" />
            </div>
            <p className="text-[10px] uppercase font-black text-yellow-400 tracking-widest">Total Referrals</p>
          </div>
          <h2 className="text-4xl font-display font-bold">{referrals.length}</h2>
          <p className="text-xs text-white/30 mt-1 font-medium italic">Active network size</p>
        </div>
        <div className="glass-card p-6 border-blue-500/30 bg-blue-500/5">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-500 rounded-2xl shadow-lg shadow-blue-500/20">
              <TrendingUp size={20} className="text-white" />
            </div>
            <p className="text-[10px] uppercase font-black text-blue-400 tracking-widest">Total Earned</p>
          </div>
          <h2 className="text-4xl font-display font-bold">₦{userData?.balances?.referral?.toLocaleString() || '0'}</h2>
          <p className="text-xs text-white/30 mt-1 font-medium italic">Withdrawable rewards</p>
        </div>
        <div className="glass-card p-6 border-yellow-500/30 bg-yellow-500/5">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-yellow-500 rounded-2xl shadow-lg shadow-yellow-500/20">
              <Gift size={20} className="text-slate-950" />
            </div>
            <p className="text-[10px] uppercase font-black text-yellow-400 tracking-widest">Rank Bonus</p>
          </div>
          <h2 className="text-4xl font-display font-bold">₦2,500</h2>
          <p className="text-xs text-white/30 mt-1 font-medium italic">Next: Silver Tier ({Math.max(0, 5 - referrals.length)} left)</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 items-start">
        {/* Referral Link Card */}
        <section className="glass-card p-8 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-yellow-900/40 via-transparent to-transparent">
          <h3 className="text-2xl font-display font-bold mb-6 italic">Secure Your Link</h3>
          <p className="text-white/40 text-sm mb-10 leading-relaxed font-light">
            Monetize your network. Copy this link and share it on your social media platforms. For each person who registers and activates their account, you'll receive <span className="text-yellow-400 font-bold">₦500</span>.
          </p>
          
          <div className="space-y-6">
            <div className="relative">
              <div className="bg-white/5 border border-white/5 rounded-2xl py-5 px-6 pr-20 text-yellow-300 font-mono text-sm truncate shadow-inner">
                {referralLink}
              </div>
              <button 
                onClick={handleCopy}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-4 bg-yellow-500 text-slate-950 hover:bg-yellow-400 rounded-xl transition-all active:scale-90 shadow-xl"
              >
                {copied ? <Check size={20} className="text-slate-950" /> : <Copy size={20} />}
              </button>
            </div>
            
            <div className="flex flex-wrap gap-4 pt-4">
               <button 
                  onClick={() => window.open(`https://wa.me/?text=Check%20out%20NEXORA%21%20Use%20my%20link%20to%20join%20and%20earn%3A%20${encodeURIComponent(referralLink)}`, '_blank')}
                  className="flex-1 btn-outline flex items-center justify-center gap-3 py-4 text-[10px] font-black uppercase tracking-widest shadow-xl"
               >
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
                 <div className="w-14 h-14 rounded-3xl border border-white/5 flex items-center justify-center shrink-0 font-display font-black text-2xl text-yellow-500 bg-yellow-500/5 group-hover:bg-yellow-500/10 group-hover:rotate-6 transition-all duration-500">
                   {i + 1}
                 </div>
                 <div className="space-y-1 pt-2">
                   <h4 className="font-display font-bold text-xl group-hover:text-yellow-200 transition-colors">{step.title}</h4>
                   <p className="text-sm text-white/40 leading-relaxed font-light">{step.desc}</p>
                 </div>
               </div>
             ))}
           </div>

           <div className="glass-card p-6 border-blue-500/20 bg-blue-500/5 mt-10">
              <div className="flex gap-4 items-start">
                <Zap size={20} className="text-blue-400 shrink-0 mt-1" />
                <p className="text-xs text-white/40 leading-relaxed italic font-light">
                  <span className="text-blue-400 font-bold uppercase tracking-wider text-[10px] block mb-1">Anti-Fraud Protocol</span>
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
        
        <div className="glass-card overflow-hidden border-white/5 min-h-[200px] flex flex-col items-center justify-center">
          {loading ? (
            <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
          ) : referrals.length > 0 ? (
            <div className="overflow-x-auto w-full">
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
                  {referrals.map((row, i) => (
                    <tr key={i} className="hover:bg-white/[0.01] transition-colors cursor-default group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-[10px] font-bold border border-white/5 group-hover:border-yellow-500/30 group-hover:bg-yellow-500/5 transition-all">
                             {(row.displayName || 'UX').substring(0, 2).toUpperCase()}
                           </div>
                           <span className="font-bold text-white/80 group-hover:text-white transition-all">{row.displayName || 'Anonymous'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center text-xs text-white/30 font-medium">
  {row.createdAt?.toDate ? row.createdAt.toDate().toLocaleDateString() : (row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A')}
</td>
                      <td className="px-8 py-6 text-center">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-yellow-500/10 text-yellow-400`}>
                          Active
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right font-display font-black text-yellow-400 text-lg group-hover:scale-105 transition-transform origin-right">
                        ₦500
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center space-y-4">
              <Users className="w-12 h-12 text-white/10 mx-auto" />
              <p className="text-sm text-white/20 uppercase font-black tracking-widest italic">No network nodes connected yet.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
