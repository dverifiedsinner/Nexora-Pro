import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Mail, Phone, Building2, CreditCard, Save, 
  ShieldCheck, Zap, ArrowRight, UserCircle, 
  Settings, Camera, LogOut, CheckCircle, Info, Loader2
} from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth, handleFirestoreError } from '../contexts/AuthContext';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export default function Profile() {
  const { user, userData, signOut } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    phoneNumber: '',
    bankName: '',
    accountNumber: '',
    accountName: '',
  });

  React.useEffect(() => {
    if (userData) {
      setFormData({
        displayName: userData.displayName || '',
        phoneNumber: (userData as any).phoneNumber || '',
        bankName: (userData as any).bankName || '',
        accountNumber: (userData as any).accountNumber || '',
        accountName: (userData as any).accountName || '',
      });
    }
  }, [userData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userData) return;
    setIsSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        ...formData,
        profileUpdated: true
      });
      
      alert('Profile updated successfully.');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'users');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pb-32 font-sans">
      {/* Header */}
      <header className="p-12 bg-slate-900 text-white rounded-b-[4rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[150px] translate-x-1/2 -translate-y-1/2" />
        <div className="relative z-10 flex flex-col items-center text-center space-y-8">
          <div className="relative group">
            <div className="w-32 h-32 rounded-[3.5rem] overflow-hidden border-4 border-white/5 p-2 bg-slate-950 shadow-2xl transition-transform group-hover:scale-105 duration-500">
              <img 
                src={userData?.photoURL || `https://ui-avatars.com/api/?name=${userData?.displayName}&background=0D9488&color=fff`} 
                alt="" 
                className="w-full h-full object-cover rounded-[2.5rem]"
              />
            </div>
            <button className="absolute -bottom-2 -right-2 p-4 bg-cyan-600 rounded-2xl shadow-2xl border-4 border-slate-900 hover:bg-cyan-500 transition-colors">
               <Camera size={20} className="text-white" />
            </button>
          </div>
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase">{userData?.displayName || 'NEURAL ID: 000'}</h1>
            <p className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.4em] mt-3 italic opacity-80">AUTHORIZED VANGUARD OPERATIVE</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
             <div className="px-6 py-3 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/5 flex items-center gap-3">
                <ShieldCheck size={18} className="text-cyan-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Identity Verified</span>
             </div>
             <div className="px-6 py-3 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/5 flex items-center gap-3">
                <Zap size={18} className="text-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Node Uptime: 99.9%</span>
             </div>
          </div>
        </div>
      </header>

      <div className="p-8 max-w-2xl mx-auto space-y-12">
        <form onSubmit={handleSave} className="space-y-12">
          {/* Identity Section */}
          <section className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-10 border border-slate-100 dark:border-slate-800/50 shadow-2xl shadow-slate-950/20 space-y-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/[0.03] rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
            
            <div className="flex items-center gap-5 relative z-10">
              <div className="w-14 h-14 bg-cyan-500/10 text-cyan-500 rounded-[1.5rem] flex items-center justify-center border border-cyan-500/20">
                <UserCircle size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-black italic tracking-tight uppercase">Identity Node</h3>
                <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase">Personal Core Data Configuration</p>
              </div>
            </div>
            
            <div className="space-y-8 relative z-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Authorized Full Name</label>
                <div className="relative group">
                  <User size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-500 transition-colors" />
                  <input 
                    type="text" 
                    value={formData.displayName}
                    onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[2rem] py-5 pl-16 pr-8 font-black italic text-sm tracking-tight focus:outline-none focus:ring-1 ring-cyan-500 transition-all placeholder:text-slate-700"
                    placeholder="ENTER FULL LEGAL NAME"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Terminal Phone Number</label>
                <div className="relative group">
                  <Phone size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-500 transition-colors" />
                  <input 
                    type="tel" 
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[2rem] py-5 pl-16 pr-8 font-black italic text-sm tracking-tight focus:outline-none focus:ring-1 ring-cyan-500 transition-all placeholder:text-slate-700 uppercase"
                    placeholder="+234 XXX XXX XXXX"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Settlement Section */}
          <section className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-10 border border-slate-100 dark:border-slate-800/50 shadow-2xl shadow-slate-950/20 space-y-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/[0.03] rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

            <div className="flex items-center gap-5 relative z-10">
              <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-[1.5rem] flex items-center justify-center border border-emerald-500/20">
                <CreditCard size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-black italic tracking-tight uppercase">Liquidation Endpoint</h3>
                <p className="text-[10px] font-black tracking-widest text-slate-500 uppercase">Primary Settlement Channel Configuration</p>
              </div>
            </div>

            <div className="space-y-8 relative z-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Settlement Institution</label>
                <div className="relative group">
                  <Building2 size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                  <input 
                    type="text" 
                    value={formData.bankName}
                    onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[2rem] py-5 pl-16 pr-8 font-black italic text-sm tracking-tight focus:outline-none focus:ring-1 ring-emerald-500 transition-all placeholder:text-slate-700 uppercase"
                    placeholder="WEMA, KUDA, OPAY, ZENITH"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Account ID</label>
                  <input 
                    type="text" 
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[2rem] py-5 px-8 font-black italic text-sm tracking-tight focus:outline-none focus:ring-1 ring-emerald-500 transition-all placeholder:text-slate-700 tabular-nums"
                    placeholder="000 000 0000"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Legal Payee Name</label>
                  <input 
                    type="text" 
                    value={formData.accountName}
                    onChange={(e) => setFormData({...formData, accountName: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[2rem] py-5 px-8 font-black italic text-sm tracking-tight focus:outline-none focus:ring-1 ring-emerald-500 transition-all placeholder:text-slate-700 uppercase"
                    placeholder="NODE ACCOUNT HOLDER"
                  />
                </div>
              </div>
            </div>
          </section>

          <button 
            type="submit"
            disabled={isSaving}
            className="w-full py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.4em] shadow-2xl flex items-center justify-center gap-4 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="animate-spin" size={24} /> : <><Save size={24} /> SYNCHRONIZE IDENTITY</>}
          </button>
        </form>

        {/* Security Info */}
        <section className="p-10 bg-cyan-500/[0.02] dark:bg-cyan-500/[0.05] rounded-[3rem] border border-cyan-500/10 flex gap-6 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/[0.05] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-cyan-500/10 transition-colors" />
           <Info className="text-cyan-500 shrink-0" size={32} />
           <div className="relative z-10">
             <h4 className="text-[10px] font-black text-cyan-500 dark:text-cyan-400 uppercase tracking-[0.2em] mb-2">NEURAL ENCRYPTION PROTOCOL</h4>
             <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic opacity-80">
               Settlement data packets are AES-256 encrypted. Payout delays may occur if account identity signatures do not match neural records.
             </p>
           </div>
        </section>

        <button 
          onClick={() => signOut()}
          className="w-full py-6 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 rounded-[2.5rem] text-rose-500 font-black text-[10px] uppercase tracking-[0.4em] flex items-center justify-center gap-4 active:scale-[0.98] transition-all group"
        >
          <LogOut size={24} className="group-hover:rotate-12 transition-transform" />
          TERMINATE CURRENT SESSION
        </button>
      </div>
    </div>
  );
}

