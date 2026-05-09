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
import { useAuth, handleFirestoreError } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, orderBy, onSnapshot, doc, setDoc } from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export default function Wallet() {
  const { user, userData } = useAuth();
  const [activeTab, setActiveTab] = React.useState<'recharge' | 'withdraw' | 'conversion'>('recharge');
  const [transactions, setTransactions] = React.useState<any[]>([]);
  const [conversionType, setConversionType] = React.useState<'airtime' | 'data' | 'cable' | 'electricity'>('airtime');
  const [network, setNetwork] = React.useState<string>('MTN');
  
  // Utility States
  const [utilityService, setUtilityService] = React.useState<string>('');
  const [billersCode, setBillersCode] = React.useState<string>('');
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [verifiedName, setVerifiedName] = React.useState<string | null>(null);
  
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

  // Fetch transactions
  React.useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(txs);
    }, (error) => {
      console.error('Transactions fetch error:', error);
    });
    return () => unsubscribe();
  }, [user]);

  const handleRecharge = async () => {
    // Sanitize input: remove commas and other non-numeric characters except decimals
    const sanitizedAmount = rechargeAmount.replace(/[^0-9.]/g, '');
    const amount = Number(sanitizedAmount);
    
    if (!user || !userData) {
      alert("Authentication node missing. Please re-synchronize.");
      return;
    }

    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount for recharge. Remove any symbols like ₦.");
      return;
    }
    
    if (!proofImage) {
      alert('Security Protocol: Please upload or capture payment proof for identity verification.');
      return;
    }

    setIsProcessing(true);
    try {
      console.log("Wallet: Porting recharge request...", { amount, proofProvided: !!proofImage });
      const newTransaction = {
        userId: user.uid,
        userName: userData.displayName,
        userEmail: user.email,
        type: 'funding',
        title: 'NODE RECHARGE',
        amount: amount,
        createdAt: serverTimestamp(),
        status: 'pending',
        proof: proofImage,
        walletType: 'main'
      };

      await addDoc(collection(db, 'transactions'), newTransaction);

      setRechargeAmount('');
      setProofImage(null);
      alert(`Network success: Proof submitted for ₦${amount.toLocaleString()}. Our audit engine will verify the node synchronicity within 30 minutes.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'transactions');
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
    const sanitizedAmount = withdrawAmount.replace(/[^0-9.]/g, '');
    const amount = Number(sanitizedAmount);
    
    if (!user || !userData || isNaN(amount) || amount <= 0) {
      alert("Please enter a valid withdrawal amount.");
      return;
    }
    
    const balance = (userData.balances as any)[withdrawWallet];
    if (balance < amount) {
      alert(`Insufficient funds in ${withdrawWallet} vault.`);
      return;
    }

    setIsProcessing(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const newBalances = {
        ...userData.balances,
        [withdrawWallet]: balance - amount
      };

      const withdrawalData = {
        userId: user.uid,
        userName: userData.displayName,
        userEmail: user.email,
        amount: amount,
        method: 'bank_transfer',
        details: {
          accountNumber: withdrawAccount,
          bankName: withdrawBank,
          wallet: withdrawWallet
        },
        status: 'pending',
        createdAt: serverTimestamp()
      };

      const transactionData = {
        userId: user.uid,
        userName: userData.displayName,
        userEmail: user.email,
        type: 'withdrawal',
        title: 'LIQUIDATION REQUEST',
        amount: -amount,
        createdAt: serverTimestamp(),
        status: 'pending',
        walletType: withdrawWallet,
        description: `Withdrawal request to ${withdrawBank}`
      };

      // In Firestore, we should use a writeBatch or multiple await calls
      // Since rules allow user to update their balances:
      await setDoc(userRef, { balances: newBalances }, { merge: true });
      await addDoc(collection(db, 'withdrawals'), withdrawalData);
      await addDoc(collection(db, 'transactions'), transactionData);

      setWithdrawAmount('');
      alert("Withdrawal request initiated successfully. Funds have been locked for verification.");
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'withdrawals');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerify = async () => {
    if (!utilityService || !billersCode) return;
    setIsVerifying(true);
    setVerifiedName(null);
    try {
      const response = await fetch('/api/vtu/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceID: utilityService,
          billersCode,
          type: (utilityService === 'dstv' || utilityService === 'gotv') ? 'showmax' : undefined // VTpass specific
        })
      });
      const result = await response.json();
      if (result.code === '000') {
        setVerifiedName(result.content.Customer_Name || result.content.error || 'Identity Verified');
      } else {
        alert(result.response_description || "Verification failed. Check ID.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleConvert = async () => {
    if (!user || !userData) return;

    if (conversionType === 'airtime' || conversionType === 'data') {
      if (!convertPhone) {
        alert("Please provide a valid receiver link.");
        return;
      }
    } else {
      if (!billersCode || !utilityService) {
        alert("Please provide billing details.");
        return;
      }
    }
    
    const sanitizedValue = convertValue.replace(/[^0-9.]/g, '');
    const finalAmount = conversionType === 'data' ? dataPackage.price : Number(sanitizedValue);
    
    if (isNaN(finalAmount) || finalAmount <= 0) {
      alert("Invalid conversion amount.");
      return;
    }

    const balance = (userData.balances as any)[convertWallet];
    if (balance < finalAmount) {
      alert("Insufficient fuel in selected reservoir.");
      return;
    }

    setIsProcessing(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const newBalances = {
        ...userData.balances,
        [convertWallet]: balance - finalAmount
      };
      
      let serviceID = '';
      if (conversionType === 'airtime' || conversionType === 'data') {
        const networkMap: Record<string, string> = {
          'MTN': 'mtn',
          'AIRTEL': 'airtel',
          'GLO': 'glo',
          '9MOBILE': '9mobile'
        };
        serviceID = conversionType === 'airtime' ? networkMap[network] : `${networkMap[network]}-data`;
      } else {
        serviceID = utilityService;
      }

      const transactionData = {
        userId: user.uid,
        userName: userData.displayName,
        userEmail: user.email,
        type: 'task', 
        title: `${conversionType.toUpperCase()} SWAP`,
        amount: -finalAmount,
        createdAt: serverTimestamp(),
        status: 'pending',
        walletType: convertWallet,
        description: conversionType === 'airtime' || conversionType === 'data' 
          ? `${conversionType === 'airtime' ? 'Airtime' : 'Data'} sent to ${convertPhone}`
          : `${conversionType.toUpperCase()} sub for ${billersCode}`
      };

      const txRef = await addDoc(collection(db, 'transactions'), transactionData);
      await setDoc(userRef, { balances: newBalances }, { merge: true });

      // Call Backend VTU API
      try {
        const response = await fetch('/api/vtu/purchase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serviceID,
            amount: finalAmount,
            phoneNumber: userData.phoneNumber || '08000000000',
            billersCode: (conversionType === 'cable' || conversionType === 'electricity') ? billersCode : convertPhone,
            variation_code: conversionType === 'data' ? dataPackage.label.toLowerCase() : (conversionType === 'cable' ? 'dstv-padi' : (conversionType === 'electricity' ? 'prepaid' : undefined)),
            request_id: txRef.id
          })
        });

        const result = await response.json();

        if (result.code === '000' || result.response_description === 'TRANSACTION SUCCESSFUL') {
          // Update transaction to completed
          await setDoc(doc(db, 'transactions', txRef.id), { 
            status: 'completed',
            api_response: result.content || result
          }, { merge: true });
          alert(`Conversion protocol successful. Asset dispatched successfully.`);
          setBillersCode('');
          setVerifiedName(null);
        } else {
          // Log failure but keep as pending/failed for admin review
          await setDoc(doc(db, 'transactions', txRef.id), { 
            status: 'failed_api',
            api_error: result.response_description || result.error
          }, { merge: true });
          alert(`API Sync Issue: ${result.response_description || 'Check network'}. Our audit team will review the pending request.`);
        }
      } catch (apiErr) {
        console.error("VTU API Bridge Error:", apiErr);
        // Keep as pending in Firestore for manual fallback
        alert(`Neural network bridge timeout. Your request is logged as PENDING for manual dispatch.`);
      }

    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'conversion');
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
                activeTab === tab.id ? 'bg-yellow-500 text-slate-950 shadow-xl shadow-yellow-500/20' : 'text-white/20 hover:text-white/60'
              }`}
            >
              <tab.icon size={14} className="md:w-4 md:h-4" />
              <span className="text-[9px] md:text-[10px] uppercase tracking-widest leading-none">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="absolute -top-10 -right-20 w-80 h-80 bg-yellow-500/5 blur-[120px] rounded-full animate-float-slow pointer-events-none"></div>
      </header>

      {/* Main Wallets Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 perspective-2000">
        <motion.div 
          whileHover={{ rotateX: 5, rotateY: -5, scale: 1.02 }}
          className="relative group h-[300px] md:h-[350px]"
        >
          {/* Glowing Aura */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
          
          <div className="relative h-full glass-card p-8 md:p-12 bg-gradient-to-br from-slate-900 via-blue-900 to-black border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            {/* Parallax Shimmer */}
            <motion.div 
              animate={{ x: ['-100%', '100%'], opacity: [0, 0.05, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent -skew-x-12 pointer-events-none"
            />
            
            {/* Animated Orbs */}
            <motion.div 
              animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
              transition={{ duration: 8, repeat: Infinity }}
              className="absolute -top-10 -right-10 w-48 h-48 bg-yellow-500/10 blur-[80px] rounded-full"
            />
            
            <div className="relative z-10 flex justify-between items-start">
              <div className="p-4 bg-white/5 backdrop-blur-3xl rounded-3xl border border-white/10 shadow-inner group-hover:shadow-[0_0_20px_rgba(250,204,21,0.3)] transition-all">
                <WalletIcon size={32} className="text-yellow-400" />
              </div>
              <div className="text-right">
                <div className="flex items-center gap-3 bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(250,204,21,0.8)]"></div>
                  <span className="text-[10px] font-black text-yellow-400 tracking-[0.2em] uppercase">Auth node active</span>
                </div>
              </div>
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Total Liquid Assets</span>
                <div className="h-px w-8 bg-white/10"></div>
              </div>
              <h2 className="text-5xl md:text-7xl font-display font-black text-white tracking-tighter leading-none flex items-baseline gap-2">
                <span className="text-yellow-400">₦</span>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {(userData?.balances?.main || 0).toLocaleString()}
                </motion.span>
              </h2>
              
              <div className="mt-8 flex gap-4">
                <div className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex items-center gap-2">
                  <ArrowUpRight size={14} className="text-yellow-400" />
                  <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest">+12.5%</span>
                </div>
                <div className="px-4 py-2 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-2">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none">Yield: High</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
          {[
            { label: 'Bonus Reservoir', value: userData?.balances.bonus, icon: Zap, color: 'text-yellow-400', from: 'from-yellow-900/20', to: 'to-transparent' },
            { label: 'Network Yield', value: userData?.balances.referral, icon: Award, color: 'text-white', from: 'from-blue-900/20', to: 'to-transparent' }
          ].map((wallet, i) => (
            <motion.div 
              key={i} 
              whileHover={{ x: 10, scale: 1.01 }}
              className="relative group cursor-pointer"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-white/0 via-white/5 to-white/0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className={`relative glass-card p-8 flex items-center justify-between border-white/5 bg-gradient-to-br ${wallet.from} ${wallet.to} rounded-3xl overflow-hidden`}>
                <div className="flex items-center gap-6">
                  <div className={`w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:rotate-12 transition-transform shadow-2xl`}>
                    <wallet.icon size={28} className={wallet.color} />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em] mb-1">{wallet.label}</p>
                    <p className="text-3xl font-display font-black leading-none tracking-tighter">₦{wallet.value?.toLocaleString()}</p>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20 group-hover:text-yellow-400 group-hover:scale-110 transition-all">
                  <ArrowUpRight size={20} />
                </div>
              </div>
            </motion.div>
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
                  <div className="p-6 md:p-10 bg-white/5 rounded-[1.5rem] md:rounded-[2.5rem] border border-yellow-500/20 shadow-2xl shadow-yellow-500/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 md:p-8">
                       <Building2 size={32} className="text-white/5 group-hover:text-yellow-500/10 transition-colors md:w-12 md:h-12" />
                    </div>
                    <div className="space-y-4 md:space-y-6 relative z-10">
                      <div>
                        <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-yellow-400 mb-2 md:mb-4">Official Bank Node</p>
                        <div className="space-y-3 md:space-y-4">
                          {[
                            { label: 'Bank', value: 'PALMPAY' },
                            { label: 'Acc No.', value: '6680458614' },
                            { label: 'Name', value: 'NEXORA SYSTEM' },
                          ].map(item => (
                            <div key={item.label} className="flex justify-between items-center py-1.5 md:py-2 border-b border-white/5">
                              <span className="text-[8px] md:text-[10px] text-white/20 font-bold uppercase">{item.label}</span>
                              <span className="text-xs md:text-sm font-black text-white">{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                        <p className="text-[8px] md:text-[10px] text-yellow-400 font-bold uppercase text-center">Transfer strictly to this node only</p>
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
                      <button key={amt} onClick={() => setRechargeAmount(amt.toString())} className={`py-4 md:py-5 px-3 md:px-4 rounded-xl md:rounded-2xl font-display font-black transition-all text-xs md:text-sm shadow-xl active:scale-95 border ${rechargeAmount === amt.toString() ? 'bg-yellow-500 text-slate-950 border-white/20' : 'bg-white/5 border-white/5 hover:border-yellow-500/50 hover:bg-yellow-500/5 hover:text-yellow-400'}`}>
                        ₦{amt.toLocaleString()}
                      </button>
                    ))}
                  </div>
                  <div className="relative group">
                    <span className="absolute left-6 md:left-8 top-1/2 -translate-y-1/2 text-yellow-400 font-black text-lg md:text-xl group-focus-within:animate-pulse">₦</span>
                    <input 
                      type="text" 
                      value={rechargeAmount}
                      onChange={(e) => setRechargeAmount(e.target.value)}
                      placeholder="Custom Entry Amount" 
                      className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] md:rounded-[2rem] py-5 md:py-7 pl-12 md:pl-16 pr-6 md:pr-8 focus:outline-none focus:border-yellow-500 transition-all text-xl md:text-4xl font-display font-black placeholder:text-white/10 placeholder:font-black placeholder:uppercase placeholder:text-[10px] placeholder:tracking-[0.3em] group-focus-within:bg-white/[0.08]"
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
                    disabled={isProcessing}
                    className="w-full btn-primary py-5 md:py-6 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] shadow-2xl shadow-yellow-500/30 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing Transaction...' : 'Verify Transfer & Recharge'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'withdraw' && (
              <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-6 md:p-8 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl md:rounded-[2rem] flex flex-col sm:flex-row gap-4 md:gap-6 items-center sm:items-start text-center sm:text-left">
                   <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-yellow-500/20 flex items-center justify-center shrink-0 shadow-2xl">
                     <AlertCircle size={20} className="text-yellow-400 md:w-6 md:h-6" />
                   </div>
                   <div>
                     <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-yellow-400 mb-0.5 md:mb-1">Liquidation Protocol</p>
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
                        className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl py-4 md:py-6 px-6 md:px-8 focus:outline-none focus:border-yellow-500 transition-all appearance-none cursor-pointer font-black text-[10px] md:text-sm uppercase tracking-widest focus:bg-white/[0.08]"
                      >
                        <option className="bg-slate-900" value="main">Main Yield Reservoir</option>
                        <option className="bg-slate-900" value="referral">Referral Growth Vault</option>
                        <option className="bg-slate-900" value="bonus">Bonus Reservoir</option>
                        <option className="bg-slate-900" value="investment">Investment Yields</option>
                      </select>
                      <ArrowUpRight size={16} className="absolute right-6 md:right-8 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
                    </div>
                    <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/5">
                      <p className="text-[10px] text-white/40 font-black">Available: <span className="text-white">₦{((userData?.balances as any)?.[withdrawWallet] || 0).toLocaleString()}</span></p>
                    </div>
                  </div>

                  <div className="space-y-3 md:space-y-4">
                    <label className="text-[9px] md:text-[10px] uppercase font-black text-white/20 tracking-[0.3em] ml-2">Liquidation Volatility</label>
                    <div className="relative group">
                      <span className="absolute left-6 md:left-8 top-1/2 -translate-y-1/2 text-yellow-400 font-black text-lg md:text-xl">₦</span>
                      <input 
                         type="text" 
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="ENTER AMOUNT" 
                        className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl py-4 md:py-6 pl-12 md:pl-16 pr-6 md:pr-8 focus:outline-none focus:border-yellow-500 transition-all font-black text-xl md:text-2xl placeholder:text-white/10 placeholder:text-[10px] placeholder:tracking-[0.2em] focus:bg-white/[0.08]"
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
                        className="bg-white/5 border border-white/10 rounded-xl md:rounded-2xl py-4 md:py-6 px-6 md:px-8 focus:outline-none focus:border-yellow-500 transition-all font-medium placeholder:text-white/10 text-sm" 
                      />
                      <div className="relative group">
                        <select 
                          value={withdrawBank}
                          onChange={(e) => setWithdrawBank(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl py-4 md:py-6 px-6 md:px-8 focus:outline-none focus:border-yellow-500 transition-all appearance-none cursor-pointer font-black text-[9px] md:text-[10px] uppercase tracking-widest focus:bg-white/[0.08]"
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
                    className="w-full btn-primary py-5 md:py-6 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] shadow-2xl shadow-yellow-500/30 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing Liquidation...' : 'Execute Vault Outflow'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'conversion' && (
              <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                   <button 
                     onClick={() => setConversionType('airtime')}
                     className={`p-4 md:p-6 border rounded-2xl md:rounded-3xl flex flex-col items-center gap-2 md:gap-4 group transition-all active:scale-95 shadow-lg ${conversionType === 'airtime' ? 'bg-yellow-500/10 border-yellow-500/40' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                      <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center transition-all bg-white/5 border border-white/5 ${conversionType === 'airtime' ? 'bg-yellow-500/20 scale-110' : ''}`}>
                        <Smartphone size={20} className={conversionType === 'airtime' ? 'text-yellow-400' : 'text-white/20'} />
                      </div>
                      <span className="font-black text-[7px] md:text-[9px] uppercase tracking-widest text-white/60">Airtime</span>
                   </button>
                   <button 
                     onClick={() => setConversionType('data')}
                     className={`p-4 md:p-6 border rounded-2xl md:rounded-3xl flex flex-col items-center gap-2 md:gap-4 group transition-all active:scale-95 shadow-lg ${conversionType === 'data' ? 'bg-blue-500/10 border-blue-500/40' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                      <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center transition-all bg-white/5 border border-white/5 ${conversionType === 'data' ? 'bg-blue-500/20 scale-110' : ''}`}>
                        <Wifi size={20} className={conversionType === 'data' ? 'text-blue-400' : 'text-white/20'} />
                      </div>
                      <span className="font-black text-[7px] md:text-[9px] uppercase tracking-widest text-white/60">Data</span>
                   </button>
                   <button 
                     onClick={() => { setConversionType('cable'); setUtilityService('dstv'); }}
                     className={`p-4 md:p-6 border rounded-2xl md:rounded-3xl flex flex-col items-center gap-2 md:gap-4 group transition-all active:scale-95 shadow-lg ${conversionType === 'cable' ? 'bg-purple-500/10 border-purple-500/40' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                      <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center transition-all bg-white/5 border border-white/5 ${conversionType === 'cable' ? 'bg-purple-500/20 scale-110' : ''}`}>
                        <Zap size={20} className={conversionType === 'cable' ? 'text-purple-400' : 'text-white/20'} />
                      </div>
                      <span className="font-black text-[7px] md:text-[9px] uppercase tracking-widest text-white/60">Cable</span>
                   </button>
                   <button 
                     onClick={() => { setConversionType('electricity'); setUtilityService('ikeja-electric'); }}
                     className={`p-4 md:p-6 border rounded-2xl md:rounded-3xl flex flex-col items-center gap-2 md:gap-4 group transition-all active:scale-95 shadow-lg ${conversionType === 'electricity' ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                      <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center transition-all bg-white/5 border border-white/5 ${conversionType === 'electricity' ? 'bg-emerald-500/20 scale-110' : ''}`}>
                        <AlertCircle size={20} className={conversionType === 'electricity' ? 'text-emerald-400' : 'text-white/20'} />
                      </div>
                      <span className="font-black text-[7px] md:text-[9px] uppercase tracking-widest text-white/60">Utility</span>
                   </button>
                </div>
                
                <div className="space-y-6 md:space-y-10">
                  {/* Recipient Input */}
                  <div className="space-y-3 md:space-y-4">
                    <label className="text-[9px] md:text-[10px] uppercase font-black text-white/20 tracking-[0.3em] ml-2">
                      {conversionType === 'cable' ? 'Smartcard / IUC Number' : conversionType === 'electricity' ? 'Meter Number' : 'Receiver Link'}
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type={conversionType === 'airtime' || conversionType === 'data' ? 'tel' : 'text'}
                        value={conversionType === 'airtime' || conversionType === 'data' ? convertPhone : billersCode}
                        onChange={(e) => conversionType === 'airtime' || conversionType === 'data' ? setConvertPhone(e.target.value) : setBillersCode(e.target.value)}
                        placeholder={conversionType === 'cable' ? "Enter Smartcard No" : conversionType === 'electricity' ? "Enter Meter No" : "080 0000 0000"}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 md:py-6 px-6 md:px-8 focus:outline-none focus:border-yellow-500 transition-all font-display font-black text-lg md:text-2xl placeholder:text-white/5 tracking-tighter" 
                      />
                      {(conversionType === 'cable' || conversionType === 'electricity') && (
                        <button 
                          onClick={handleVerify}
                          disabled={isVerifying}
                          className="px-6 bg-white/5 border border-white/10 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-white/10"
                        >
                          {isVerifying ? 'Verifying...' : 'Verify'}
                        </button>
                      )}
                    </div>
                    {verifiedName && (
                      <div className="animate-in fade-in slide-in-from-top-2 flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                        <AlertCircle size={14} className="text-emerald-400" />
                        <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">{verifiedName}</span>
                      </div>
                    )}
                  </div>

                  {/* Provider/Architecture Selection */}
                  <div className="space-y-3 md:space-y-4">
                    <label className="text-[9px] md:text-[10px] uppercase font-black text-white/20 tracking-[0.3em] ml-2">
                      {conversionType === 'airtime' || conversionType === 'data' ? 'Network Architecture' : 'Provider Node'}
                    </label>
                    <div className="relative group">
                      <select 
                        value={conversionType === 'airtime' || conversionType === 'data' ? network : utilityService}
                        onChange={(e) => conversionType === 'airtime' || conversionType === 'data' ? setNetwork(e.target.value) : setUtilityService(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl py-4 md:py-6 px-6 md:px-8 focus:outline-none focus:border-yellow-500 transition-all appearance-none cursor-pointer font-black text-[10px] md:text-sm uppercase tracking-widest focus:bg-white/[0.08]"
                      >
                        {conversionType === 'airtime' || conversionType === 'data' ? (
                          <>
                            <option value="MTN" className="bg-slate-900">MTN NETWORK</option>
                            <option value="AIRTEL" className="bg-slate-900">AIRTEL NETWORK</option>
                            <option value="GLO" className="bg-slate-900">GLO NETWORK</option>
                            <option value="9MOBILE" className="bg-slate-900">9MOBILE NETWORK</option>
                          </>
                        ) : conversionType === 'cable' ? (
                          <>
                            <option value="dstv" className="bg-slate-900">DSTV PROTOCOL</option>
                            <option value="gotv" className="bg-slate-900">GOTV PROTOCOL</option>
                            <option value="startimes" className="bg-slate-900">STARTIMES NETWORK</option>
                          </>
                        ) : (
                          <>
                            <option value="ikeja-electric" className="bg-slate-900">IKEJA ELECTRIC</option>
                            <option value="eko-electric" className="bg-slate-900">EKO ELECTRIC</option>
                            <option value="kano-electric" className="bg-slate-900">KANO ELECTRIC</option>
                            <option value="portharcourt-electric" className="bg-slate-900">PH ELECTRIC</option>
                          </>
                        )}
                      </select>
                      <ArrowDownLeft size={16} className="absolute right-6 md:right-8 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
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
                           className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl py-4 md:py-6 px-6 md:px-10 focus:outline-none focus:border-yellow-500 transition-all appearance-none cursor-pointer font-black text-[10px] md:text-xs uppercase tracking-widest focus:bg-white/[0.08]"
                         >
                           {dataPackages.map(p => (
                             <option key={p.val} value={p.price} className="bg-slate-900">{p.label}</option>
                           ))}
                         </select>
                         <Wifi size={14} className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 text-yellow-500 animate-pulse md:w-5 md:h-5" />
                      </div>
                    </div>
                  )}

                  {(conversionType === 'airtime' || conversionType === 'cable' || conversionType === 'electricity') && (
                    <div className="space-y-3 md:space-y-4 animate-in slide-in-from-top-2 duration-300">
                      <label className="text-[9px] md:text-[10px] uppercase font-black text-white/20 tracking-[0.3em] ml-2">Settlement Value</label>
                      <div className="relative group">
                         <span className="absolute left-6 md:left-10 top-1/2 -translate-y-1/2 text-yellow-400 font-display font-black text-lg md:text-xl">₦</span>
                         <input 
                           type="text" 
                           value={convertValue}
                           onChange={(e) => setConvertValue(e.target.value)}
                           placeholder="Enter Value" 
                           className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl py-5 md:py-6 pl-10 md:pl-16 pr-6 md:pr-10 focus:outline-none focus:border-yellow-500 transition-all font-display font-black text-xl md:text-2xl placeholder:text-white/10" 
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
                        className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl py-4 md:py-6 px-6 md:px-10 focus:outline-none focus:border-yellow-500 transition-all appearance-none cursor-pointer font-black text-[10px] md:text-xs uppercase tracking-widest focus:bg-white/[0.08]"
                      >
                        <option className="bg-slate-900" value="main">MAIN YIELD Reservoir</option>
                        <option className="bg-slate-900" value="bonus">BONUS RESERVOIR</option>
                        <option className="bg-slate-900" value="investment">INVESTMENT WALLET</option>
                        <option className="bg-slate-900" value="referral">REFERRAL VAULT</option>
                      </select>
                      <Zap size={14} className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 text-yellow-400 animate-pulse md:w-5 md:h-5" />
                    </div>
                  </div>
                  <button 
                    onClick={handleConvert}
                    disabled={isProcessing}
                    className="w-full btn-primary py-5 md:py-6 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] shadow-2xl shadow-yellow-500/30 active:scale-95 transition-all disabled:opacity-50"
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
                <div className="h-0.5 w-6 md:w-10 bg-yellow-500 rounded-full"></div> Ledger
              </h3>
              <button className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-yellow-400 transition-all">DEEP AUDIT</button>
            </div>
            <div className="glass-card p-2 md:p-3 space-y-1.5 md:space-y-2 border-white/5 shadow-2xl">
              {transactions.length > 0 ? (
                transactions.map((t: any, i: number) => (
                  <div key={t.id || i} className="flex items-center justify-between p-4 md:p-6 hover:bg-white/[0.03] rounded-2xl md:rounded-[2rem] transition-all cursor-pointer group active:scale-[0.98] border border-transparent hover:border-white/5">
                    <div className="flex gap-3 md:gap-5 items-center">
                      <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center shadow-xl group-hover:rotate-12 transition-all ${t.amount > 0 ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-500'}`}>
                         {t.amount > 0 ? <ArrowDownLeft size={18} className="md:w-[22px] md:h-[22px]" /> : <ArrowUpRight size={18} className="md:w-[22px] md:h-[22px]" />}
                      </div>
                      <div>
                        <p className="text-[10px] md:text-xs font-black uppercase tracking-widest group-hover:text-white transition-colors">{t.title}</p>
                        <div className="flex items-center gap-2 md:gap-3 mt-1">
                          <p className="text-[8px] md:text-[9px] text-white/20 font-black uppercase italic">{t.createdAt?.toDate ? t.createdAt.toDate().toLocaleDateString() : new Date().toLocaleDateString()}</p>
                          <span className="w-1 h-1 bg-white/10 rounded-full"></span>
                          <p className="text-[8px] text-yellow-400/60 font-black uppercase tracking-[0.1em] md:tracking-[0.2em]">{t.status}</p>
                        </div>
                      </div>
                    </div>
                    <p className={`text-base md:text-xl font-display font-black ${t.amount > 0 ? 'text-yellow-400' : 'text-red-500'}`}>
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

          <div className="glass-card p-8 md:p-10 border-white/5 bg-gradient-to-br from-blue-900/40 via-black to-black shadow-2xl relative overflow-hidden group">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(250,204,21,0.1),transparent)] group-hover:opacity-100 transition-opacity"></div>
             <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[2.5rem] bg-yellow-500 shadow-2xl shadow-yellow-500/40 flex items-center justify-center mb-6 md:mb-8 relative z-10 animate-float">
               <Zap size={24} className="text-slate-950 fill-slate-950 md:w-8 md:h-8" />
             </div>
             <h4 className="font-display font-black text-xl md:text-2xl mb-3 md:mb-4 italic uppercase tracking-tight relative z-10">Maximizer <br /> Protocol.</h4>
             <p className="text-xs md:text-sm text-white/40 leading-relaxed font-light italic relative z-10">
               Leverage your <b>Bonus Reservoir</b> for instant Airtime Swap once you synchronize your account. Network growth accelerates liquidity.
             </p>
             <div className="mt-6 md:mt-8 relative z-10">
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                   <div className="w-3/4 h-full bg-gradient-to-r from-yellow-400 to-yellow-600 shadow-[0_0_10px_rgba(250,204,21,0.5)]"></div>
                </div>
                <p className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] text-white/20 mt-3 md:mt-4">75% to Next Unlock</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
