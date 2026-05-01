import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Phone, Building2, CreditCard, Save, ShieldCheck, Zap, ArrowRight, UserCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function Profile() {
  const { userData } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    displayName: userData?.displayName || '',
    phoneNumber: (userData as any)?.phoneNumber || '',
    bankName: (userData as any)?.bankName || '',
    accountNumber: (userData as any)?.accountNumber || '',
    accountName: (userData as any)?.accountName || '',
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...formData,
          profileUpdated: true
        })
        .eq('uid', userData.uid);
      
      if (error) throw error;
      alert('Node identity synchronized successfully.');
    } catch (err) {
      console.error(err);
      alert('Synchronization failed.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-12 pb-12 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative">
        <div className="z-10">
          <h1 className="text-4xl font-display font-black tracking-tight text-gradient leading-none mb-2 uppercase">Identity Core.</h1>
          <p className="text-white/30 font-light italic text-xs uppercase tracking-[0.2em]">Personal Metadata & Settlement Authority</p>
        </div>
        <div className="flex items-center gap-4 px-6 py-3 bg-white/5 border border-white/5 rounded-2xl backdrop-blur-md">
           <ShieldCheck size={20} className="text-cyan-400" />
           <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Level 1 Verified Node</span>
        </div>
        <div className="absolute -top-10 -right-20 w-80 h-80 bg-cyan-500/5 blur-[120px] rounded-full animate-float-slow pointer-events-none"></div>
      </header>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <form onSubmit={handleSave} className="glass-card p-10 md:p-16 border-white/5 space-y-12 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none"></div>
            
            {/* Personal Data Section */}
            <div className="space-y-8 relative z-10">
               <div className="flex items-center gap-4">
                  <div className="h-0.5 w-10 bg-cyan-500 rounded-full"></div>
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/30">Personal Metadata</h3>
               </div>
               <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Full Identity</label>
                     <div className="relative group">
                        <User size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-cyan-400 transition-colors" />
                        <input 
                           type="text" 
                           value={formData.displayName}
                           onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                           className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 focus:outline-none focus:border-cyan-500 transition-all font-bold text-sm"
                           placeholder="Full Name"
                        />
                     </div>
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Comm Link (Phone)</label>
                     <div className="relative group">
                        <Phone size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-cyan-400 transition-colors" />
                        <input 
                           type="tel" 
                           value={formData.phoneNumber}
                           onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                           className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 focus:outline-none focus:border-cyan-500 transition-all font-bold text-sm"
                           placeholder="080 0000 0000"
                        />
                     </div>
                  </div>
               </div>
            </div>

            {/* Bank Data Section */}
            <div className="space-y-8 relative z-10">
               <div className="flex items-center gap-4">
                  <div className="h-0.5 w-10 bg-pink-500 rounded-full"></div>
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/30">Settlement Account</h3>
               </div>
               <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3 md:col-span-2">
                     <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Bank Node</label>
                     <div className="relative group">
                        <Building2 size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-pink-500 transition-colors" />
                        <input 
                           type="text" 
                           value={formData.bankName}
                           onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                           className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 focus:outline-none focus:border-pink-500 transition-all font-bold text-sm"
                           placeholder="e.g. Zenith Bank, Kuda, Moniepoint"
                        />
                     </div>
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Account ID (Number)</label>
                     <div className="relative group">
                        <CreditCard size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-pink-500 transition-colors" />
                        <input 
                           type="text" 
                           value={formData.accountNumber}
                           onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                           className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 focus:outline-none focus:border-pink-500 transition-all font-bold text-sm"
                           placeholder="0000000000"
                        />
                     </div>
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Identity Name (Acc Name)</label>
                     <div className="relative group">
                        <UserCircle size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-pink-500 transition-colors" />
                        <input 
                           type="text" 
                           value={formData.accountName}
                           onChange={(e) => setFormData({...formData, accountName: e.target.value})}
                           className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 focus:outline-none focus:border-pink-500 transition-all font-bold text-sm"
                           placeholder="Account Holder Name"
                        />
                     </div>
                  </div>
               </div>
            </div>

            <button 
               disabled={isSaving}
               className="w-full btn-primary py-6 text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl shadow-cyan-500/30 active:scale-95 transition-all flex items-center justify-center gap-4"
            >
               {isSaving ? 'Synchronizing Node...' : <><Save size={20} /> Commit Profile Changes</>}
            </button>
          </form>
        </div>

        <div className="space-y-12">
           <section className="glass-card p-10 border-white/5 bg-gradient-to-br from-cyan-900/40 via-black to-black shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.1),transparent)] group-hover:opacity-100 transition-opacity"></div>
              <div className="w-16 h-16 rounded-[2.5rem] bg-cyan-500 shadow-2xl shadow-cyan-500/40 flex items-center justify-center mb-8 relative z-10 animate-float">
                <ShieldCheck size={32} className="text-white fill-white" />
              </div>
              <h4 className="font-display font-black text-2xl mb-4 italic uppercase tracking-tight relative z-10">Security <br /> Protocol.</h4>
              <p className="text-sm text-white/40 leading-relaxed font-light italic relative z-10">
                Your bank details are only used for settlement outflows. Ensure accuracy to prevent liquidation delays. Identity theft results in immediate node termination.
              </p>
           </section>

           <section className="glass-card p-10 border-white/5 bg-white/[0.02] shadow-2xl relative overflow-hidden">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center">
                    <Zap size={24} className="text-pink-500" />
                 </div>
                 <h4 className="text-xs font-black uppercase tracking-widest text-white/60">Node Integrity</h4>
              </div>
              <div className="space-y-6">
                 <div className="flex justify-between items-center text-xs">
                    <span className="text-white/30 font-black uppercase tracking-widest">KYC Status</span>
                    <span className="text-emerald-400 font-bold uppercase italic">Verified</span>
                 </div>
                 <div className="flex justify-between items-center text-xs">
                    <span className="text-white/30 font-black uppercase tracking-widest">Network Tier</span>
                    <span className="text-cyan-400 font-bold uppercase italic">Vanguard</span>
                 </div>
                 <div className="flex justify-between items-center text-xs">
                    <span className="text-white/30 font-black uppercase tracking-widest">Uptime</span>
                    <span className="text-white font-bold uppercase italic">99.9%</span>
                 </div>
              </div>
           </section>
        </div>
      </div>
    </div>
  );
}
