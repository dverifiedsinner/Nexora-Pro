import React, { useState, useEffect } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  Zap, 
  Smartphone, 
  Wifi, 
  Globe, 
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Shield,
  Layers,
  History,
  Info,
  ChevronRight,
  Plus,
  Wallet as WalletIcon,
  Copy,
  Users,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  doc,
  getDoc
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

export default function Wallet() {
  const { user, userData } = useAuth();
  const [activeTab, setActiveTab] = useState<'recharge' | 'withdraw' | 'conversion'>('recharge');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [depositMethod, setDepositMethod] = useState<'bank' | 'usdt'>('bank');
  const [usdtNetwork, setUsdtNetwork] = useState<'trc20' | 'erc20'>('trc20');
  
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [proofImage, setProofImage] = useState<string | null>(null);

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAccount, setWithdrawAccount] = useState('');
  const [withdrawBank, setWithdrawBank] = useState('');
  const [withdrawWallet, setWithdrawWallet] = useState('main');

  const [conversionType, setConversionType] = useState<'airtime' | 'data' | 'cable' | 'electricity'>('airtime');
  const [convertPhone, setConvertPhone] = useState('');
  const [billersCode, setBillersCode] = useState('');
  const [convertValue, setConvertValue] = useState('');
  const [network, setNetwork] = useState('MTN');
  const [utilityService, setUtilityService] = useState('dstv');
  const [convertWallet, setConvertWallet] = useState('main');

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => setProofImage(event.target?.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleRecharge = async () => {
    if (!user || !rechargeAmount) return;
    setIsProcessing(true);
    try {
      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        amount: Number(rechargeAmount),
        type: 'funding',
        status: 'pending',
        method: depositMethod,
        network: depositMethod === 'usdt' ? usdtNetwork : 'N/A',
        proof: proofImage,
        createdAt: serverTimestamp(),
        title: `Wallet Funding [${depositMethod.toUpperCase()}]`
      });
      alert('Funding request submitted. Awaiting verification.');
      setRechargeAmount('');
      setProofImage(null);
    } catch (err) {
      console.error(err);
      alert('Funding failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!user || !withdrawAmount) return;
    setIsProcessing(true);
    try {
      await addDoc(collection(db, 'withdrawals'), {
        userId: user.uid,
        amount: Number(withdrawAmount),
        account: withdrawAccount,
        bank: withdrawBank,
        wallet: withdrawWallet,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      alert('Withdrawal request initialized.');
      setWithdrawAmount('');
    } catch (err) {
      console.error(err);
      alert('Withdrawal failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConvert = async () => {
    if (!user || !convertValue) return;
    setIsProcessing(true);
    try {
      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        amount: -Number(convertValue),
        type: 'conversion',
        subType: conversionType,
        status: 'completed',
        createdAt: serverTimestamp(),
        title: `Service: ${conversionType.toUpperCase()}`
      });
      alert('Transaction successful.');
      setConvertValue('');
    } catch (err) {
      console.error(err);
      alert('Transaction failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const balances = [
    { label: 'Main Wallet', value: userData?.balances?.main || 0, icon: WalletIcon, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    { label: 'Bonus Balance', value: userData?.balances?.bonus || 0, icon: Zap, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Referral Earnings', value: userData?.balances?.referral || 0, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pb-32 font-sans">
      {/* Header */}
      <header className="p-10 bg-slate-900 text-white rounded-b-[4rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[150px] translate-x-1/2 -translate-y-1/2" />
        <div className="relative z-10 space-y-10">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-black italic tracking-tighter">FINANCE <span className="text-cyan-400">HUB</span></h1>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Neural Asset Reconciliation</p>
            </div>
            <button className="p-4 bg-white/5 rounded-[1.5rem] border border-white/10 hover:bg-white/10 transition-all group">
              <History size={24} className="group-hover:rotate-[-45deg] transition-transform" />
            </button>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em]">Total Liquidity</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-500 italic">₦</span>
                <p className="text-6xl font-black italic tracking-tighter tabular-nums drop-shadow-2xl">
                  {((userData?.balances?.main || 0) + (userData?.balances?.bonus || 0) + (userData?.balances?.referral || 0)).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex gap-2 p-1.5 bg-slate-950/50 backdrop-blur-xl rounded-[2rem] border border-white/5 w-full md:w-auto h-fit">
              {[
                { id: 'recharge', label: 'DEPOSIT' },
                { id: 'withdraw', label: 'REDEEM' },
                { id: 'conversion', label: 'UTILITY' },
              ].map((tab) => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 md:flex-none md:min-w-[120px] py-4 px-6 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-slate-900 shadow-2xl' : 'text-slate-500 hover:text-white'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="p-8 space-y-12 max-w-lg mx-auto lg:max-w-none lg:grid lg:grid-cols-3 lg:gap-12 lg:space-y-0">
        <div className="lg:col-span-2 space-y-12">
          {/* Balance Cards */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {balances.map((wallet, idx) => (
              <div key={idx} className={`bg-white dark:bg-slate-900 p-8 rounded-[3rem] space-y-6 border border-slate-100 dark:border-slate-800/50 shadow-2xl shadow-slate-950/5 hover:border-cyan-500/30 transition-all group`}>
                <div className={`w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center ${wallet.color} transition-transform group-hover:scale-110`}>
                  <wallet.icon size={28} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{wallet.label}</p>
                  <p className="text-2xl font-black italic tracking-tight">₦{wallet.value.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </section>

          {/* Form Area */}
          <section className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-10 shadow-2xl border border-slate-100 dark:border-slate-800/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
            
            <AnimatePresence mode="wait">
              {activeTab === 'recharge' && (
                <motion.div 
                  key="recharge"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-10 relative z-10"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-cyan-500/10 text-cyan-500 rounded-[1.5rem] flex items-center justify-center border border-cyan-500/20">
                      <Plus size={28} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black italic tracking-tight uppercase">Deposit Assets</h2>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Injection Cycle: Manual Verification</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={() => setDepositMethod('bank')}
                      className={`flex-1 p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-4 ${depositMethod === 'bank' ? 'border-cyan-500 bg-cyan-500/5 text-cyan-400' : 'border-slate-100 dark:border-slate-800 text-slate-500'}`}
                    >
                      <Globe size={32} />
                      <span className="text-[10px] font-black uppercase tracking-widest">FIAT TRANS</span>
                    </button>
                    <button 
                      onClick={() => setDepositMethod('usdt')}
                      className={`flex-1 p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-4 ${depositMethod === 'usdt' ? 'border-cyan-500 bg-cyan-500/5 text-cyan-400' : 'border-slate-100 dark:border-slate-800 text-slate-500'}`}
                    >
                      <Zap size={32} />
                      <span className="text-[10px] font-black uppercase tracking-widest">USDT RAILS</span>
                    </button>
                  </div>

                  {depositMethod === 'bank' ? (
                    <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] space-y-6 border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Terminal Endpoint</p>
                      <div className="space-y-4">
                        {[
                          { label: 'Bank Name', value: 'Opay Digital' },
                          { label: 'Account Number', value: '6680458614', copyable: true },
                          { label: 'Account Name', value: 'EARNPAL SYSTEM' },
                        ].map(item => (
                          <div key={item.label} className="flex justify-between items-center group">
                            <span className="text-xs font-bold text-slate-400">{item.label}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-black tabular-nums italic text-slate-900 dark:text-white">{item.value}</span>
                              {item.copyable && (
                                <button className="p-2 bg-white/50 dark:bg-slate-900/50 rounded-lg text-cyan-500 hover:bg-cyan-500 hover:text-white transition-all shadow-sm">
                                  <Copy size={12} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 bg-slate-900 text-white rounded-[2.5rem] space-y-8 border border-white/5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Node Address</span>
                        <div className="flex gap-2">
                          {['trc20', 'erc20'].map(net => (
                            <button 
                              key={net} 
                              onClick={() => setUsdtNetwork(net as any)} 
                              className={`px-4 py-2 text-[10px] rounded-xl font-black uppercase tracking-widest border transition-all ${usdtNetwork === net ? 'bg-cyan-500 border-cyan-500 text-white' : 'bg-transparent border-white/10 text-slate-500 hover:border-white/20'}`}
                            >
                              {net}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-slate-950 p-6 rounded-2xl font-mono text-xs break-all border border-white/5 text-cyan-400 selection:bg-cyan-500 selection:text-white">
                          {usdtNetwork === 'trc20' ? 'TXH6k8pL8jY8mR2mP7qZ5nS9vW4xY2zL1p' : '0x8f23db9c017d2a84e2c7a6e5b4f3d2e1c098a7b6'}
                        </div>
                      </div>
                      <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-center">
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Network Exchange Rate: 1 USDT = ₦1,450</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Injection Volume (₦)</label>
                      <input 
                        type="number" 
                        value={rechargeAmount}
                        onChange={(e) => setRechargeAmount(e.target.value)}
                        placeholder="MIN 1,000" 
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[2rem] py-6 px-8 text-3xl font-black italic tracking-tighter tabular-nums focus:outline-none focus:ring-1 ring-cyan-500 transition-all placeholder:text-slate-700"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Transmission Receipt (JPG/PNG)</label>
                      <label className="block border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-10 text-center cursor-pointer hover:border-cyan-500 transition-all group overflow-hidden relative">
                        {proofImage ? (
                          <div className="space-y-4">
                            <img src={proofImage} alt="Proof" className="max-h-64 mx-auto rounded-2xl shadow-2xl transition-transform group-hover:scale-105 duration-1000" />
                            <div className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-[10px] font-black tracking-widest inline-block uppercase">Packet Attached ✓</div>
                          </div>
                        ) : (
                          <div className="space-y-5">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400 group-hover:scale-110 transition-transform">
                              <Plus size={32} />
                            </div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Click to upload transmission proof</p>
                          </div>
                        )}
                        <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                      </label>
                    </div>

                    <button 
                      onClick={handleRecharge}
                      disabled={isProcessing}
                      className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-6 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-4 shadow-2xl active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <><CheckCircle2 size={24} /> INITIALIZE SETTLEMENT</>}
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'withdraw' && (
                <motion.div 
                  key="withdraw"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-10 relative z-10"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-rose-500/10 text-rose-500 rounded-[1.5rem] flex items-center justify-center border border-rose-500/20">
                      <ArrowDownLeft size={28} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black italic tracking-tight uppercase">Redeem Assets</h2>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Liquidation Cycle: Instant Settlement</p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Source Node</label>
                      <select 
                        value={withdrawWallet}
                        onChange={(e) => setWithdrawWallet(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[2rem] py-6 px-8 font-black italic text-sm tracking-tight focus:outline-none focus:ring-1 ring-rose-500 transition-all"
                      >
                        <option value="main">Main Wallet (₦{(userData?.balances?.main || 0).toLocaleString()})</option>
                        <option value="bonus">Bonus Balance (₦{(userData?.balances?.bonus || 0).toLocaleString()})</option>
                        <option value="referral">Referral Referral (₦{(userData?.balances?.referral || 0).toLocaleString()})</option>
                      </select>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Redemption Volume (₦)</label>
                      <input 
                        type="number" 
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="0.00" 
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[2rem] py-6 px-8 text-3xl font-black italic tracking-tighter tabular-nums focus:outline-none focus:ring-1 ring-rose-500 transition-all placeholder:text-slate-700"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Target Institution</label>
                        <select 
                          value={withdrawBank}
                          onChange={(e) => setWithdrawBank(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[2rem] py-6 px-8 font-black italic text-sm tracking-tight focus:outline-none focus:ring-1 ring-rose-500 transition-all"
                        >
                          <option value="">Select Endpoint</option>
                          <option value="access">Access Bank</option>
                          <option value="kuda">Kuda Bank</option>
                          <option value="opay">OPay</option>
                          <option value="zenith">Zenith Bank</option>
                        </select>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Node Account ID</label>
                        <input 
                          type="text" 
                          value={withdrawAccount}
                          onChange={(e) => setWithdrawAccount(e.target.value)}
                          placeholder="10 DIGITS" 
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[2rem] py-6 px-8 font-black italic text-sm tracking-tight focus:outline-none focus:ring-1 ring-rose-500 transition-all placeholder:text-slate-700 uppercase"
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleWithdraw}
                    disabled={isProcessing}
                    className="w-full bg-rose-600 text-white py-6 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-4 shadow-2xl active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <><ArrowDownLeft size={24} /> INITIALIZE REDEMPTION</>}
                  </button>
                </motion.div>
              )}

              {activeTab === 'conversion' && (
                <motion.div 
                  key="conversion"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-10 relative z-10"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-indigo-500/10 text-indigo-500 rounded-[1.5rem] flex items-center justify-center border border-indigo-500/20">
                      <Smartphone size={28} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black italic tracking-tight uppercase">Network Utilities</h2>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Utility Cycle: Real-time Provisioning</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { id: 'airtime', icon: Smartphone, label: 'AIRTIME' },
                      { id: 'data', icon: Wifi, label: 'DATA' },
                      { id: 'cable', icon: AlertCircle, label: 'CABLE' },
                      { id: 'electricity', icon: Zap, label: 'POWER' },
                    ].map((type) => (
                      <button 
                        key={type.id}
                        onClick={() => setConversionType(type.id as any)}
                        className={`p-6 rounded-[2rem] border transition-all flex flex-col items-center gap-3 ${conversionType === type.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xl' : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800 text-slate-500 hover:border-indigo-500/50'}`}
                      >
                        <type.icon size={24} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{type.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Terminal Service</label>
                        <select 
                          value={conversionType === 'airtime' || conversionType === 'data' ? network : utilityService}
                          onChange={(e) => conversionType === 'airtime' || conversionType === 'data' ? setNetwork(e.target.value) : setUtilityService(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[2rem] py-6 px-8 font-black italic text-sm tracking-tight focus:outline-none focus:ring-1 ring-indigo-500 transition-all uppercase"
                        >
                          {conversionType === 'airtime' || conversionType === 'data' ? (
                            <>
                              <option value="MTN">MTN RAIL</option>
                              <option value="AIRTEL">AIRTEL RAIL</option>
                              <option value="GLO">GLO RAIL</option>
                              <option value="9MOBILE">9MOBILE RAIL</option>
                            </>
                          ) : (
                            <option value="dstv">DSTV PROVIDER</option>
                          )}
                        </select>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">
                          {conversionType === 'airtime' || conversionType === 'data' ? 'Transmission Key (PHONE)' : 'Node Address (METER)'}
                        </label>
                        <input 
                          type="text" 
                          value={conversionType === 'airtime' || conversionType === 'data' ? convertPhone : billersCode}
                          onChange={(e) => conversionType === 'airtime' || conversionType === 'data' ? setConvertPhone(e.target.value) : setBillersCode(e.target.value)}
                          placeholder="INPUT VALUE" 
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[2rem] py-6 px-8 font-black italic text-sm tracking-tight focus:outline-none focus:ring-1 ring-indigo-500 transition-all uppercase"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Utility Volume (₦)</label>
                      <input 
                        type="number" 
                        value={convertValue}
                        onChange={(e) => setConvertValue(e.target.value)}
                        placeholder="0.00" 
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[2rem] py-6 px-8 text-3xl font-black italic tracking-tighter tabular-nums focus:outline-none focus:ring-1 ring-indigo-500 transition-all placeholder:text-slate-700"
                      />
                    </div>

                    <button 
                      onClick={handleConvert}
                      disabled={isProcessing}
                      className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-4 shadow-2xl active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <><CheckCircle2 size={24} /> INITIALIZE PROVISIONING</>}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>

        {/* Ledger Sidebar */}
        <section className="bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-2xl border border-slate-100 dark:border-slate-800/50 overflow-hidden h-fit relative">
          <div className="absolute inset-0 bg-cyan-500/[0.02] pointer-events-none" />
          <div className="p-10 border-b border-slate-100 dark:border-slate-800 relative z-10">
            <h3 className="text-xl font-black italic tracking-tight flex items-center gap-4 uppercase">
              <History className="text-cyan-500" size={28} /> 
              Transmission Log
            </h3>
          </div>

          <div className="divide-y divide-slate-50 dark:divide-slate-800 relative z-10">
            {transactions.length > 0 ? (
              transactions.map((t: any) => (
                <div key={t.id} className="p-8 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group cursor-pointer border-l-4 border-transparent hover:border-cyan-500">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-[-12deg] ${
                        t.amount > 0 ? 'bg-cyan-500/10 text-cyan-500' : 'bg-rose-500/10 text-rose-500'
                      }`}>
                        {t.amount > 0 ? <ArrowUpRight size={24} /> : <ArrowDownLeft size={24} />}
                      </div>
                      <div>
                        <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-500 truncate w-32">{t.title}</h4>
                        <p className="text-[10px] font-black tabular-nums tracking-widest text-slate-400 mt-1 uppercase">
                          {t.createdAt?.toDate ? t.createdAt.toDate().toLocaleDateString() : 'TRANSMITTING...'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-black italic tracking-tight tabular-nums ${t.amount > 0 ? 'text-cyan-500' : 'text-rose-500'}`}>
                        {t.amount > 0 ? '+' : '-'}₦{Math.abs(t.amount).toLocaleString()}
                      </p>
                      <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full ${
                        t.status === 'pending' ? 'bg-yellow-400/10 text-yellow-500 border border-yellow-400/20' : 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-16 text-center space-y-6">
                <div className="w-20 h-20 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-300">
                  <Info size={40} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Log Empty: No data packets detected</p>
              </div>
            )}
          </div>
          
          <div className="p-10 bg-slate-900 text-white relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <Shield className="text-cyan-500" size={24} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">AES-256 ENCRYPTED</span>
            </div>
            <p className="text-xs text-slate-400 font-medium leading-relaxed italic opacity-80">
              Finalizing settlements via peer-to-peer verification nodes. Standard processing time: 5-30m.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

