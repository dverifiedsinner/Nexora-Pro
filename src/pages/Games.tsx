import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gamepad2, Zap, TrendingUp, Trophy, ArrowRight, Star, 
  AlertCircle, Check, X, Clock, Wallet, Award,
  ChevronRight, Info, ShieldCheck, Play, RotateCcw,
  Target, Dna, Rocket, Loader2
} from 'lucide-react';

interface Match {
  id: string;
  teams: string[];
  odds: { home: number; draw: number; away: number };
}
import { db } from '../lib/firebase';
import { 
  doc, 
  setDoc, 
  addDoc, 
  collection, 
  serverTimestamp, 
  runTransaction 
} from 'firebase/firestore';
import { useAuth, handleFirestoreError } from '../contexts/AuthContext';
import SpinWheel from '../components/SpinWheel';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

const TEAM_POOL = ['MUN', 'CHE', 'LFC', 'MCI', 'ARS', 'TOT', 'RM', 'BAR', 'NAP', 'INT', 'BVB', 'BAY', 'PSG', 'JUV', 'ATM', 'MIL'];

const generateMatches = (): Match[] => {
  const matches: Match[] = [];
  const shuffledTeams = [...TEAM_POOL].sort(() => Math.random() - 0.5);
  for (let i = 0; i < 6; i++) {
    matches.push({
      id: (i + 1).toString(),
      teams: [shuffledTeams[i * 2], shuffledTeams[i * 2 + 1]],
      odds: {
        home: Number((Math.random() * 1.5 + 1.2).toFixed(2)),
        draw: Number((Math.random() * 1.2 + 2.8).toFixed(2)),
        away: Number((Math.random() * 1.5 + 1.3).toFixed(2)),
      }
    });
  }
  return matches;
};

export default function Games() {
  const { user, userData } = useAuth();
  const [activeTab, setActiveTab] = useState<'prediction' | 'spin' | 'staking'>('prediction');
  const [stakingAmount, setStakingAmount] = useState<string>('5000');
  const [stakingDays, setStakingDays] = useState<number>(7);
  const [isStaking, setIsStaking] = useState(false);
  const [matches, setMatches] = useState<Match[]>(generateMatches());
  const [selectedMatches, setSelectedMatches] = useState<{ id: string; pick: '1' | 'X' | '2' }[]>([]);
  const [stakeAmount, setStakeAmount] = useState<string>('500');
  const [spinStake, setSpinStake] = useState<string>('500');
  const [stakingStatus, setStakingStatus] = useState<'idle' | 'processing' | 'result'>('idle');
  const [timer, setTimer] = useState(0);
  const [winResult, setWinResult] = useState<boolean | null>(null);
  const [isProcessingStaking, setIsProcessingStaking] = useState(false);
  const [isWheelSpinning, setIsWheelSpinning] = useState(false);
  const [spinMultiplier, setSpinMultiplier] = useState<number>(0);

  const handleQuantumStake = async () => {
    const sanitizedAmount = stakingAmount.replace(/[^0-9.]/g, '');
    const amount = Number(sanitizedAmount);
    if (!user || !userData || isNaN(amount)) {
      alert("Invalid stake amount.");
      return;
    }

    if ((userData.balances?.bonus || 0) < amount) {
      alert("Insufficient Bonus Reservoir fuel.");
      return;
    }

    setIsStaking(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const newBalances = {
        ...userData.balances,
        bonus: Number(userData.balances.bonus) - amount
      };
      
      const transactionData = {
        userId: user.uid,
        userName: userData.displayName,
        userEmail: user.email,
        type: 'task',
        title: `QUANTUM STAKE (${stakingDays} DAYS)`,
        amount: -amount,
        createdAt: serverTimestamp(),
        status: 'pending',
        walletType: 'bonus'
      };

      const newStakes = Array.isArray((userData as any).activeStakes)
        ? [...(userData as any).activeStakes, { amount, days: stakingDays, startTime: new Date().toISOString() }]
        : [{ amount, days: stakingDays, startTime: new Date().toISOString() }];

      await setDoc(userRef, {
        balances: newBalances,
        activeStakes: newStakes
      }, { merge: true });

      await addDoc(collection(db, 'transactions'), transactionData);

      alert(`₦${amount.toLocaleString()} successfully staked for ${stakingDays} days!`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'users');
    } finally {
      setIsStaking(false);
    }
  };

  const toggleMatch = (id: string, pick: '1' | 'X' | '2') => {
    if (stakingStatus !== 'idle') return;
    setSelectedMatches(prev => {
      const exists = prev.find(m => m.id === id);
      if (exists && exists.pick === pick) {
        return prev.filter(m => m.id !== id);
      } else if (exists) {
        return prev.map(m => m.id === id ? { ...m, pick } : m);
      }
      return [...prev, { id, pick }];
    });
  };

  const handleStake = async () => {
    const sanitizedAmount = stakeAmount.replace(/[^0-9.]/g, '');
    const amount = Number(sanitizedAmount);
    
    if (!user || !userData) {
      alert("Authentication node missing. Please wait for synchronization.");
      return;
    }
    
    if (selectedMatches.length === 0) {
      alert("Please select at least one match node to initialize simulation.");
      return;
    }

    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount for simulation stake.");
      return;
    }
    
    if ((userData.balances?.main || 0) < amount) {
      alert(`Insufficient Main Reservoir fuel. Required: ₦${amount.toLocaleString()}`);
      return;
    }

    setIsProcessingStaking(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const newBalances = {
        ...userData.balances,
        main: Number(userData.balances.main) - amount
      };

      const transactionData = {
        userId: user.uid,
        userName: userData.displayName,
        userEmail: user.email,
        type: 'task',
        title: 'VIRTUAL BET STAKE',
        amount: -amount,
        createdAt: serverTimestamp(),
        status: 'pending',
        walletType: 'main'
      };

      await setDoc(userRef, { balances: newBalances }, { merge: true });
      await addDoc(collection(db, 'transactions'), transactionData);

      setStakingStatus('processing');
      setTimer(30);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'users');
    } finally {
      setIsProcessingStaking(false);
    }
  };

  const currentOdds = (match: Match, pick: '1' | 'X' | '2') => {
    if (pick === '1') return match.odds.home;
    if (pick === 'X') return match.odds.draw;
    return match.odds.away;
  };

  const toggleSpin = async () => {
    const sanitizedAmount = spinStake.replace(/[^0-9.]/g, '');
    const amount = Number(sanitizedAmount);
    
    if (!user || !userData || isNaN(amount)) {
      alert("Invalid spin stake.");
      return;
    }

    if ((userData.balances?.main || 0) < amount) {
      alert("Insufficient Main Reservoir fuel.");
      return;
    }

    setIsProcessingStaking(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const newBalances = {
        ...userData.balances,
        main: Number(userData.balances.main) - amount
      };
      
      const transactionData = {
        userId: user.uid,
        userName: userData.displayName,
        userEmail: user.email,
        type: 'task',
        title: 'NITRO SPIN STAKE',
        amount: -amount,
        createdAt: serverTimestamp(),
        status: 'pending',
        walletType: 'main'
      };

      await setDoc(userRef, { balances: newBalances }, { merge: true });
      await addDoc(collection(db, 'transactions'), transactionData);

      setIsWheelSpinning(true);
      setStakingStatus('processing');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'users');
    } finally {
      setIsProcessingStaking(false);
    }
  };

  const handleSpinComplete = async (multiplier: number) => {
    setIsWheelSpinning(false);
    setSpinMultiplier(multiplier);
    
    if (user && userData) {
      const amount = Number(spinStake);
      const reward = amount * multiplier;
      
      try {
        if (reward > 0) {
          const userRef = doc(db, 'users', user.uid);
          const newBalances = {
            ...userData.balances,
            investment: Number(userData.balances.investment || 0) + reward
          };
          
          const transactionData = {
            userId: user.uid,
            userName: userData.displayName,
            userEmail: user.email,
            type: 'investment',
            title: 'NITRO SPIN YIELD',
            amount: reward,
            createdAt: serverTimestamp(),
            status: 'pending',
            walletType: 'investment'
          };

          await setDoc(userRef, { balances: newBalances }, { merge: true });
          await addDoc(collection(db, 'transactions'), transactionData);
          setWinResult(true);
        } else {
          setWinResult(false);
        }
      } catch (err) {
        console.error("Spin reward error:", err);
      } finally {
        setStakingStatus('result');
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
       if (stakingStatus === 'idle') {
          setMatches(generateMatches());
          setSelectedMatches([]);
       }
    }, 60000);
    return () => clearInterval(interval);
  }, [stakingStatus]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (stakingStatus === 'processing' && timer > 0) {
      interval = setInterval(() => {
        setTimer(t => t - 1);
      }, 1000);
    } else if (stakingStatus === 'processing' && timer === 0 && activeTab !== 'spin') {
      const won = Math.random() > 0.7;
      setWinResult(won);
      setStakingStatus('result');
      
      if (won && user && userData) {
        const reward = activeTab === 'prediction' ? potentialWin : Number(spinStake) * 5;
        
        const processWin = async () => {
          const userRef = doc(db, 'users', user.uid);
          const newBalances = {
            ...userData.balances,
            investment: Number(userData.balances.investment || 0) + reward
          };
          
          const transactionData = {
            userId: user.uid,
            userName: userData.displayName,
            userEmail: user.email,
            type: 'investment',
            title: activeTab === 'prediction' ? 'BET YIELD' : 'SPIN YIELD',
            amount: reward,
            createdAt: serverTimestamp(),
            status: 'pending',
            walletType: 'investment'
          };

          await setDoc(userRef, { balances: newBalances }, { merge: true });
          await addDoc(collection(db, 'transactions'), transactionData);
        };

        processWin().catch(console.error);
      }
    }
    return () => clearInterval(interval);
  }, [stakingStatus, timer, userData]);

  const resetPrediction = () => {
    setStakingStatus('idle');
    setSelectedMatches([]);
    setWinResult(null);
  };

  const totalOddsMulti = selectedMatches.length > 0 
    ? Number((selectedMatches.reduce((acc, sel) => {
        const m = matches.find(match => match.id === sel.id);
        return acc * (m ? currentOdds(m, sel.pick) : 1);
      }, 1)).toFixed(2))
    : 1;

  const potentialWin = Number(stakeAmount) * totalOddsMulti * 5;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pb-32 font-sans">
      {/* Header */}
      <header className="p-12 bg-slate-900 text-white rounded-b-[4rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[150px] translate-x-1/2 -translate-y-1/2" />
        <div className="relative z-10 space-y-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
              <h1 className="text-5xl font-black italic tracking-tighter uppercase">COMBAT <span className="text-cyan-400">ARENA</span></h1>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Neural Asset Risk Simulation</p>
            </div>
            <div className="flex gap-3 bg-slate-950/50 backdrop-blur-xl p-2 rounded-[2rem] border border-white/5 overflow-x-auto scrollbar-hide">
              {[
                { id: 'prediction', label: 'PREDICT', icon: Target },
                { id: 'spin', label: 'NITRO', icon: RotateCcw },
                { id: 'staking', label: 'QUANTUM', icon: Rocket }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap flex items-center gap-3 ${
                    activeTab === tab.id 
                      ? 'bg-cyan-500 text-white shadow-[0_10px_30px_rgba(6,182,212,0.3)]' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-950/50 backdrop-blur-xl p-10 rounded-[3rem] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 relative group overflow-hidden">
             <div className="absolute inset-0 bg-cyan-500/[0.02] translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
             <div className="flex items-center gap-6 relative z-10">
                <div className="w-16 h-16 rounded-[1.5rem] bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shadow-inner group-hover:scale-110 transition-transform">
                   <Target className="text-cyan-400" size={32} />
                </div>
                <div>
                   <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em] mb-1">OPERATIONAL DOMAIN</p>
                   <p className="text-2xl font-black italic uppercase tracking-tight">{activeTab === 'prediction' ? 'Global Virtual League' : activeTab === 'spin' ? 'High-Velocity Wheel' : 'Passive Yield Nodes'}</p>
                </div>
             </div>
             <div className="text-center md:text-right relative z-10">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">PROJECTED MULTIPLIER</p>
                <div className="flex items-baseline gap-2 justify-center md:justify-end">
                  <p className="text-4xl font-black italic text-emerald-400">5.0</p>
                  <span className="text-lg font-black text-emerald-400 opacity-50">X</span>
                </div>
             </div>
          </div>
        </div>
      </header>

      <div className="p-8 max-w-7xl mx-auto space-y-16">
        <AnimatePresence mode="wait">
          {activeTab === 'prediction' && (
            <motion.div 
              key="prediction"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="space-y-12"
            >
              {stakingStatus === 'idle' ? (
                <div className="grid lg:grid-cols-12 gap-10">
                  <div className="lg:col-span-8 space-y-8">
                    <div className="flex items-center justify-between px-4">
                      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Available Simulation Nodes</h3>
                      <div className="flex items-center gap-2 text-[10px] font-black text-cyan-500 uppercase tracking-widest">
                        <div className="w-2 h-2 bg-cyan-500 rounded-full animate-ping" />
                        SYNCED WITH SERVER
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {matches.map((match) => (
                        <div key={match.id} className="bg-white dark:bg-slate-900 p-8 rounded-[3.5rem] border border-slate-100 dark:border-slate-800/50 shadow-2xl shadow-slate-950/10 space-y-10 group hover:border-cyan-500/20 transition-all">
                          <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            <span className="bg-slate-50 dark:bg-slate-950 px-4 py-2 rounded-xl">POOL-ID_{match.id}</span>
                            <span className="text-cyan-500 italic">LIVE LINK</span>
                          </div>
                          
                          <div className="flex items-center justify-between px-2">
                             <div className="text-center space-y-4 group-hover:scale-105 transition-transform">
                                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-950 rounded-[1.5rem] flex items-center justify-center font-black italic text-2xl border border-slate-100 dark:border-slate-800 shadow-inner">{match.teams[0]}</div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">{match.teams[0]}</p>
                             </div>
                             <div className="text-2xl font-black text-slate-100 dark:text-slate-800 italic select-none">VS</div>
                             <div className="text-center space-y-4 group-hover:scale-105 transition-transform">
                                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-[1.5rem] flex items-center justify-center font-black italic text-2xl border border-slate-100 dark:border-slate-800 shadow-inner">{match.teams[1]}</div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">{match.teams[1]}</p>
                             </div>
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            {['1', 'X', '2'].map((pick) => {
                              const odds = pick === '1' ? match.odds.home : pick === 'X' ? match.odds.draw : match.odds.away;
                              const isSelected = selectedMatches.find(m => m.id === match.id && m.pick === pick);
                              return (
                                <button
                                  key={pick}
                                  onClick={() => toggleMatch(match.id, pick as any)}
                                  className={`py-5 rounded-[1.5rem] border font-black transition-all flex flex-col items-center gap-2 group/btn ${
                                    isSelected 
                                      ? 'bg-cyan-500 border-cyan-400 text-white shadow-[0_10px_25px_rgba(6,182,212,0.4)] scale-[1.02]' 
                                      : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                  }`}
                                >
                                  <span className="text-[10px] uppercase tracking-widest opacity-60 group-hover/btn:scale-110 transition-transform">{pick}</span>
                                  <span className="text-lg italic tracking-tight">{odds}</span>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-4">
                    <section className="bg-white dark:bg-slate-900 p-10 rounded-[4rem] border border-slate-100 dark:border-slate-800/50 shadow-2xl shadow-slate-950/20 space-y-10 sticky top-10 overflow-hidden">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/[0.03] rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                      
                      <div className="flex justify-between items-center relative z-10">
                        <h3 className="text-2xl font-black italic tracking-tight uppercase">Decision Slip</h3>
                        <span className="px-5 py-2 bg-cyan-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">{selectedMatches.length} SELECTIONS</span>
                      </div>

                      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
                        {selectedMatches.map(sel => {
                          const match = matches.find(m => m.id === sel.id);
                          return (
                            <div key={sel.id} className="flex justify-between items-center p-6 bg-slate-50 dark:bg-slate-950 rounded-[2rem] border border-slate-100 dark:border-slate-800 group hover:border-cyan-500/30 transition-all">
                              <div className="space-y-1">
                                <p className="font-black italic text-sm text-slate-800 dark:text-white uppercase tracking-tight">{match?.teams[0]} v {match?.teams[1]}</p>
                                <p className="text-cyan-500 uppercase font-black text-[9px] tracking-widest opacity-80 italic">Outcome: Node_{sel.pick}</p>
                              </div>
                              <p className="text-lg font-black italic text-cyan-500 tabular-nums">{match ? currentOdds(match, sel.pick as any) : 0}x</p>
                            </div>
                          )
                        })}
                        {selectedMatches.length === 0 && (
                          <div className="text-center py-20 space-y-6 opacity-30">
                             <div className="w-20 h-20 bg-slate-50 dark:bg-slate-950 rounded-[2rem] flex items-center justify-center mx-auto border border-dashed border-slate-300">
                                <Target size={32} />
                             </div>
                             <p className="text-[10px] font-black uppercase tracking-[0.3em]">Operational Void</p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-8 pt-8 border-t border-slate-50 dark:border-slate-800 relative z-10">
                        <div className="flex justify-between items-end px-2">
                           <div>
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 italic">Investment Units</p>
                              <div className="flex items-center gap-3">
                                <span className="text-2xl font-black text-slate-400 opacity-50 italic">₦</span>
                                <input 
                                  type="text" 
                                  value={stakeAmount}
                                  onChange={(e) => setStakeAmount(e.target.value)}
                                  className="bg-transparent border-none text-4xl font-black focus:outline-none w-32 italic tracking-tight tabular-nums"
                                />
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 italic">Total Recoup</p>
                              <p className="text-4xl font-black text-emerald-500 italic tracking-tighter tabular-nums">₦{(potentialWin).toLocaleString()}</p>
                           </div>
                        </div>

                        <button 
                          onClick={handleStake}
                          disabled={isProcessingStaking || selectedMatches.length === 0}
                          className="w-full py-6 bg-slate-900 border border-slate-800 text-white rounded-[2.5rem] font-black text-[10px] uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4 group"
                        >
                          {isProcessingStaking ? (
                            <Loader2 className="animate-spin" size={24} />
                          ) : (
                            <><Play size={24} className="group-hover:translate-x-1 transition-transform" /> COMMIT RISK UNITS</>
                          )}
                        </button>
                      </div>
                    </section>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 space-y-16">
                   <div className="relative w-96 h-96">
                      <div className={`absolute inset-0 rounded-full border-[15px] flex items-center justify-center ${stakingStatus === 'processing' ? 'border-cyan-500/10' : winResult ? 'border-emerald-500/10' : 'border-rose-500/10'}`}>
                         {stakingStatus === 'processing' ? (
                            <motion.div 
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                              className="absolute inset-[-15px] border-t-[15px] border-cyan-500 rounded-full shadow-[0_0_50px_rgba(6,182,212,0.5)]"
                            />
                         ) : (
                            <div className={`absolute inset-[-15px] rounded-full border-[15px] ${winResult ? 'border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.5)]' : 'border-rose-500 shadow-[0_0_50px_rgba(244,63,94,0.5)]'}`} />
                         )}
                         <div className="text-center space-y-2">
                            {stakingStatus === 'processing' ? (
                               <>
                                 <p className="text-8xl font-black italic tracking-tighter tabular-nums">{timer}s</p>
                                 <p className="text-[10px] font-black uppercase text-cyan-500 tracking-[0.5em] animate-pulse">COLLATING DATA</p>
                               </>
                            ) : (
                               <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-6">
                                  {winResult ? <Trophy size={100} className="text-emerald-500 mx-auto drop-shadow-lg" /> : <X size={100} className="text-rose-500 mx-auto drop-shadow-lg" />}
                                  <div className="space-y-1">
                                    <p className={`text-5xl font-black uppercase italic tracking-tighter ${winResult ? 'text-emerald-500' : 'text-rose-500'}`}>
                                      {winResult ? 'AUTHORIZED!' : 'REJECTED'}
                                    </p>
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Protocol Resolution</p>
                                  </div>
                               </motion.div>
                            )}
                         </div>
                      </div>
                   </div>

                   <div className="text-center space-y-10 max-w-lg">
                      <p className="text-sm text-slate-500 dark:text-slate-400 italic font-medium leading-relaxed uppercase tracking-wider opacity-80">
                        {stakingStatus === 'processing' ? 'Authenticating simulation across neural network distribution points. Estimated completion time: 30 iterations.' : winResult ? `Node synchronization verified. Risk yield of ₦${potentialWin.toLocaleString()} allocated to investment reservoir.` : 'Architectural zero detected. Simulation terminated. Risk units neutralized.'}
                      </p>
                      {stakingStatus === 'result' && (
                        <button 
                          onClick={resetPrediction}
                          className="px-16 py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2.5rem] font-black text-[10px] uppercase tracking-[0.4em] flex items-center gap-4 mx-auto shadow-2xl shadow-slate-950/20 active:scale-95 transition-all"
                        >
                          <RotateCcw size={20} /> REINITIALIZE ARENA
                        </button>
                      )}
                   </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'spin' && (
            <motion.div 
              key="spin"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center space-y-16 py-12"
            >
              <div className="relative group p-10 bg-slate-900 rounded-full border border-white/5 shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
                <div className="absolute -inset-20 bg-cyan-500/5 blur-[120px] rounded-full animate-pulse pointer-events-none" />
                <SpinWheel 
                  isSpinning={isWheelSpinning} 
                  onSpinComplete={handleSpinComplete} 
                  stake={Number(spinStake)} 
                />
              </div>

              <div className="w-full max-w-xl bg-white dark:bg-slate-900 p-12 rounded-[4rem] border border-slate-100 dark:border-slate-800/50 shadow-2xl shadow-slate-950/20 space-y-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/[0.02] rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                
                <div className="text-center space-y-3 relative z-10">
                   <h3 className="text-4xl font-black italic uppercase tracking-tight">Nitro <span className="text-cyan-500">Node</span></h3>
                   <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">High-Velocity Yield Injection</p>
                </div>

                <div className="p-10 bg-slate-50 dark:bg-slate-950 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 space-y-6 relative z-10 shadow-inner">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] text-center">Authorization Units</p>
                  <div className="flex items-center justify-center gap-4">
                     <span className="text-4xl font-black text-slate-400 opacity-30 italic tabular-nums">₦</span>
                     <input 
                        type="text" 
                        value={spinStake}
                        onChange={(e) => setSpinStake(e.target.value)}
                        disabled={stakingStatus !== 'idle'}
                        className="bg-transparent border-none text-6xl font-black focus:outline-none w-48 text-center italic tracking-tighter tabular-nums"
                     />
                  </div>
                </div>

                <button 
                  onClick={toggleSpin}
                  disabled={stakingStatus !== 'idle' || isProcessingStaking}
                  className="w-full py-8 bg-slate-950 border border-white/5 text-white rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.5em] shadow-[0_20px_60px_rgba(0,0,0,0.4)] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-6 group relative z-10"
                >
                  {isProcessingStaking ? (
                    <Loader2 className="animate-spin" size={28} />
                  ) : (
                    <><RotateCcw size={28} className={`${isWheelSpinning ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`} /> INITIATE ROTATION</>
                  )}
                </button>

                <div className="grid grid-cols-2 gap-6 relative z-10">
                   <div className="p-8 bg-slate-50 dark:bg-slate-950 rounded-[2rem] border border-slate-100 dark:border-slate-800 text-center group hover:border-cyan-500/30 transition-all">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">QUOTA STATUS</p>
                      <p className="text-2xl font-black italic tabular-nums">01 / <span className="opacity-30">05</span></p>
                   </div>
                   <div className="p-8 bg-slate-50 dark:bg-slate-950 rounded-[2rem] border border-slate-100 dark:border-slate-800 text-center group hover:border-emerald-500/30 transition-all">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">SESSION PROFIT</p>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-xs font-black text-emerald-500">₦</span>
                        <p className="text-2xl font-black text-emerald-500 italic tabular-nums">2,400</p>
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'staking' && (
            <motion.div 
              key="staking"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="grid lg:grid-cols-12 gap-16 items-start"
            >
              <div className="lg:col-span-12 xl:col-span-7 space-y-12">
                <div className="space-y-6">
                   <h2 className="text-7xl font-black italic uppercase leading-[0.8] tracking-tighter">QUANTUM<br /><span className="text-cyan-500">PROTOCOL_</span></h2>
                   <p className="text-slate-500 font-black uppercase text-xs tracking-[0.3em] max-w-lg opacity-80 leading-relaxed italic border-l-4 border-cyan-500 pl-6">Deploy idle bonus reservoirs into decentralized staking nodes for automated passive yield accrual.</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-12 rounded-[4rem] border border-slate-100 dark:border-slate-800 shadow-2xl space-y-12 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/[0.03] rounded-full blur-[120px] -translate-y-2/3 translate-x-2/3" />
                  
                  <div className="space-y-6 relative z-10">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] ml-6">CHRONO-LOCK DURATION</p>
                    <div className="flex gap-6">
                      {[7, 14, 30].map((days) => (
                        <button
                          key={days}
                          onClick={() => setStakingDays(days)}
                          className={`flex-1 py-8 rounded-[2rem] border-2 font-black transition-all group ${
                            stakingDays === days 
                              ? 'bg-cyan-500 border-cyan-400 text-white shadow-[0_15px_40px_rgba(6,182,212,0.3)]' 
                              : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800 text-slate-500 hover:border-cyan-500/30'
                          }`}
                        >
                          <p className="text-4xl italic tracking-tighter tabular-nums group-hover:scale-110 transition-transform">{days}</p>
                          <p className="text-[10px] uppercase tracking-[0.4em] opacity-60">DAYS</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6 relative z-10">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] ml-6">DEPLOYMENT QUANTITY</p>
                    <div className="p-10 bg-slate-50 dark:bg-slate-950 rounded-[3rem] border border-slate-100 dark:border-slate-800 flex items-center justify-between shadow-inner group focus-within:border-cyan-500/50 transition-all">
                       <div className="flex flex-col gap-2">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-40">FUEL UNITS (₦)</span>
                         <input 
                            type="text" 
                            value={stakingAmount}
                            onChange={(e) => setStakingAmount(e.target.value)}
                            className="bg-transparent border-none text-6xl font-black focus:outline-none w-full italic tracking-tighter tabular-nums"
                            placeholder="0.00"
                         />
                       </div>
                       <Dna className="text-cyan-500 opacity-20 group-hover:rotate-180 transition-transform duration-1000" size={64} />
                    </div>
                  </div>

                  <div className="pt-10 border-t border-slate-50 dark:border-slate-800 space-y-10 relative z-10">
                     <div className="flex justify-between items-center px-6">
                        <div className="flex items-center gap-3">
                           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">STAKING YIELD</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-black text-emerald-500 italic">+{stakingDays === 7 ? '15' : stakingDays === 14 ? '35' : '85'}</span>
                          <span className="text-lg font-black text-emerald-500 opacity-50 uppercase">%</span>
                        </div>
                     </div>
                     <button 
                        onClick={handleQuantumStake}
                        disabled={isStaking}
                        className="w-full py-8 bg-indigo-600 text-white rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.5em] flex items-center justify-center gap-6 shadow-[0_20px_50px_rgba(79,70,229,0.3)] hover:scale-[1.02] active:scale-95 transition-all group"
                     >
                       {isStaking ? (
                         <Loader2 className="animate-spin" size={28} />
                       ) : (
                         <><Rocket size={28} className="group-hover:-translate-y-2 group-hover:translate-x-2 transition-transform" /> DEPLOY QUANTUM NODE</>
                       )}
                     </button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-12 xl:col-span-5 space-y-10">
                 <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] px-8">Active Neural Nodes</h3>
                 <div className="space-y-6">
                    {((userData as any)?.activeStakes || []).length > 0 ? (
                      (userData as any).activeStakes.map((stake: any, idx: number) => (
                        <div key={idx} className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-950/10 flex items-center justify-between group hover:border-cyan-500/30 transition-all relative overflow-hidden">
                           <div className="absolute inset-0 bg-cyan-500/[0.01] opacity-0 group-hover:opacity-100 transition-opacity" />
                           <div className="relative z-10">
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">LOCKED UNITS</p>
                              <div className="flex items-baseline gap-1">
                                <span className="text-xl font-black text-slate-300 italic tabular-nums">₦</span>
                                <p className="text-4xl font-black italic tracking-tighter tabular-nums">{stake.amount?.toLocaleString()}</p>
                              </div>
                           </div>
                           <div className="text-right relative z-10">
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">CHRONO-TTL</p>
                              <div className="flex items-baseline gap-1 justify-end">
                                <p className="text-4xl font-black text-cyan-500 italic tabular-nums">{stake.days}</p>
                                <span className="text-lg font-black text-cyan-500 opacity-50 uppercase">D</span>
                              </div>
                           </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-24 flex flex-col items-center justify-center text-center space-y-8 bg-slate-50/50 dark:bg-slate-900/50 rounded-[4rem] border border-dashed border-slate-200 dark:border-slate-800 opacity-40">
                         <div className="w-24 h-24 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                            <Clock size={48} className="text-slate-400" />
                         </div>
                         <div className="space-y-2">
                           <h4 className="text-xl font-black italic uppercase">Architecture Idle</h4>
                           <p className="text-[10px] font-black uppercase tracking-widest max-w-xs mx-auto">No active staking sequences detected in the neural network.</p>
                         </div>
                      </div>
                    )}
                 </div>

                 <div className="p-10 bg-indigo-500/[0.03] rounded-[3rem] border border-indigo-500/10 flex gap-6 group hover:bg-indigo-500/[0.05] transition-all">
                    <ShieldCheck className="text-indigo-500 shrink-0 group-hover:scale-110 transition-transform" size={40} />
                    <div className="space-y-2">
                       <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">SECURE LINK ESTABLISHED</h4>
                       <p className="text-xs text-slate-500 dark:text-slate-400 italic leading-relaxed uppercase tracking-wider opacity-60">
                         Protocol-level capital preservation active. Settlement automation triggered upon chronographic resolution of node cycles.
                       </p>
                    </div>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
