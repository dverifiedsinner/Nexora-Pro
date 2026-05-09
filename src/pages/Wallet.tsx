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
  Info
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
  
  // Recharge states
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [proofImage, setProofImage] = useState<string | null>(null);

  // Withdrawal states
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAccount, setWithdrawAccount] = useState('');
  const [withdrawBank, setWithdrawBank] = useState('');
  const [withdrawWallet, setWithdrawWallet] = useState('main');

  // Conversion states
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
        title: `Node Recharge [${depositMethod.toUpperCase()}]`
      });
      alert('Node synchronization initialized. Awaiting verification.');
      setRechargeAmount('');
      setProofImage(null);
    } catch (err) {
      console.error(err);
      alert('Node sync failed');
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
      alert('Liquidation request queued in settlement layer.');
      setWithdrawAmount('');
    } catch (err) {
      console.error(err);
      alert('Liquidation failed');
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
        title: `Asset Swap: ${conversionType.toUpperCase()}`
      });
      alert('Asset swap successful.');
      setConvertValue('');
    } catch (err) {
      console.error(err);
      alert('Swap execution error');
    } finally {
      setIsProcessing(false);
    }
  };

  const balances = [
    { label: 'MAIN_RESERVOIR', value: userData?.balances?.main || 0, icon: Shield, color: 'text-yellow-400', bg: 'bg-ink' },
    { label: 'BONUS_STORAGE', value: userData?.balances?.bonus || 0, icon: Zap, color: 'text-cyan-400', bg: 'bg-slate-900' },
    { label: 'NET_YIELD_VAULT', value: userData?.balances?.referral || 0, icon: Layers, color: 'text-emerald-400', bg: 'bg-ink' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-ink">
      {/* Brutalist Header */}
      <div className="bg-yellow-400 border-b-4 border-ink p-10 md:p-16 relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
          <Globe size={300} className="translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="space-y-4">
            <span className="text-[10px] font-mono font-black uppercase tracking-[0.5em] text-ink/40">FINANCE_ENGINE_v4.2</span>
            <h1 className="text-6xl md:text-8xl font-display font-black tracking-tighter uppercase italic leading-none">CORE<br />VAULT.</h1>
          </div>
          
          <div className="grid grid-cols-3 gap-0 border-4 border-ink bg-white overflow-hidden w-full md:w-auto">
            {[
              { id: 'recharge', label: 'RECHARGE' },
              { id: 'withdraw', label: 'OUTFLOW' },
              { id: 'conversion', label: 'SWAP' },
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-5 px-8 font-mono font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-ink text-yellow-400' : 'hover:bg-yellow-50 text-ink/40'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Balance Grid */}
      <div className="grid md:grid-cols-3 gap-0 border-b-4 border-ink">
        {balances.map((wallet, idx) => (
          <div key={idx} className={`p-10 md:p-12 border-b-4 md:border-b-0 md:border-r-4 last:border-r-0 border-ink ${wallet.bg} text-white group cursor-crosshair relative overflow-hidden`}>
            <div className="relative z-10 flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <div className={`p-4 border-2 border-white/20 ${wallet.color}`}>
                  <wallet.icon size={24} />
                </div>
                <span className="text-[10px] font-mono font-black opacity-40 group-hover:opacity-100 transition-opacity">{wallet.label}</span>
              </div>
              <p className={`text-5xl md:text-6xl font-display font-black tracking-tighter ${wallet.color}`}>
                ₦{wallet.value.toLocaleString()}
              </p>
            </div>
            <div className="absolute right-[-20px] bottom-[-20px] opacity-5 group-hover:opacity-10 transition-opacity">
              <wallet.icon size={150} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid lg:grid-cols-3 gap-0 border-b-4 border-ink">
        <div className="lg:col-span-2 p-10 md:p-16 lg:border-r-4 border-ink bg-white">
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              {activeTab === 'recharge' && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-16"
                >
                  <div className="space-y-4">
                    <span className="text-[10px] font-mono font-black uppercase text-ink/40 tracking-[0.4em]">NODE_INFLOW_v8</span>
                    <h2 className="text-5xl font-display font-black italic uppercase leading-none">RECHARGE<br />PROTOCOL.</h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <button 
                      onClick={() => setDepositMethod('bank')}
                      className={`p-10 border-4 transition-all flex flex-col gap-8 ${depositMethod === 'bank' ? 'bg-yellow-400 border-ink shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]' : 'bg-slate-50 border-ink/10 text-ink/30 hover:border-ink/40'}`}
                    >
                      <Globe size={40} />
                      <div className="text-left">
                        <p className="font-black text-xs uppercase tracking-widest leading-none mb-2">BANK_SETTLEMENT</p>
                        <p className="text-[10px] font-mono opacity-60">LOCAL_TRANSACTION_BUS</p>
                      </div>
                    </button>

                    <button 
                      onClick={() => setDepositMethod('usdt')}
                      className={`p-10 border-4 transition-all flex flex-col gap-8 ${depositMethod === 'usdt' ? 'bg-ink text-yellow-400 border-ink shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]' : 'bg-slate-50 border-ink/10 text-ink/30 hover:border-ink/40'}`}
                    >
                      <Zap size={40} />
                      <div className="text-left">
                        <p className="font-black text-xs uppercase tracking-widest leading-none mb-2">CRYPTO_GATEWAY</p>
                        <p className="text-[10px] font-mono opacity-60">USDT_LIQUIDITY_PROTOCOL</p>
                      </div>
                    </button>
                  </div>

                  {depositMethod === 'bank' ? (
                    <div className="p-8 border-4 border-ink bg-slate-50 space-y-6">
                      <div className="flex justify-between items-center border-b-2 border-ink pb-4">
                        <span className="text-[10px] font-mono font-black uppercase">PROTOCOL_SETTLEMENT</span>
                        <Shield className="opacity-20" size={20} />
                      </div>
                      <div className="space-y-4">
                        {[
                          { label: 'BANK_NAME', value: 'OPAY_DIGITAL' },
                          { label: 'ACC_NODE_ID', value: '6680458614' },
                          { label: 'LEGACY_NAME', value: 'NEXORA SYSTEM' },
                        ].map(item => (
                          <div key={item.label} className="flex justify-between border-b border-ink/10 pb-2">
                            <span className="text-[8px] font-mono font-black uppercase opacity-40">{item.label}</span>
                            <span className="text-sm font-black">{item.value}</span>
                          </div>
                        ))}
                      </div>
                      <div className="p-4 bg-yellow-400 border-2 border-ink text-[8px] font-black uppercase text-center">
                        Execute transfer strictly to this node ID
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 border-4 border-ink bg-slate-900 text-yellow-400 space-y-6">
                      <div className="flex justify-between items-center border-b-2 border-yellow-400/20 pb-4">
                        <span className="text-[10px] font-mono font-black uppercase">CRYPTO_LIQUIDATION</span>
                        <div className="flex gap-2">
                          {['trc20', 'erc20'].map(net => (
                            <button 
                              key={net} 
                              onClick={() => setUsdtNetwork(net as any)} 
                              className={`px-3 py-1 text-[8px] border-2 font-black uppercase ${usdtNetwork === net ? 'bg-yellow-400 text-ink border-yellow-400' : 'border-yellow-400/20 text-yellow-400/60'}`}
                            >
                              {net}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <p className="text-[8px] font-mono font-black uppercase opacity-40">HEX_WALLET_ADDRESS ({usdtNetwork.toUpperCase()})</p>
                        <div className="bg-white/5 p-6 border-2 border-white/10 font-mono text-[10px] break-all">
                          {usdtNetwork === 'trc20' ? 'TXH6k8pL8jY8mR2mP7qZ5nS9vW4xY2zL1p' : '0x8f23db9c017d2a84e2c7a6e5b4f3d2e1c098a7b6'}
                        </div>
                      </div>
                      <p className="text-[8px] font-mono uppercase opacity-40 italic text-center">Rate: 1 USDT = ₦1,450_FIAT</p>
                    </div>
                  )}

                  <div className="space-y-12">
                    <div className="space-y-4">
                      <label className="text-[10px] font-mono font-black uppercase tracking-widest text-ink/40">INPUT_QUANTUM_VALUE (₦)</label>
                      <div className="relative">
                        <span className="absolute left-10 top-1/2 -translate-y-1/2 text-3xl font-black opacity-20">₦</span>
                        <input 
                          type="text" 
                          value={rechargeAmount}
                          onChange={(e) => setRechargeAmount(e.target.value)}
                          placeholder="0.00" 
                          className="w-full bg-slate-50 border-4 border-ink py-12 pl-24 pr-10 text-6xl font-display font-black focus:outline-none focus:bg-yellow-50 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-mono font-black uppercase tracking-widest text-ink/40">SETTLEMENT_RECEIPT_CAPTURE</label>
                      <label className="block border-4 border-dashed border-ink/20 p-16 text-center cursor-pointer hover:bg-slate-50 transition-colors">
                        {proofImage ? (
                          <div className="space-y-4">
                            <img src={proofImage} alt="Proof" className="max-h-64 mx-auto grayscale shadow-2xl" />
                            <p className="text-[10px] font-mono font-black uppercase text-emerald-600 tracking-widest italic animate-pulse">RECEIPT_METADATA_LOADED</p>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            <CreditCard size={64} className="mx-auto opacity-10" />
                            <p className="text-[10px] font-mono font-black uppercase opacity-40 italic underline decoration-4 underline-offset-8">UPLOAD_TRANSACTION_SNAPSHOT</p>
                          </div>
                        )}
                        <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                      </label>
                    </div>

                    <button 
                      onClick={handleRecharge}
                      disabled={isProcessing}
                      className="w-full bg-ink text-yellow-400 py-12 font-black text-sm uppercase tracking-[0.6em] border-4 border-ink hover:bg-slate-900 active:translate-y-2 active:shadow-none shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-6"
                    >
                      {isProcessing ? 'SYNCHRONIZING...' : 'EXECUTE_SYNC'} <ArrowRight size={20} />
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'withdraw' && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-16"
                >
                  <div className="space-y-4">
                    <span className="text-[10px] font-mono font-black uppercase text-ink/40 tracking-[0.4em]">OUTFLOW_PROTOCOL_v4</span>
                    <h2 className="text-5xl font-display font-black italic uppercase leading-none">VAULT<br />LIQUIDATION.</h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <label className="text-[10px] font-mono font-black uppercase opacity-40">SOURCE_RESERVOIR</label>
                      <select 
                        value={withdrawWallet}
                        onChange={(e) => setWithdrawWallet(e.target.value)}
                        className="w-full bg-slate-50 border-4 border-ink py-8 px-10 font-black text-xs uppercase focus:outline-none appearance-none"
                      >
                        <option value="main">MAIN_CORE_RESERVE</option>
                        <option value="bonus">BONUS_VAULT_NODE</option>
                        <option value="referral">YIELD_NET_STORAGE</option>
                        <option value="investment">ASSET_GROWTH_POOL</option>
                      </select>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-mono font-black uppercase opacity-40">LIQUIDATION_VOLATILITY</label>
                      <div className="relative">
                        <span className="absolute left-8 top-1/2 -translate-y-1/2 font-black opacity-20">₦</span>
                        <input 
                          type="text" 
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          placeholder="0.00" 
                          className="w-full bg-slate-50 border-4 border-ink py-7 pl-16 pr-10 text-3xl font-display font-black focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <label className="text-[10px] font-mono font-black uppercase opacity-40">EXTERNAL_SETTLEMENT_LINK</label>
                    <div className="grid md:grid-cols-2 gap-4">
                      <input 
                        type="text" 
                        value={withdrawAccount}
                        onChange={(e) => setWithdrawAccount(e.target.value)}
                        placeholder="ACCOUNT_HEX_ID" 
                        className="w-full bg-slate-50 border-4 border-ink py-8 px-10 font-black text-xs focus:outline-none"
                      />
                      <select 
                        value={withdrawBank}
                        onChange={(e) => setWithdrawBank(e.target.value)}
                        className="w-full bg-slate-50 border-4 border-ink py-8 px-10 font-black text-xs uppercase focus:outline-none"
                      >
                        <option value="">SELECT_BANK_NODE</option>
                        <option value="access">ACCESS_PROTO</option>
                        <option value="kuda">KUDA_META</option>
                        <option value="moniepoint">MONIE_ENGINE</option>
                        <option value="zenith">ZENITH_NET</option>
                      </select>
                    </div>
                  </div>

                  <button 
                    onClick={handleWithdraw}
                    disabled={isProcessing}
                    className="w-full bg-yellow-400 text-ink py-12 font-black text-sm uppercase tracking-[0.6em] border-4 border-ink hover:bg-yellow-500 active:translate-y-2 transition-all shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]"
                  >
                    {isProcessing ? 'DECRYPTING...' : 'INITIALIZE_OUTFLOW'}
                  </button>
                </motion.div>
              )}

              {activeTab === 'conversion' && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-16"
                >
                  <div className="space-y-4">
                    <span className="text-[10px] font-mono font-black uppercase text-ink/40 tracking-[0.4em]">SWAP_INTERFACE_v7</span>
                    <h2 className="text-5xl font-display font-black italic uppercase leading-none">ASSET<br />SWAP.</h2>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-4 border-ink">
                    {[
                      { id: 'airtime', icon: Smartphone, label: 'AIRTIME' },
                      { id: 'data', icon: Wifi, label: 'DATA_PKT' },
                      { id: 'cable', icon: Zap, label: 'SAT_TV' },
                      { id: 'electricity', icon: AlertCircle, label: 'GRID_PWR' },
                    ].map((type) => (
                      <button 
                        key={type.id}
                        onClick={() => setConversionType(type.id as any)}
                        className={`p-10 border-r-4 last:border-r-0 border-ink transition-all flex flex-col items-center gap-4 ${conversionType === type.id ? 'bg-yellow-400' : 'bg-white hover:bg-slate-50'}`}
                      >
                        <type.icon size={28} className={conversionType === type.id ? 'text-ink' : 'text-ink/20'} />
                        <span className="text-[9px] font-mono font-black uppercase tracking-widest">{type.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-12">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-mono font-black uppercase opacity-40">TARGET_RECIPIENT_NODE</label>
                        <input 
                          type="text" 
                          value={conversionType === 'airtime' || conversionType === 'data' ? convertPhone : billersCode}
                          onChange={(e) => conversionType === 'airtime' || conversionType === 'data' ? setConvertPhone(e.target.value) : setBillersCode(e.target.value)}
                          placeholder="080_ADDRESS" 
                          className="w-full bg-slate-50 border-4 border-ink py-8 px-10 font-display font-black text-4xl tracking-tighter focus:outline-none"
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] font-mono font-black uppercase opacity-40">ARCHITECTURE</label>
                        <select 
                          value={conversionType === 'airtime' || conversionType === 'data' ? network : utilityService}
                          onChange={(e) => conversionType === 'airtime' || conversionType === 'data' ? setNetwork(e.target.value) : setUtilityService(e.target.value)}
                          className="w-full bg-slate-50 border-4 border-ink py-8 px-10 font-black text-xs uppercase focus:outline-none"
                        >
                          {conversionType === 'airtime' || conversionType === 'data' ? (
                            <>
                              <option value="MTN">MTN_NET_ALPHA</option>
                              <option value="AIRTEL">AIRTEL_NET_BETA</option>
                              <option value="GLO">GLO_NET_GAMMA</option>
                            </>
                          ) : (
                            <option value="dstv">DSTV_PROTOCOL</option>
                          )}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-4">
                        <label className="text-[10px] font-mono font-black uppercase opacity-40">SWAP_FUEL_SOURCE</label>
                        <select 
                          value={convertWallet}
                          onChange={(e) => setConvertWallet(e.target.value)}
                          className="w-full bg-slate-50 border-4 border-ink py-6 px-10 font-black text-[10px] focus:outline-none"
                        >
                          <option value="main">MAIN_CORE_RESERVE</option>
                          <option value="bonus">BONUS_VAULT_NODE</option>
                        </select>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] font-mono font-black uppercase opacity-40">SWAP_VALUE</label>
                        <input 
                          type="text" 
                          value={convertValue}
                          onChange={(e) => setConvertValue(e.target.value)}
                          placeholder="₦0.00" 
                          className="w-full bg-slate-50 border-4 border-ink py-8 px-10 font-display font-black text-3xl focus:outline-none"
                        />
                      </div>
                    </div>

                    <button 
                      onClick={handleConvert}
                      disabled={isProcessing}
                      className="w-full bg-ink text-white py-12 font-black text-sm uppercase tracking-[0.6em] border-4 border-ink hover:bg-slate-900 active:translate-y-2 transition-all transition-all"
                    >
                      {isProcessing ? 'ROUTING_PACKETS...' : 'EXECUTE_SWAP'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Ledger Sidebar */}
        <div className="bg-slate-50 min-h-screen">
          <div className="p-10 border-b-4 border-ink bg-white sticky top-0 z-20">
            <h3 className="text-3xl font-display font-black italic uppercase tracking-widest flex items-center gap-4">
              <History size={28} /> LEDGER.
            </h3>
          </div>

          <div className="divide-y-4 divide-ink">
            {transactions.length > 0 ? (
              transactions.map((t: any) => (
                <div key={t.id} className="p-10 bg-white hover:bg-yellow-400 group transition-all cursor-pointer relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight size={24} />
                  </div>
                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <div className="space-y-1">
                      <p className="text-[10px] font-mono font-black uppercase opacity-40 group-hover:text-ink/60">
                        {t.createdAt?.toDate ? t.createdAt.toDate().toLocaleString() : 'PENDING_SYNC'}
                      </p>
                      <h4 className="text-xl font-display font-black uppercase tracking-tight leading-none group-hover:text-ink">
                        {t.title}
                      </h4>
                    </div>
                    <div className={`text-2xl font-display font-black ${t.amount > 0 ? 'text-emerald-600 group-hover:text-ink' : 'text-red-500 group-hover:text-ink'}`}>
                      {t.amount > 0 ? '+' : '-'}₦{Math.abs(t.amount).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center justify-between relative z-10">
                    <span className={`text-[9px] font-mono font-black border-2 border-ink px-3 py-1 uppercase group-hover:bg-ink group-hover:text-white transition-all ${t.status === 'pending' ? 'bg-yellow-100' : 'bg-emerald-50'}`}>
                      {t.status}
                    </span>
                    <span className="text-[8px] font-mono opacity-40 uppercase tracking-widest">ID_{t.id.substring(0,8)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-20 text-center space-y-4">
                <Info size={40} className="mx-auto opacity-10" />
                <p className="text-[10px] font-mono font-black uppercase opacity-20 italic">DATABASE_EMPTY_NULL_DATA</p>
              </div>
            )}
          </div>

          {/* Bonus Card Sticky Bottomish */}
          <div className="p-10 border-t-4 border-ink bg-ink text-white mt-auto">
            <div className="w-16 h-16 border-4 border-white bg-yellow-400 text-ink flex items-center justify-center mb-8 rotate-45 transform">
              <Zap size={32} />
            </div>
            <h4 className="text-3xl font-display font-black uppercase italic leading-none mb-6">MAXIMIZER<br />PROTOCOL.</h4>
            <p className="text-xs font-mono opacity-40 leading-relaxed mb-8 italic">
              Leverage the <b>Yield_Multiplier</b> by increasing your network density. Synchronized accounts process outflow at 2x frequency.
            </p>
            <div className="h-6 bg-white/10 p-1 border border-white/20">
              <div className="h-full bg-yellow-400 w-3/4 shadow-[0_0_10px_rgba(250,204,21,0.5)]"></div>
            </div>
            <p className="text-[8px] font-mono font-black uppercase mt-4 opacity-40 tracking-widest">75%_STABILITY_INDEX</p>
          </div>
        </div>
      </div>
    </div>
  );
}
