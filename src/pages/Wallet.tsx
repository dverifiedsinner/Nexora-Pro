import React from 'react';
import { motion } from 'motion/react';
import { 
  Wallet as WalletIcon, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  Building2, 
  Zap, 
  History, 
  AlertCircle,
  Smartphone,
  Wifi,
  Award
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

import { supabase } from '../lib/supabase';

export default function Wallet() {
  const { userData } = useAuth();
  const [activeTab, setActiveTab] = React.useState<'recharge' | 'withdraw' | 'conversion'>('recharge');
  const [conversionType, setConversionType] = React.useState<'airtime' | 'data'>('airtime');
  const [network, setNetwork] = React.useState<string>('MTN');
  
  // Form states
  const [rechargeAmount, setRechargeAmount] = React.useState<string>('');
  const [withdrawAmount, setWithdrawAmount] = React.useState<string>('');
  const [withdrawWallet, setWithdrawWallet] = React.useState<string>('main');
  const [withdrawAccount, setWithdrawAccount] = React.useState<string>('');
  const [withdrawBank, setWithdrawBank] = React.useState<string>('');
  const [convertPhone, setConvertPhone] = React.useState<string>('');
  const [convertValue, setConvertValue] = React.useState<string>('');
  const [convertWallet, setConvertWallet] = React.useState<string>('main');
  const [dataPackage, setDataPackage] = React.useState<{ price: number; label: string }>({ price: 350, label: '1GB' });
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [proofImage, setProofImage] = React.useState<string | null>(null);

  const handleRecharge = async () => {
    const amount = Number(rechargeAmount);
    if (!userData || isNaN(amount) || amount < 1000) {
      alert('Minimum recharge is ₦1,000');
      return;
    }
    
    if (!proofImage) {
      alert('Please upload/capture payment proof for verification.');
      return;
    }

    setIsProcessing(true);
    try {
      const newTransaction = {
        type: 'recharge',
        title: 'NODE RECHARGE',
        amount: amount,
        time: new Date().toISOString(),
        status: 'PENDING_VERIFICATION',
        proof: proofImage
      };

      const { error } = await supabase
        .from('profiles')
        .update({
          transactions: [...(userData.transactions || []), newTransaction]
        })
        .eq('uid', userData.uid);

      if (error) throw error;

      setRechargeAmount('');
      setProofImage(null);
      alert(`Proof submitted for ₦${amount.toLocaleString()}. Our audit engine will verify the node synchronicity within 30 minutes.`);
    } catch (err) {
      console.error(err);
      alert('Recharge request failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleWithdraw = async () => {
    const amount = Number(withdrawAmount);
    if (!userData || isNaN(amount) || amount < 2000) {
      alert("Minimum withdrawal is ₦2,000.");
      return;
    }
    
    const balance = (userData.balances as any)[withdrawWallet];
    if (balance < amount) {
      alert(`Insufficient funds in ${withdrawWallet} vault.`);
      return;
    }

    setIsProcessing(true);
    try {
      const newBalances = {
        ...userData.balances,
        [withdrawWallet]: balance - amount
      };
      const newTransaction = {
        type: 'withdrawal',
        title: 'LIQUIDATION',
        amount: -amount,
        time: new Date().toISOString(),
        status: 'SETTLED'
      };

      const { error } = await supabase
        .from('profiles')
        .update({
          balances: newBalances,
          transactions: [...(userData.transactions || []), newTransaction]
        })
        .eq('uid', userData.uid);

      if (error) throw error;

      setWithdrawAmount('');
      alert("Withdrawal request initiated successfully.");
    } catch (err) {
      console.error(err);
      alert('Liquidation failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConvert = async () => {
    if (!userData || !convertPhone) {
      alert("Please provide a valid receiver link.");
      return;
    }
    
    const finalAmount = conversionType === 'airtime' ? Number(convertValue) : dataPackage.price;
    if (isNaN(finalAmount) || finalAmount <= 0) {
      alert("Invalid value selected.");
      return;
    }

    const balance = (userData.balances as any)[convertWallet];
    if (balance < finalAmount) {
      alert("Insufficient fuel in selected reservoir.");
      return;
    }

    setIsProcessing(true);
    try {
      const newBalances = {
        ...userData.balances,
        [convertWallet]: balance - finalAmount
      };
      const newTransaction = {
        type: 'conversion',
        title: `${conversionType.toUpperCase()} SWAP`,
        amount: -finalAmount,
        time: new Date().toISOString(),
        status: 'COMPLETED'
      };

      const { error } = await supabase
        .from('profiles')
        .update({
          balances: newBalances,
          transactions: [...(userData.transactions || []), newTransaction]
        })
        .eq('uid', userData.uid);

      if (error) throw error;

      alert(`${conversionType === 'airtime' ? 'Airtime' : 'Data'} sent successfully to ${convertPhone}`);
    } catch (err) {
      console.error(err);
      alert('Conversion failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const dataPackages = [
    { price: 350, label: '1GB - ₦350 (30 DAYS)', val: '1GB' },
    { price: 650, label: '2GB - ₦650 (30 DAYS)', val: '2GB' },
    { price: 1500, label: '5GB - ₦1,500 (30 DAYS)', val: '5GB' },
    { price: 2800, label: '10GB - ₦2,800 (30 DAYS)', val: '10GB' },
    { price: 5500, label: '25GB - ₦5,500 (30 DAYS)', val: '25GB' },
  ];

  return (
    <div className="space-y-8 md:space-y-12 pb-12 overflow-x-hidden">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8 relative">
        <div className="z-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-display font-black tracking-tight text-gradient leading-none mb-2 italic">FINANCE HUB.</h1>
          <p className="text-white/30 font-light italic text-[10px] uppercase tracking-[0.2em]">Asset Management & Liquidation</p>
        </div>
        
        <div className="flex gap-2 p-1 bg-white/5 border border-white/5 rounded-2xl backdrop-blur-md overflow-x-auto z-10 scrollbar-hide">
          {[
            { id: 'recharge', label: 'Recharge', icon: ArrowDownLeft },
            { id: 'withdraw', label: 'Cash Out', icon: ArrowUpRight },
            { id: 'conversion', label: 'Asset Swap', icon: Smartphone },
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 md:gap-3 px-5 py-2.5 md:px-8 md:py-3 rounded-xl font-black transition-all whitespace-nowrap ${
                activeTab === tab.id ? 'bg-cyan-500 text-white shadow-xl shadow-cyan-500/20' : 'text-white/20 hover:text-white/60'
              }`}
            >
              <tab.icon size={14} className="md:w-4 md:h-4" />
              <span className="text-[9px] md:text-[10px] uppercase tracking-widest leading-none">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="absolute -top-10 -right-20 w-80 h-80 bg-cyan-500/5 blur-[120px] rounded-full animate-float-slow pointer-events-none"></div>
      </header>

      {/* Main Wallets Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 perspective-1000">
        <div className="glass-card p-6 md:p-10 bg-gradient-to-br from-cyan-600/20 via-blue-900/40 to-black border-white/5 relative overflow-hidden flex flex-col justify-between min-h-[220px] md:min-h-[280px] shadow-2xl rotate-3d animate-float group hover:border-cyan-500/30 transition-all duration-700">
           <div className="relative z-10 flex justify-between items-start">
              <div className="p-3 md:p-4 bg-white/10 rounded-xl md:rounded-2xl border border-white/10 shadow-xl group-hover:rotate-12 transition-transform duration-500">
                 <WalletIcon size={24} className="text-cyan-400 md:w-7 md:h-7" />
              </div>
              <div className="text-right">
                <p className="text-[8px] md:text-[9px] uppercase font-black tracking-[0.3em] text-cyan-400 mb-1">Vault Authority</p>
                <div className="flex items-center gap-2 justify-end">
                   <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-emerald-500 rounded-full animate-ping"></div>
                   <span className="text-[8px] md:text-[10px] font-black text-white/40 tracking-widest uppercase">Secured</span>
                </div>
              </div>
           </div>
           <div className="relative z-10 pt-6 md:pt-8">
              <p className="text-[8px] md:text-[10px] text-white/30 mb-1 md:mb-2 uppercase font-black tracking-[0.2em] italic">Main Liquid Assets</p>
              <h2 className="text-4xl md:text-6xl font-display font-black text-white tracking-tighter leading-none group-hover:text-cyan-400 transition-colors">
                ₦{userData?.balances.main.toLocaleString()}
              </h2>
              <div className="flex items-center gap-4 mt-4 md:mt-6">
                <div className="px-3 py-1.5 md:px-4 md:py-2 bg-white/5 border border-white/5 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                  <ArrowUpRight size={12} className="md:w-3.5 md:h-3.5" /> +4.2% Growth
                </div>
              </div>
           </div>
           
           {/* Abstract pattern */}
           <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-cyan-500/5 blur-[80px] rounded-full"></div>
           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,_rgba(34,211,238,0.1),transparent)] opacity-50"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 md:gap-6">
          {[
            { label: 'Bonus Reservoir', value: userData?.balances.bonus, icon: Zap, color: 'text-pink-400', bg: 'bg-pink-500/10' },
            { label: 'Network Yield', value: userData?.balances.referral, icon: Award, color: 'text-cyan-400', bg: 'bg-cyan-500/10' }
          ].map((wallet, i) => (
            <div key={i} className="glass-card p-5 md:p-8 flex items-center justify-between group hover:border-white/20 transition-all border-white/5 animate-float-slow shadow-xl" style={{ animationDelay: `${i * 0.8}s` }}>
              <div className="flex items-center gap-4 md:gap-6">
                <div className={`w-12 h-12 md:w-16 md:h-16 ${wallet.bg} rounded-xl md:rounded-2xl flex items-center justify-center border border-white/5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-2xl truncate`}>
                  <wallet.icon size={20} className={`${wallet.color} md:w-7 md:h-7`} />
                </div>
                <div>
                  <p className="text-[8px] md:text-[9px] text-white/20 font-black uppercase tracking-[0.2em] mb-0.5 md:mb-1">{wallet.label}</p>
                  <p className="text-xl md:text-3xl font-display font-black leading-none tracking-tighter group-hover:text-white transition-colors">₦{wallet.value?.toLocaleString()}</p>
                </div>
              </div>
              <button className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/5 text-white/20 hover:text-cyan-400 hover:border-cyan-500/30 transition-all">
                <ArrowUpRight size={16} className="md:w-5 md:h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 md:gap-12">
        <div className="lg:col-span-2">
          <div className="glass-card p-6 md:p-10 lg:p-12 border-white/5 shadow-[0_30px_60px_rgba(0,0,0,0.4)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none"></div>
            
            {activeTab === 'recharge' && (
              <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="max-w-md text-center md:text-left mx-auto md:mx-0">
                  <h3 className="text-2xl md:text-3xl font-display font-black mb-2 md:mb-3 italic uppercase tracking-tight">Recharge Node.</h3>
                  <p className="text-[10px] md:text-sm text-white/30 font-light leading-relaxed">Infuse capital into your Nexora account via manual transfer protocol.</p>
                </div>
                
                <div className="grid md:grid-cols-1 gap-6">
                  <div className="p-6 md:p-10 bg-white/5 rounded-[1.5rem] md:rounded-[2.5rem] border border-cyan-500/20 shadow-2xl shadow-cyan-500/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 md:p-8">
                       <Building2 size={32} className="text-white/5 group-hover:text-cyan-500/10 transition-colors md:w-12 md:h-12" />
                    </div>
                    <div className="space-y-4 md:space-y-6 relative z-10">
                      <div>
                        <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400 mb-2 md:mb-4">Official Bank Node</p>
                        <div className="space-y-3 md:space-y-4">
                          {[
                            { label: 'Bank', value: 'OPAY / MONIEPOINT' },
                            { label: 'Acc No.', value: '8106489377' },
                            { label: 'Name', value: 'NEXORA SYSTEMS' },
                          ].map(item => (
                            <div key={item.label} className="flex justify-between items-center py-1.5 md:py-2 border-b border-white/5">
                              <span className="text-[8px] md:text-[10px] text-white/20 font-bold uppercase">{item.label}</span>
                              <span className="text-xs md:text-sm font-black text-white">{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
                        <p className="text-[8px] md:text-[10px] text-cyan-400 font-bold uppercase text-center">Transfer strictly to this node only</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="flex items-center justify-between px-1">
                    <p className="text-[10px] uppercase font-black text-white/20 tracking-[0.3em]">Quantum Amount Selector</p>
                    <div className="h-px flex-1 bg-white/5 mx-4"></div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    {[1000, 5000, 10000].map((amt) => (
                      <button key={amt} onClick={() => setRechargeAmount(amt.toString())} className={`py-4 md:py-5 px-3 md:px-4 rounded-xl md:rounded-2xl font-display font-black transition-all text-xs md:text-sm shadow-xl active:scale-95 border ${rechargeAmount === amt.toString() ? 'bg-cyan-500 text-white border-white/20' : 'bg-white/5 border-white/5 hover:border-cyan-500/50 hover:bg-cyan-500/5 hover:text-cyan-400'}`}>
                        ₦{amt.toLocaleString()}
                      </button>
                    ))}
                  </div>
                  <div className="relative group">
                    <span className="absolute left-6 md:left-8 top-1/2 -translate-y-1/2 text-cyan-400 font-black text-lg md:text-xl group-focus-within:animate-pulse">₦</span>
                    <input 
                      type="number" 
                      value={rechargeAmount}
                      onChange={(e) => setRechargeAmount(e.target.value)}
                      placeholder="Custom Entry Amount" 
                      className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] md:rounded-[2rem] py-5 md:py-7 pl-12 md:pl-16 pr-6 md:pr-8 focus:outline-none focus:border-cyan-500 transition-all text-xl md:text-4xl font-display font-black placeholder:text-white/10 placeholder:font-black placeholder:uppercase placeholder:text-[10px] placeholder:tracking-[0.3em] group-focus-within:bg-white/[0.08]"
                    />
                  </div>
                  <div className="space-y-4">
                    <p className="text-[10px] uppercase font-black text-white/20 tracking-[0.3em] ml-1">Upload Payment Proof</p>
                    <label className="flex flex-col items-center justify-center w-full aspect-video md:aspect-[21/9] border-2 border-dashed border-white/10 rounded-[1.5rem] md:rounded-[2rem] cursor-pointer hover:border-cyan-500/30 transition-all bg-white/[0.02] group/upload overflow-hidden relative">
                      {proofImage ? (
                        <div className="w-full h-full relative">
                          <img src={proofImage} alt="Proof" className="w-full h-full object-cover opacity-60" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="bg-emerald-500 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">Image Selected</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <CreditCard className="w-10 h-10 text-white/10 group-hover/upload:text-cyan-400 group-hover/upload:scale-110 transition-all mb-4" />
                          <p className="text-[10px] font-black text-white/20 uppercase tracking-widest group-hover/upload:text-white transition-colors">Tap to upload receipt metadata</p>
                        </div>
                      )}
                      <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                    </label>
                  </div>

                  <button 
                    onClick={handleRecharge}
                    disabled={isProcessing || !rechargeAmount || !proofImage}
                    className="w-full btn-primary py-5 md:py-6 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] shadow-2xl shadow-cyan-500/30 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing Transaction...' : 'Verify Transfer & Recharge'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'withdraw' && (
              <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-6 md:p-8 bg-cyan-500/5 border border-cyan-500/10 rounded-2xl md:rounded-[2rem] flex flex-col sm:flex-row gap-4 md:gap-6 items-center sm:items-start text-center sm:text-left">
                   <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-cyan-500/20 flex items-center justify-center shrink-0 shadow-2xl">
                     <AlertCircle size={20} className="text-cyan-400 md:w-6 md:h-6" />
                   </div>
                   <div>
                     <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-0.5 md:mb-1">Liquidation Protocol</p>
                     <p className="text-[10px] md:text-sm text-white/50 leading-relaxed font-light italic">
                        Node verification typically concludes within 24-48 standard cycles.
                     </p>
                   </div>
                </div>

                <div className="space-y-6 md:space-y-10">
                  <div className="space-y-3 md:space-y-4">
                    <label className="text-[9px] md:text-[10px] uppercase font-black text-white/20 tracking-[0.3em] ml-2">Source Terminal</label>
                    <div className="relative group">
                      <select 
                        value={withdrawWallet}
                        onChange={(e) => setWithdrawWallet(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl py-4 md:py-6 px-6 md:px-8 focus:outline-none focus:border-cyan-500 transition-all appearance-none cursor-pointer font-black text-[10px] md:text-sm uppercase tracking-widest focus:bg-white/[0.08]"
                      >
                        <option className="bg-slate-900" value="main">Main Yield Reservoir</option>
                        <option className="bg-slate-900" value="referral">Referral Growth Vault</option>
                        <option className="bg-slate-900" value="bonus">Bonus Reservoir</option>
                        <option className="bg-slate-900" value="investment">Investment Yields</option>
                      </select>
                      <ArrowUpRight size={16} className="absolute right-6 md:right-8 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
                    </div>
                    <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/5">
                      <p className="text-[10px] text-white/40 font-black">Available: <span className="text-white">₦{(userData?.balances as any)[withdrawWallet].toLocaleString()}</span></p>
                    </div>
                  </div>

                  <div className="space-y-3 md:space-y-4">
                    <label className="text-[9px] md:text-[10px] uppercase font-black text-white/20 tracking-[0.3em] ml-2">Liquidation Volatility</label>
                    <div className="relative group">
                      <span className="absolute left-6 md:left-8 top-1/2 -translate-y-1/2 text-pink-400 font-black text-lg md:text-xl">₦</span>
                      <input 
                         type="number" 
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="MIN 2,000" 
                        className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl py-4 md:py-6 pl-12 md:pl-16 pr-6 md:pr-8 focus:outline-none focus:border-cyan-500 transition-all font-black text-xl md:text-2xl placeholder:text-white/10 placeholder:text-[10px] placeholder:tracking-[0.2em] focus:bg-white/[0.08]"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 md:space-y-4">
                    <label className="text-[9px] md:text-[10px] uppercase font-black text-white/20 tracking-[0.3em] ml-2">External Settlement Account</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <input 
                        type="text" 
                        value={withdrawAccount}
                        onChange={(e) => setWithdrawAccount(e.target.value)}
                        placeholder="Account Node ID" 
                        className="bg-white/5 border border-white/10 rounded-xl md:rounded-2xl py-4 md:py-6 px-6 md:px-8 focus:outline-none focus:border-cyan-500 transition-all font-medium placeholder:text-white/10 text-sm" 
                      />
                      <div className="relative group">
                        <select 
                          value={withdrawBank}
                          onChange={(e) => setWithdrawBank(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl py-4 md:py-6 px-6 md:px-8 focus:outline-none focus:border-cyan-500 transition-all appearance-none cursor-pointer font-black text-[9px] md:text-[10px] uppercase tracking-widest focus:bg-white/[0.08]"
                        >
                          <option className="bg-slate-900" value="">Choose Bank Node</option>
                          <option className="bg-slate-900">ACCESS PROTOCOL</option>
                          <option className="bg-slate-900">KUDA META</option>
                          <option className="bg-slate-900">MONIEPOINT</option>
                          <option className="bg-slate-900">UBA NETWORK</option>
                          <option className="bg-slate-900">ZENITH CORE</option>
                        </select>
                        <ArrowDownLeft size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleWithdraw}
                    disabled={isProcessing || !withdrawAmount}
                    className="w-full btn-primary py-5 md:py-6 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] shadow-2xl shadow-cyan-500/30 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing Liquidation...' : 'Execute Vault Outflow'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'conversion' && (
              <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-2 gap-4 md:gap-8">
                   <button 
                     onClick={() => setConversionType('airtime')}
                     className={`p-6 md:p-10 border rounded-[2rem] md:rounded-[3rem] flex flex-col items-center gap-4 md:gap-6 group transition-all active:scale-95 shadow-xl md:shadow-2xl ${conversionType === 'airtime' ? 'bg-cyan-500/10 border-cyan-500/40' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                      <div className={`w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-[2.5rem] flex items-center justify-center transition-all duration-700 shadow-2xl border border-white/5 ${conversionType === 'airtime' ? 'bg-cyan-500/20 scale-110 rotate-12' : 'bg-white/5'}`}>
                        <Smartphone size={24} className={conversionType === 'airtime' ? 'text-cyan-400 md:w-10 md:h-10' : 'text-white/20 md:w-10 md:h-10'} />
                      </div>
                      <span className="font-black text-[8px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] text-white/60">Airtime Swap</span>
                   </button>
                   <button 
                     onClick={() => setConversionType('data')}
                     className={`p-6 md:p-10 border rounded-[2rem] md:rounded-[3rem] flex flex-col items-center gap-4 md:gap-6 group transition-all active:scale-95 shadow-xl md:shadow-2xl ${conversionType === 'data' ? 'bg-pink-500/10 border-pink-500/40' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                      <div className={`w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-[2.5rem] flex items-center justify-center transition-all duration-700 shadow-2xl border border-white/5 ${conversionType === 'data' ? 'bg-pink-500/20 scale-110 -rotate-12' : 'bg-white/5'}`}>
                        <Wifi size={24} className={conversionType === 'data' ? 'text-pink-400 md:w-10 md:h-10' : 'text-white/20 md:w-10 md:h-10'} />
                      </div>
                      <span className="font-black text-[8px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] text-white/60">Data Stream</span>
                   </button>
                </div>
                
                <div className="space-y-6 md:space-y-10">
                  <div className="space-y-3 md:space-y-4">
                    <label className="text-[9px] md:text-[10px] uppercase font-black text-white/20 tracking-[0.3em] ml-2">Receiver Link</label>
                    <input 
                      type="tel" 
                      value={convertPhone}
                      onChange={(e) => setConvertPhone(e.target.value)}
                      placeholder="080 0000 0000" 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 md:py-7 px-6 md:px-10 focus:outline-none focus:border-cyan-500 transition-all font-display font-black text-xl md:text-3xl placeholder:text-white/5 tracking-tighter" 
                    />
                  </div>

                  <div className="space-y-3 md:space-y-4">
                    <label className="text-[9px] md:text-[10px] uppercase font-black text-white/20 tracking-[0.3em] ml-2">Network Architecture</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-4">
                      {['MTN', 'AIRTEL', 'GLO', '9MOBILE'].map((n) => (
                        <button key={n} onClick={() => setNetwork(n)} className={`py-3 md:py-4 border rounded-xl md:rounded-2xl text-[8px] md:text-[9px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] transition-all active:scale-95 shadow-lg ${network === n ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400' : 'bg-white/5 border-white/5 text-white/20 hover:text-white/60'}`}>
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  {conversionType === 'data' && (
                    <div className="space-y-3 md:space-y-4 animate-in slide-in-from-top-2 duration-300">
                      <label className="text-[9px] md:text-[10px] uppercase font-black text-white/20 tracking-[0.3em] ml-2">Data Yield Package</label>
                      <div className="relative group">
                         <select 
                           value={dataPackage.price}
                           onChange={(e) => {
                             const pkg = dataPackages.find(p => p.price === Number(e.target.value));
                             if (pkg) setDataPackage({ price: pkg.price, label: pkg.val });
                           }}
                           className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl py-4 md:py-6 px-6 md:px-10 focus:outline-none focus:border-pink-500 transition-all appearance-none cursor-pointer font-black text-[10px] md:text-xs uppercase tracking-widest focus:bg-white/[0.08]"
                         >
                           {dataPackages.map(p => (
                             <option key={p.val} value={p.price} className="bg-slate-900">{p.label}</option>
                           ))}
                         </select>
                         <Wifi size={14} className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 text-pink-500 animate-pulse md:w-5 md:h-5" />
                      </div>
                    </div>
                  )}

                  {conversionType === 'airtime' && (
                    <div className="space-y-3 md:space-y-4 animate-in slide-in-from-top-2 duration-300">
                      <label className="text-[9px] md:text-[10px] uppercase font-black text-white/20 tracking-[0.3em] ml-2">Credit Value</label>
                      <div className="relative group">
                         <span className="absolute left-6 md:left-10 top-1/2 -translate-y-1/2 text-cyan-400 font-display font-black text-lg md:text-xl">₦</span>
                         <input 
                           type="number" 
                           value={convertValue}
                           onChange={(e) => setConvertValue(e.target.value)}
                           placeholder="Enter Value" 
                           className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl py-5 md:py-6 pl-10 md:pl-16 pr-6 md:pr-10 focus:outline-none focus:border-cyan-500 transition-all font-display font-black text-xl md:text-2xl placeholder:text-white/10" 
                         />
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 md:space-y-4">
                    <label className="text-[9px] md:text-[10px] uppercase font-black text-white/20 tracking-[0.3em] ml-2">Conversion Fuel</label>
                    <div className="relative group">
                      <select 
                        value={convertWallet}
                        onChange={(e) => setConvertWallet(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl py-4 md:py-6 px-6 md:px-10 focus:outline-none focus:border-cyan-500 transition-all appearance-none cursor-pointer font-black text-[10px] md:text-xs uppercase tracking-widest focus:bg-white/[0.08]"
                      >
                        <option className="bg-slate-900" value="main">MAIN YIELD Reservoir</option>
                        <option className="bg-slate-900" value="bonus">BONUS RESERVOIR</option>
                        <option className="bg-slate-900" value="investment">INVESTMENT WALLET</option>
                        <option className="bg-slate-900" value="referral">REFERRAL VAULT</option>
                      </select>
                      <Zap size={14} className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 text-cyan-400 animate-pulse md:w-5 md:h-5" />
                    </div>
                  </div>
                  <button 
                    onClick={handleConvert}
                    disabled={isProcessing}
                    className="w-full btn-primary py-5 md:py-6 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] shadow-2xl shadow-cyan-500/30 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isProcessing ? 'Swapping Assets...' : 'Initiate Asset Conversion'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8 md:space-y-12">
          <section>
            <div className="flex items-center justify-between mb-6 md:mb-8 px-2">
              <h3 className="text-lg md:text-xl font-display font-black italic uppercase tracking-widest flex items-center gap-3 md:gap-4">
                <div className="h-0.5 w-6 md:w-10 bg-cyan-500 rounded-full"></div> Ledger
              </h3>
              <button className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-cyan-400 transition-all">DEEP AUDIT</button>
            </div>
            <div className="glass-card p-2 md:p-3 space-y-1.5 md:space-y-2 border-white/5 shadow-2xl">
              {(userData as any)?.transactions?.length > 0 ? (
                [...(userData as any).transactions].reverse().map((t: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-4 md:p-6 hover:bg-white/[0.03] rounded-2xl md:rounded-[2rem] transition-all cursor-pointer group active:scale-[0.98] border border-transparent hover:border-white/5">
                    <div className="flex gap-3 md:gap-5 items-center">
                      <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center shadow-xl group-hover:rotate-12 transition-all ${t.amount > 0 ? 'bg-cyan-500/10 text-cyan-400' : 'bg-pink-500/10 text-pink-500'}`}>
                         {t.amount > 0 ? <ArrowDownLeft size={18} className="md:w-[22px] md:h-[22px]" /> : <ArrowUpRight size={18} className="md:w-[22px] md:h-[22px]" />}
                      </div>
                      <div>
                        <p className="text-[10px] md:text-xs font-black uppercase tracking-widest group-hover:text-white transition-colors">{t.title}</p>
                        <div className="flex items-center gap-2 md:gap-3 mt-1">
                          <p className="text-[8px] md:text-[9px] text-white/20 font-black uppercase italic">{new Date(t.time).toLocaleDateString()}</p>
                          <span className="w-1 h-1 bg-white/10 rounded-full"></span>
                          <p className="text-[8px] text-cyan-400/60 font-black uppercase tracking-[0.1em] md:tracking-[0.2em]">{t.status}</p>
                        </div>
                      </div>
                    </div>
                    <p className={`text-base md:text-xl font-display font-black ${t.amount > 0 ? 'text-cyan-400' : 'text-pink-500'}`}>
                      {t.amount > 0 ? '+' : '-'}₦{Math.abs(t.amount).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-white/20 italic uppercase tracking-widest text-xs font-black">
                  No records synchronized.
                </div>
              )}
            </div>
          </section>

          <div className="glass-card p-8 md:p-10 border-white/5 bg-gradient-to-br from-cyan-900/40 via-black to-black shadow-2xl relative overflow-hidden group">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.1),transparent)] group-hover:opacity-100 transition-opacity"></div>
             <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[2.5rem] bg-cyan-500 shadow-2xl shadow-cyan-500/40 flex items-center justify-center mb-6 md:mb-8 relative z-10 animate-float">
               <Zap size={24} className="text-white fill-white md:w-8 md:h-8" />
             </div>
             <h4 className="font-display font-black text-xl md:text-2xl mb-3 md:mb-4 italic uppercase tracking-tight relative z-10">Maximizer <br /> Protocol.</h4>
             <p className="text-xs md:text-sm text-white/40 leading-relaxed font-light italic relative z-10">
               Leverage your <b>Bonus Reservoir</b> for instant Airtime Swap once you hit the ₦2,000 baseline. Network growth accelerates liquidity.
             </p>
             <div className="mt-6 md:mt-8 relative z-10">
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                   <div className="w-3/4 h-full bg-gradient-to-r from-cyan-400 to-blue-600 shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
                </div>
                <p className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] text-white/20 mt-3 md:mt-4">75% to Next Unlock</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
