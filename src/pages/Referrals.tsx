import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Gift, Share2, Copy, Check, TrendingUp, Award, Zap, Loader2, ChevronRight, Info, CheckCircle } from 'lucide-react';
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
    { title: 'Share Link', desc: 'Send your link to friends.', icon: Share2, color: 'bg-indigo-50 text-indigo-600' },
    { title: 'Activation', desc: 'They register and sync account.', icon: Users, color: 'bg-emerald-50 text-emerald-600' },
    { title: 'Get Paid', desc: 'Earn ₦500 instantly on sync.', icon: Gift, color: 'bg-rose-50 text-rose-600' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pb-32 font-sans">
      {/* Header */}
      <header className="p-12 bg-slate-900 text-white rounded-b-[4rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[150px] translate-x-1/2 -translate-y-1/2" />
        <div className="relative z-10 space-y-10">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-black italic tracking-tighter uppercase">NETWORK <span className="text-cyan-400">EXPANSION</span></h1>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Neural Link Distribution Protocol</p>
            </div>
            <button className="p-4 bg-white/5 rounded-[1.5rem] border border-white/10 hover:bg-white/10 transition-all group">
              <TrendingUp size={24} className="text-cyan-400 group-hover:scale-110 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-slate-950/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 relative group overflow-hidden">
                <div className="absolute inset-0 bg-cyan-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
                <div className="relative z-10">
                  <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em] mb-2">Authenticated Nodes</p>
                  <p className="text-5xl font-black italic tracking-tight tabular-nums">{referrals.length}</p>
                </div>
             </div>
             <div className="bg-slate-950/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 relative group overflow-hidden">
                <div className="absolute inset-0 bg-emerald-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
                <div className="relative z-10">
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-2">Expansion Yield</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-slate-500 italic">₦</span>
                    <p className="text-5xl font-black italic tracking-tight tabular-nums">{userData?.balances?.referral?.toLocaleString() || '0'}</p>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </header>

      <div className="p-8 max-w-2xl mx-auto space-y-12">
        {/* Referral Link */}
        <section className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-10 border border-slate-100 dark:border-slate-800/50 shadow-2xl shadow-slate-950/20 space-y-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/[0.03] rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
          
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-14 h-14 bg-cyan-500/10 text-cyan-500 rounded-[1.5rem] flex items-center justify-center border border-cyan-500/20">
              <Zap size={28} />
            </div>
            <div>
              <h3 className="text-2xl font-black italic tracking-tight uppercase">Distribute Neural Link</h3>
              <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase">Authorization Bonus: ₦500 per node</p>
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed font-medium italic relative z-10">
            Transmit your unique identification signature to prospective operatives. Earn ₦500 instantly upon successful node synchronization.
          </p>

          <div className="space-y-6 relative z-10">
            <div className="flex flex-col sm:flex-row bg-slate-50 dark:bg-slate-950 p-2 rounded-[2rem] border border-slate-100 dark:border-slate-800">
               <div className="flex-1 px-6 py-4 text-[10px] font-black tracking-widest truncate text-slate-500 uppercase overflow-hidden">
                 {referralLink}
               </div>
               <button 
                 onClick={handleCopy}
                 className="bg-slate-950 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3"
               >
                 {copied ? <CheckCircle size={18} /> : <><Copy size={18} /> COPY SIGNAL</>}
               </button>
            </div>
            
            <button 
              onClick={() => window.open(`https://wa.me/?text=Check%20out%20EarnPal%21%20Use%20my%20link%20to%20join%20and%20earn%3A%20${encodeURIComponent(referralLink)}`, '_blank')}
              className="w-full py-5 bg-emerald-500 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-4"
            >
              <Share2 size={24} /> BROADCAST VIA WHATSAPP
            </button>
          </div>
        </section>

        {/* Steps */}
        <section className="space-y-8">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] px-4">Propagation Sequence</h3>
          <div className="grid grid-cols-1 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-6 p-8 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800/50 shadow-2xl shadow-slate-950/10 group hover:border-cyan-500/30 transition-all">
                 <div className={`w-20 h-20 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-800 transition-transform group-hover:scale-110 duration-500`}>
                   <step.icon size={32} className={i === 0 ? 'text-cyan-500' : i === 1 ? 'text-emerald-500' : 'text-rose-500'} />
                 </div>
                 <div className="flex-1">
                   <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-500 mb-1">{step.title}</h4>
                   <p className="text-sm font-black italic tracking-tight">{step.desc}</p>
                 </div>
                 <div className="text-slate-100 dark:text-slate-800 font-black text-6xl italic opacity-50 group-hover:opacity-100 transition-opacity drop-shadow-sm select-none">0{i+1}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Activity Table */}
        <section className="bg-white dark:bg-slate-900 rounded-[4rem] border border-slate-100 dark:border-slate-800/50 shadow-2xl shadow-slate-950/20 overflow-hidden flex flex-col relative">
          <div className="absolute inset-0 bg-cyan-500/[0.01] pointer-events-none" />
          <div className="p-10 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center relative z-10">
            <h3 className="text-2xl font-black italic tracking-tight uppercase flex items-center gap-4">
              <Users className="text-cyan-500" size={28} />
              Operative Log
            </h3>
            {referrals.length > 0 && <span className="text-[10px] bg-cyan-500 border border-cyan-400 text-white px-4 py-2 rounded-xl font-black uppercase tracking-widest shadow-lg">{referrals.length} ACTIVE</span>}
          </div>

          <div className="flex-1 min-h-[400px] relative z-10">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="animate-spin text-cyan-500" size={48} />
              </div>
            ) : referrals.length > 0 ? (
              <div className="divide-y divide-slate-50 dark:divide-slate-800">
                {referrals.map((row, i) => (
                  <div key={i} className="p-10 flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all border-l-4 border-transparent hover:border-cyan-500">
                    <div className="flex items-center gap-6">
                       <div className="w-16 h-16 rounded-[1.5rem] bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-black italic text-xl border border-cyan-500/20 shadow-inner group-hover:scale-110 transition-transform">
                         {(row.displayName || 'UX').substring(0, 2).toUpperCase()}
                       </div>
                       <div>
                         <h4 className="font-black text-lg italic tracking-tight text-slate-800 dark:text-white uppercase">{row.displayName || 'ANONYMOUS NODE'}</h4>
                         <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1 tabular-nums">
                           LINKED: {row.createdAt?.toDate ? row.createdAt.toDate().toLocaleDateString() : (row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'REAL-TIME')}
                         </p>
                       </div>
                    </div>
                    <div className="text-right">
                       <div className="flex items-baseline gap-1 justify-end">
                         <span className="text-xs font-black text-emerald-500">₦</span>
                         <p className="text-2xl font-black italic tracking-tight text-emerald-500 tabular-nums">500</p>
                       </div>
                       <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest italic opacity-60">BONUS ACCRUED</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 space-y-8">
                <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] flex items-center justify-center border border-slate-100 dark:border-slate-800 transition-transform group-hover:scale-110">
                  <Users className="text-slate-200 dark:text-slate-800" size={56} />
                </div>
                <div className="space-y-2">
                  <h4 className="font-black text-xl italic uppercase">Expansion Log Empty</h4>
                  <p className="text-[10px] font-black tracking-widest text-slate-400 max-w-xs uppercase">No operatives detected in your propagation network.</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Security Clause */}
        <div className="p-10 bg-rose-500/[0.02] dark:bg-rose-500/[0.05] rounded-[3rem] border border-rose-500/10 flex gap-6 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/[0.05] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-rose-500/10 transition-colors" />
           <Info className="text-rose-500 shrink-0" size={32} />
           <div className="relative z-10">
             <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mb-3">ANTI-FRAUD PROTOCOL</h4>
             <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic opacity-80">
               Automated node generation is strictly prohibited. Our neural heuristic system identifies and terminates shadow nodes attempting to manipulate the propagation system.
             </p>
           </div>
        </div>
      </div>
    </div>
  );
}
