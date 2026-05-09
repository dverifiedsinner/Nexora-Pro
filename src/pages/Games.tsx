import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gamepad2, Zap, TrendingUp, Trophy, ArrowRight, Star, AlertCircle, Check, X, Clock, Wallet, Award } from 'lucide-react';

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
        type: 'task', // Closest match: funding, withdrawal, bonus, referral, task, investment
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
      console.log("Games: Initiating meta simulation...", { amount, selections: selectedMatches.length });
      
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
    }, 60000); // Auto-refresh matches every 60s
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
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Games & Predictions</h1>
          <p className="text-slate-500 dark:text-white/40 font-light italic">Stake your insights and unlock massive reward pools.</p>
        </div>
        <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl backdrop-blur-md overflow-x-auto scrollbar-hide">
          {[
            { id: 'prediction', label: 'Stadium Meta' },
            { id: 'spin', label: 'Nitro Spin' },
            { id: 'staking', label: 'Quantum Stake' }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 md:px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === tab.id ? 'bg-cyan-500 text-white shadow-xl shadow-cyan-500/20' : 'text-slate-400 dark:text-white/20 hover:text-slate-600 dark:hover:text-white/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {activeTab === 'prediction' && (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {stakingStatus === 'idle' ? (
            <section className="grid lg:grid-cols-3 gap-8">
              {/* Match Selection List */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between px-2 mb-4">
                   <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 dark:text-white/30">Match Registry</h3>
                   <span className="text-[10px] font-black text-cyan-600 dark:text-cyan-400">ACTIVE POOLS</span>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {matches.map((match) => {
                    const selection = selectedMatches.find(m => m.id === match.id);
                    return (
                      <div
                        key={match.id}
                        className="glass-card p-6 border-black/5 dark:border-white/5 space-y-6"
                      >
                        <div className="flex justify-between items-center">
                           <span className="text-[9px] font-black text-slate-400 dark:text-white/20 uppercase tracking-widest">Match Node {match.id}</span>
                           <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-cyan-500 dark:bg-cyan-400 rounded-full animate-ping"></div>
                              <span className="text-[9px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">Live Live</span>
                           </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                           <div className="text-center w-24">
                              <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center font-black mb-1 mx-auto text-slate-900 dark:text-white">{match.teams[0]}</div>
                              <p className="text-[10px] font-bold text-slate-400 dark:text-white/40 uppercase">{match.teams[0]}</p>
                           </div>
                           <p className="text-xl font-display font-black text-slate-200 dark:text-white/10 uppercase italic">VS</p>
                           <div className="text-center w-24">
                              <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center font-black mb-1 mx-auto text-slate-900 dark:text-white">{match.teams[1]}</div>
                              <p className="text-[10px] font-bold text-slate-400 dark:text-white/40 uppercase">{match.teams[1]}</p>
                           </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-2">
                           {[
                             { label: '1', pick: '1' as const, odds: match.odds.home },
                             { label: 'X', pick: 'X' as const, odds: match.odds.draw },
                             { label: '2', pick: '2' as const, odds: match.odds.away }
                           ].map((opt) => (
                             <button
                               key={opt.pick}
                               onClick={() => toggleMatch(match.id, opt.pick)}
                               className={`py-3 rounded-xl border flex flex-col items-center gap-1 transition-all group active:scale-95 ${
                                 selection?.pick === opt.pick 
                                   ? 'bg-cyan-500 border-cyan-400 text-white shadow-lg shadow-cyan-500/20' 
                                   : 'bg-slate-50 dark:bg-white/5 border-black/5 dark:border-white/5 text-slate-400 dark:text-white/40 hover:border-black/10 dark:hover:border-white/20'
                               }`}
                             >
                               <span className="text-[10px] font-black uppercase tracking-widest leading-none mb-1 opacity-40">{opt.label}</span>
                               <span className="text-xs font-black tracking-tighter">{opt.odds}x</span>
                             </button>
                           ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bet Slip */}
              <div className="space-y-6">
                 <div className="glass-card p-8 bg-gradient-to-br from-slate-50 dark:from-white/[0.03] to-transparent border-black/5 dark:border-white/5 flex flex-col justify-between min-h-[400px]">
                    <div className="space-y-8">
                       <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 dark:text-white/30">Your Slip</h4>
                          <span className="text-[10px] font-black text-cyan-600 dark:text-cyan-400 px-3 py-1 bg-cyan-400/10 rounded-full">{selectedMatches.length} NODES</span>
                       </div>
                       
                       <div className="space-y-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                          {selectedMatches.map(sel => {
                            const match = matches.find(m => m.id === sel.id);
                            const odds = match ? currentOdds(match, sel.pick) : 0;
                            return (
                              <div key={sel.id} className="flex justify-between items-center py-2 border-b border-black/5 dark:border-white/5">
                                <div className="space-y-1">
                                  <span className="text-xs font-black uppercase italic block text-slate-900 dark:text-white">{match?.teams[0]} vs {match?.teams[1]}</span>
                                  <span className="text-[9px] font-black text-slate-400 dark:text-white/20 uppercase tracking-widest">Choice: {sel.pick === '1' ? 'Home' : sel.pick === '2' ? 'Away' : 'Draw'}</span>
                                </div>
                                <span className="text-[10px] font-black text-cyan-600 dark:text-cyan-400">{odds}x</span>
                              </div>
                            );
                          })}

                          {selectedMatches.length === 0 && (
                            <p className="text-sm text-slate-400 dark:text-white/20 italic text-center py-8">Initialize stadium nodes to build slip</p>
                          )}
                       </div>

                       <div className="space-y-4">
                          <div className="flex justify-between items-end border-t border-black/5 dark:border-white/5 pt-6">
                             <div>
                                <p className="text-[9px] font-black text-slate-400 dark:text-white/20 uppercase tracking-widest mb-1">Variable Stake (₦)</p>
                                <div className="relative">
                                   <input 
                                     type="text" 
                                     value={stakeAmount}
                                     onChange={(e) => setStakeAmount(e.target.value)}
                                     placeholder="ENTER AMOUNT"
                                     className="bg-transparent border-none text-2xl font-display font-black text-slate-900 dark:text-white focus:outline-none w-32"
                                   />
                                </div>
                             </div>
                             <div className="text-right">
                                <p className="text-[9px] font-black text-slate-400 dark:text-white/20 uppercase tracking-widest mb-1">Potential 5X Yield</p>
                                <p className="text-2xl font-display font-black text-cyan-600 dark:text-cyan-400 tracking-tighter italic">₦{(potentialWin || 0).toLocaleString()}</p>
                             </div>
                          </div>
                          
                          <button 
                            disabled={isProcessingStaking || stakingStatus !== 'idle'}
                            onClick={handleStake}
                            className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 transition-all ${
                              !isProcessingStaking && stakingStatus === 'idle'
                                ? 'bg-cyan-500 text-white shadow-xl shadow-cyan-500/20 active:scale-95' 
                                : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-white/20 cursor-not-allowed opacity-50'
                            }`}
                          >
                            <span className="text-xs font-black uppercase tracking-widest">{isProcessingStaking ? 'VERIFYING...' : 'Commit Stake'}</span>
                            <ArrowRight size={18} />
                          </button>
                       </div>
                    </div>
                 </div>
              </div>
            </section>
          ) : (
            <section className="flex flex-col items-center justify-center py-24 space-y-12 animate-in fade-in zoom-in-95 duration-500">
               <div className="relative w-80 h-80">
                  {/* Processing Visual */}
                  <div className={`absolute inset-0 rounded-full border-[12px] ${stakingStatus === 'processing' ? 'border-cyan-500/20 animate-pulse' : (winResult ? 'border-emerald-500/20' : 'border-red-500/20')} flex items-center justify-center overflow-hidden`}>
                     {stakingStatus === 'processing' ? (
                       <motion.div 
                         initial={{ rotate: 0 }}
                         animate={{ rotate: 360 }}
                         transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                         className="absolute inset-0 border-t-8 border-cyan-500 rounded-full"
                       />
                     ) : (
                       <div className={`absolute inset-0 bg-gradient-to-br ${winResult ? 'from-emerald-500/10' : 'from-red-500/10'} to-transparent`} />
                     )}
                     
                     <div className="z-10 text-center space-y-2">
                        {stakingStatus === 'processing' ? (
                          <>
                            <p className="text-5xl font-display font-black italic">{timer}S</p>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Simulating Meta</p>
                          </>
                        ) : (
                          <>
                            {winResult ? (
                              <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="flex flex-col items-center">
                                <Trophy size={64} className="text-emerald-400 mb-2 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
                                <p className="text-4xl font-display font-black italic uppercase text-emerald-400">WINNER!</p>
                              </motion.div>
                            ) : (
                              <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="flex flex-col items-center">
                                <X size={64} className="text-red-500 mb-2" />
                                <p className="text-4xl font-display font-black italic uppercase text-red-500">VOIDED</p>
                              </motion.div>
                            )}
                          </>
                        )}
                     </div>
                  </div>
               </div>

               <div className="text-center space-y-6 max-w-sm">
                  <div className="space-y-4">
                     {stakingStatus === 'processing' ? (
                       <p className="text-white/40 font-light italic leading-relaxed animate-pulse">
                         Our virtual engine is calculating the stadium outcomes across {selectedMatches.length} concurrent nodes...
                       </p>
                     ) : (
                       <div className="space-y-2">
                          <p className="text-white/40 font-light italic leading-relaxed">
                            {winResult ? 
                              `Simulation complete. Asset yield of ₦${(potentialWin || 0).toLocaleString()} credited to your Bonus Wallet.` : 
                              'Simulation concluded with architectural zero. Better luck in the next stadium meta cycle.'
                            }
                          </p>
                          <button 
                            onClick={resetPrediction}
                            className="btn-outline py-4 px-10 text-[10px] font-black uppercase tracking-widest border-white/10 hover:border-cyan-500/40"
                          >
                            New Simulation
                          </button>
                       </div>
                     )}
                  </div>
               </div>
            </section>
          )}

          <section className="glass-card p-10 bg-gradient-to-r from-pink-600/10 to-transparent border-white/5 relative overflow-hidden">
             <div className="relative z-10 flex gap-8 items-center">
                <div className="w-20 h-20 bg-white/5 rounded-[2.5rem] flex items-center justify-center shrink-0 border border-white/5 shadow-2xl">
                  <AlertCircle size={40} className="text-pink-400 opacity-80" />
                </div>
                <div className="space-y-2">
                   <h4 className="text-xl font-display font-bold tracking-tight text-pink-200">Protocol Awareness</h4>
                   <p className="text-sm text-white/40 font-light leading-relaxed max-w-2xl">
                     Predictions carry inherent volatility. NEXORA mandates responsible participation. All pool fees directly fuel the platform's liquidity and reward distribution algorithm.
                   </p>
                </div>
             </div>
             <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-32 bg-pink-500/5 blur-[120px]"></div>
          </section>
        </div>
      )}

      {activeTab === 'spin' && (
        <div className="flex flex-col items-center py-8 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
           
           <div className="w-full flex justify-center">
              <SpinWheel 
                isSpinning={isWheelSpinning} 
                onSpinComplete={handleSpinComplete} 
                stake={Number(spinStake)} 
              />
           </div>

           <div className="text-center space-y-10 w-full max-w-sm">
              <div className="space-y-4">
                 <h2 className="text-5xl font-display font-black tracking-tight italic uppercase text-gradient">Nitro Spin.</h2>
                 <p className="text-slate-500 dark:text-white/40 font-light italic leading-relaxed">
                    Access potential yield up to <span className="text-cyan-600 dark:text-cyan-400 font-black tracking-widest text-lg ml-1">5X YOUR STAKE!</span>
                 </p>
                 <div className="bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/5 p-6 rounded-3xl space-y-4 shadow-xl">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-white/20">Nitro Variable Stake (₦)</p>
                    <div className="flex items-center justify-center gap-4">
                       <span className="text-2xl font-display font-black text-cyan-500 dark:text-cyan-400 opacity-40 italic">₦</span>
                       <input 
                          type="text" 
                          value={spinStake}
                          onChange={(e) => setSpinStake(e.target.value)}
                          disabled={stakingStatus !== 'idle'}
                          className="bg-transparent border-none text-4xl font-display font-black text-slate-900 dark:text-white focus:outline-none w-40 text-center tracking-tighter"
                          placeholder="200"
                       />
                    </div>
                 </div>
              </div>

              {stakingStatus === 'result' ? (
                <button 
                  onClick={() => setStakingStatus('idle')}
                  className="w-full py-5 rounded-2xl bg-slate-100 dark:bg-white/5 border border-cyan-500/30 text-cyan-600 dark:text-cyan-500 font-black text-lg uppercase tracking-widest hover:bg-cyan-500/10 transition-all flex items-center justify-center gap-3"
                >
                  New Simulation <TrendingUp size={20} />
                </button>
              ) : (
                <button 
                  onClick={toggleSpin}
                  disabled={stakingStatus !== 'idle' || isProcessingStaking}
                  className="w-full btn-primary py-5 text-xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 shadow-2xl shadow-cyan-500/20 border-t border-white/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isProcessingStaking ? 'INITIATING...' : <>INITIATE <Zap size={24} className="fill-white" /></>}
                </button>
              )}
              <div className="pt-8 grid grid-cols-2 gap-6">
                 <div className="glass-card p-6 bg-slate-50 dark:bg-white/[0.02] border-black/5 dark:border-white/5">
                    <p className="text-[10px] text-slate-400 dark:text-white/20 font-black uppercase tracking-widest mb-2">Cycles Today</p>
                    <p className="text-2xl font-display font-black tracking-tighter text-slate-900 dark:text-white">01 / 05</p>
                 </div>
                 <div className="glass-card p-6 bg-slate-50 dark:bg-white/[0.02] border-black/5 dark:border-white/5">
                    <p className="text-[10px] text-slate-400 dark:text-white/20 font-black uppercase tracking-widest mb-2">Total Yield</p>
                    <p className="text-2xl font-display font-black text-cyan-600 dark:text-cyan-400 tracking-tighter">₦2,400</p>
                 </div>
              </div>
           </div>
        </div>
      )}
      {activeTab === 'staking' && (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <h2 className="text-5xl md:text-6xl font-display font-black tracking-tight italic uppercase text-gradient leading-[0.9]">Quantum <br /> Pool Staking.</h2>
                <p className="text-slate-500 dark:text-white/40 font-light italic leading-relaxed text-lg max-w-md">
                  Deploy your bonus reservoir into high-yield staking nodes. Earn daily passive liquidation directly to your investment wallet.
                </p>
              </div>

              <div className="glass-card p-10 space-y-10 bg-gradient-to-br from-slate-50 dark:from-white/[0.03] to-transparent border-black/5 dark:border-white/5 shadow-2xl">
                <div className="space-y-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-white/20">Select Staking Configuration</p>
                  <div className="grid grid-cols-3 gap-4">
                    {[7, 14, 30].map((days) => (
                      <button 
                        key={days}
                        onClick={() => setStakingDays(days)}
                        className={`py-4 rounded-2xl border transition-all flex flex-col items-center gap-1 ${
                          stakingDays === days 
                            ? 'bg-cyan-500 border-cyan-400 text-white shadow-xl shadow-cyan-500/20 scale-105' 
                            : 'bg-slate-100 dark:bg-white/5 border-black/5 dark:border-white/5 text-slate-400 dark:text-white/30 hover:border-black/10 dark:hover:border-white/20 text-slate-600 dark:text-white'
                        }`}
                      >
                        <span className="text-xl font-display font-black">{days}</span>
                        <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Days</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-white/20">Staking Amount (₦)</p>
                  <div className="bg-slate-200/50 dark:bg-black/20 rounded-3xl p-6 border border-black/5 dark:border-white/5 flex items-center justify-between">
                    <input 
                      type="text" 
                      value={stakingAmount}
                      onChange={(e) => setStakingAmount(e.target.value)}
                      className="bg-transparent border-none text-4xl font-display font-black text-slate-900 dark:text-white focus:outline-none w-full"
                      placeholder="ENTER AMOUNT"
                    />
                    <span className="text-2xl font-display font-black text-cyan-600 dark:text-cyan-400 opacity-40 italic">₦</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-black/5 dark:border-white/5 space-y-8">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-400 dark:text-white/20 italic">Estimated APY</span>
                    <span className="text-emerald-600 dark:text-emerald-400">+{stakingDays === 7 ? '15' : stakingDays === 14 ? '35' : '85'}% Retun</span>
                  </div>
                  <button 
                    onClick={handleQuantumStake}
                    disabled={isStaking}
                    className="w-full btn-primary py-5 text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl shadow-cyan-500/30 active:scale-95 transition-all"
                  >
                    {isStaking ? 'Verifying Node...' : 'Initiate Quantum Stake'} <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </div>

            <div className="hidden lg:block relative group">
              <div className="absolute -inset-20 bg-cyan-500/5 blur-[120px] rounded-full animate-float-slow"></div>
              <div className="glass-card p-12 bg-gradient-to-br from-slate-100/50 dark:from-cyan-600/10 to-transparent border-black/5 dark:border-white/10 relative z-10 rotate-3 animate-float transition-transform group-hover:rotate-0 duration-700">
                <Trophy size={100} strokeWidth={0.5} className="text-cyan-600/20 dark:text-cyan-400/20 mb-8 mx-auto" />
                <h4 className="text-2xl font-display font-black text-center uppercase tracking-tighter italic mb-8 text-slate-900 dark:text-white">Active Nodes</h4>
                <div className="space-y-6">
                  {((userData as any)?.activeStakes || []).length > 0 ? (
                    (userData as any).activeStakes.map((stake: any, idx: number) => (
                      <div key={idx} className="p-5 bg-slate-50 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 flex justify-between items-center group/item hover:bg-slate-100 dark:hover:bg-white/10 transition-all">
                        <div>
                          <p className="text-[9px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest mb-1 italic">Locked Reservoir</p>
                          <p className="text-xl font-display font-black text-slate-900 dark:text-white">₦{(stake.amount || 0).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] font-black text-slate-400 dark:text-white/20 uppercase tracking-widest mb-1">Time Remaining</p>
                          <p className="text-xl font-display font-black text-slate-400 dark:text-white/40">{stake.days} Days</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center space-y-4">
                       <Clock size={40} className="mx-auto text-slate-300 dark:text-white/10 animate-spin-slow" />
                       <p className="text-xs text-slate-400 dark:text-white/20 font-black uppercase tracking-[0.2em]">No active staking nodes detected.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <section className="glass-card p-12 bg-gradient-to-r from-emerald-600/10 to-transparent border-black/10 dark:border-white/5 relative overflow-hidden">
             <div className="relative z-10 flex gap-10 items-center">
                <div className="w-24 h-24 bg-slate-100 dark:bg-white/5 rounded-[3rem] flex items-center justify-center shrink-0 border border-black/5 dark:border-white/10 shadow-2xl">
                  <Award size={48} className="text-emerald-500 dark:text-emerald-400 opacity-80" />
                </div>
                <div className="space-y-3">
                   <h4 className="text-2xl font-display font-bold tracking-tight text-emerald-700 dark:text-emerald-200">Governance & Yield Protocol</h4>
                   <p className="text-base text-slate-500 dark:text-white/40 font-light leading-relaxed max-w-4xl italic">
                     Staked assets are locked in our high-frequency trading & curriculum nodes for the specified duration. Rewards are calculated daily and distributed upon cycle completion. Premature liquidation is not permitted under Nexora protocol 4.0.
                   </p>
                </div>
             </div>
             <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-40 bg-emerald-500/5 blur-[150px]"></div>
          </section>
        </div>
      )}
    </div>
  );
}
