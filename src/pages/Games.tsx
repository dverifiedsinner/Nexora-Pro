import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gamepad2, Zap, TrendingUp, Trophy, ArrowRight, Star, AlertCircle, Check, X, Clock, Wallet } from 'lucide-react';

interface Match {
  id: string;
  teams: string[];
  odds: { home: number; draw: number; away: number };
}

import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

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
  const { userData } = useAuth();
  const [activeTab, setActiveTab] = useState<'prediction' | 'spin'>('prediction');
  const [matches, setMatches] = useState<Match[]>(generateMatches());
  const [selectedMatches, setSelectedMatches] = useState<{ id: string; pick: '1' | 'X' | '2' }[]>([]);
  const [stakeAmount, setStakeAmount] = useState<string>('500');
  const [spinStake, setSpinStake] = useState<string>('500');
  const [stakingStatus, setStakingStatus] = useState<'idle' | 'processing' | 'result'>('idle');
  const [timer, setTimer] = useState(0);
  const [winResult, setWinResult] = useState<boolean | null>(null);
  const [isProcessingStaking, setIsProcessingStaking] = useState(false);

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
    const amount = Number(stakeAmount);
    if (!userData || selectedMatches.length === 0 || amount < 500) {
      alert("Minimum stake is ₦500.");
      return;
    }
    
    if ((userData.balances?.main || 0) < amount) {
      alert("Insufficient Main Reservoir fuel.");
      return;
    }

    setIsProcessingStaking(true);
    try {
      const newBalances = {
        ...userData.balances,
        main: Number(userData.balances.main) - amount
      };
      const newTransaction = {
        type: 'bet',
        title: 'VIRTUAL BET STAKE',
        amount: -amount,
        time: new Date().toISOString(),
        status: 'COMMITTED'
      };

      const { error } = await supabase
        .from('profiles')
        .update({
          balances: newBalances,
          transactions: [...(userData.transactions || []), newTransaction]
        })
        .eq('uid', userData.uid);

      if (error) throw error;

      setStakingStatus('processing');
      setTimer(30);
    } catch (err) {
      console.error(err);
      alert("Staking protocol failed.");
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
    const amount = Number(spinStake);
    if (!userData || amount < 500) {
      alert("Minimum stake is ₦500 for high-velocity spins.");
      return;
    }

    if ((userData.balances?.main || 0) < amount) {
      alert("Insufficient Main Reservoir fuel.");
      return;
    }

    setIsProcessingStaking(true);
    try {
      const newBalances = {
        ...userData.balances,
        main: Number(userData.balances.main) - amount
      };
      const newTransaction = {
        type: 'spin',
        title: 'NITRO SPIN STAKE',
        amount: -amount,
        time: new Date().toISOString(),
        status: 'COMMITTED'
      };

      const { error } = await supabase
        .from('profiles')
        .update({
          balances: newBalances,
          transactions: [...(userData.transactions || []), newTransaction]
        })
        .eq('uid', userData.uid);

      if (error) throw error;

      setStakingStatus('processing');
      setTimer(5); // Faster for spin
    } catch (err) {
      console.error(err);
      alert("Spin init failed.");
    } finally {
      setIsProcessingStaking(false);
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
    } else if (stakingStatus === 'processing' && timer === 0) {
      const won = Math.random() > 0.7;
      setWinResult(won);
      setStakingStatus('result');
      
      if (won && userData) {
        const reward = activeTab === 'prediction' ? potentialWin : Number(spinStake) * 5;
        
        const processWin = async () => {
          const newBalances = {
            ...userData.balances,
            investment: Number(userData.balances.investment || 0) + reward
          };
          const newTransaction = {
            type: 'win',
            title: activeTab === 'prediction' ? 'BET YIELD' : 'SPIN YIELD',
            amount: reward,
            time: new Date().toISOString(),
            status: 'GRANTED'
          };

          await supabase
            .from('profiles')
            .update({
              balances: newBalances,
              transactions: [...(userData.transactions || []), newTransaction]
            })
            .eq('uid', userData.uid);
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
          <h1 className="text-3xl font-display font-bold">Games & Predictions</h1>
          <p className="text-white/40 font-light italic">Stake your insights and unlock massive reward pools.</p>
        </div>
        <div className="flex gap-2 p-1.5 bg-white/5 border border-white/5 rounded-2xl backdrop-blur-md">
          <button 
            onClick={() => setActiveTab('prediction')}
            className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'prediction' ? 'bg-cyan-500 text-white shadow-xl shadow-cyan-500/20' : 'text-white/20 hover:text-white/60'
            }`}
          >
            Stadium Meta
          </button>
          <button 
            onClick={() => setActiveTab('spin')}
            className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'spin' ? 'bg-cyan-500 text-white shadow-xl shadow-cyan-500/20' : 'text-white/20 hover:text-white/60'
            }`}
          >
            Nitro Spin
          </button>
        </div>
      </header>

      {activeTab === 'prediction' && (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {stakingStatus === 'idle' ? (
            <section className="grid lg:grid-cols-3 gap-8">
              {/* Match Selection List */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between px-2 mb-4">
                   <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/30">Match Registry</h3>
                   <span className="text-[10px] font-black text-cyan-400">ACTIVE POOLS</span>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {matches.map((match) => {
                    const selection = selectedMatches.find(m => m.id === match.id);
                    return (
                      <div
                        key={match.id}
                        className="glass-card p-6 border-white/5 space-y-6"
                      >
                        <div className="flex justify-between items-center">
                           <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Match Node {match.id}</span>
                           <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping"></div>
                              <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">Live Live</span>
                           </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                           <div className="text-center w-24">
                              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center font-black mb-1 mx-auto">{match.teams[0]}</div>
                              <p className="text-[10px] font-bold text-white/40 uppercase">{match.teams[0]}</p>
                           </div>
                           <p className="text-xl font-display font-black text-white/10 uppercase italic">VS</p>
                           <div className="text-center w-24">
                              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center font-black mb-1 mx-auto">{match.teams[1]}</div>
                              <p className="text-[10px] font-bold text-white/40 uppercase">{match.teams[1]}</p>
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
                                   : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20'
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
                 <div className="glass-card p-8 bg-gradient-to-br from-white/[0.03] to-transparent border-white/5 flex flex-col justify-between min-h-[400px]">
                    <div className="space-y-8">
                       <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/30">Your Slip</h4>
                          <span className="text-[10px] font-black text-cyan-400 px-3 py-1 bg-cyan-400/10 rounded-full">{selectedMatches.length} NODES</span>
                       </div>
                       
                       <div className="space-y-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                          {selectedMatches.map(sel => {
                            const match = matches.find(m => m.id === sel.id);
                            const odds = match ? currentOdds(match, sel.pick) : 0;
                            return (
                              <div key={sel.id} className="flex justify-between items-center py-2 border-b border-white/5">
                                <div className="space-y-1">
                                  <span className="text-xs font-black uppercase italic block">{match?.teams[0]} vs {match?.teams[1]}</span>
                                  <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Choice: {sel.pick === '1' ? 'Home' : sel.pick === '2' ? 'Away' : 'Draw'}</span>
                                </div>
                                <span className="text-[10px] font-black text-cyan-400">{odds}x</span>
                              </div>
                            );
                          })}

                          {selectedMatches.length === 0 && (
                            <p className="text-sm text-white/20 italic text-center py-8">Initialize stadium nodes to build slip</p>
                          )}
                       </div>

                       <div className="space-y-4">
                          <div className="flex justify-between items-end border-t border-white/5 pt-6">
                             <div>
                                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Variable Stake (₦500 MIN)</p>
                                <div className="relative">
                                   <input 
                                     type="text" 
                                     value={stakeAmount}
                                     onChange={(e) => setStakeAmount(e.target.value)}
                                     placeholder="500"
                                     className="bg-transparent border-none text-2xl font-display font-black text-white focus:outline-none w-32"
                                   />
                                </div>
                             </div>
                             <div className="text-right">
                                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Potential 5X Yield</p>
                                <p className="text-2xl font-display font-black text-cyan-400 tracking-tighter italic">₦{potentialWin.toLocaleString()}</p>
                             </div>
                          </div>
                          
                          <button 
                            disabled={selectedMatches.length === 0 || isProcessingStaking || stakingStatus !== 'idle'}
                            onClick={handleStake}
                            className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 transition-all ${
                              selectedMatches.length > 0 && !isProcessingStaking && stakingStatus === 'idle'
                                ? 'bg-cyan-500 text-white shadow-xl shadow-cyan-500/20 active:scale-95' 
                                : 'bg-white/5 text-white/20 cursor-not-allowed opacity-50'
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
                              `Simulation complete. Asset yield of ₦${potentialWin.toLocaleString()} credited to your Bonus Wallet.` : 
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
        <div className="flex flex-col items-center py-16 space-y-16 animate-in fade-in slide-in-from-bottom+4 duration-700">
           <div className="relative w-96 h-96 group">
              <div className="absolute -inset-8 bg-cyan-500/20 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
              {/* Complex Wheel Visual */}
              <div className="absolute inset-0 rounded-full border-[16px] border-white/5 shadow-2xl flex items-center justify-center overflow-hidden bg-black/20 backdrop-blur-xl">
                 <div className="absolute inset-0 bg-[conic-gradient(from_0deg,_#22d3ee_0%_12%,_#2563eb_12%_25%,_#db2777_25%_37%,_#7c3aed_37%_50%,_#22d3ee_50%_62%,_#2563eb_62%_75%,_#db2777_75%_87%,_#7c3aed_87%_100%)] opacity-30 group-hover:animate-infinite-spin"></div>
                 {/* Hub */}
                 <div className="z-10 w-28 h-28 bg-[#0f172a] rounded-full border-[8px] border-white/5 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
                    <Zap size={48} className="text-cyan-400 fill-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
                 </div>
                 {/* Internal Rings */}
                 <div className="absolute w-[calc(100%-40px)] h-[calc(100%-40px)] border border-white/5 rounded-full"></div>
                 <div className="absolute w-[calc(100%-80px)] h-[calc(100%-80px)] border border-white/5 rounded-full"></div>
                 {/* Tickers */}
                 {[...Array(16)].map((_, i) => (
                   <div key={i} className="absolute top-0 w-0.5 h-3 bg-white/10 origin-bottom" style={{ height: '192px', transform: `rotate(${i * 22.5}deg)` }}></div>
                 ))}
                 {/* Reward Indicators */}
                 {[...Array(8)].map((_, i) => (
                   <div key={i} className="absolute inset-0 flex flex-col items-center pt-8 pointer-events-none" style={{ transform: `rotate(${i * 45 + 22.5}deg)` }}>
                      <span className="text-[10px] font-black text-white/40 tracking-widest origin-center">₦{(i + 1) * 500}</span>
                   </div>
                 ))}
              </div>
              {/* Pointer */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-10 h-14 bg-white clip-path-polygon-[50%_100%,0%_0%,100%_0%] z-20 shadow-2xl shadow-cyan-500/50"></div>
           </div>

           <div className="text-center space-y-10 max-w-sm">
              <div className="space-y-4">
                 <h2 className="text-5xl font-display font-black tracking-tight italic uppercase text-gradient">Nitro Spin.</h2>
                 <p className="text-white/40 font-light italic leading-relaxed">
                    Access potential yield up to <span className="text-cyan-400 font-black tracking-widest text-lg ml-1">5X YOUR STAKE!</span>
                 </p>
                 <div className="bg-white/5 border border-white/5 p-6 rounded-3xl space-y-4 shadow-xl">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20">Nitro Variable Stake (₦500 MIN)</p>
                    <div className="flex items-center justify-center gap-4">
                       <span className="text-2xl font-display font-black text-cyan-400 opacity-40 italic">₦</span>
                       <input 
                          type="text" 
                          value={spinStake}
                          onChange={(e) => setSpinStake(e.target.value)}
                          className="bg-transparent border-none text-4xl font-display font-black text-white focus:outline-none w-40 text-center tracking-tighter"
                          placeholder="500"
                       />
                    </div>
                 </div>
              </div>
              <button 
                onClick={toggleSpin}
                disabled={stakingStatus !== 'idle' || isProcessingStaking}
                className="w-full btn-primary py-5 text-xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 shadow-2xl shadow-cyan-500/20 border-t border-white/20 active:scale-95 transition-all disabled:opacity-50"
              >
                {isProcessingStaking ? 'INITIATING...' : <>INITIATE <Zap size={24} className="fill-white" /></>}
              </button>
              <div className="pt-8 grid grid-cols-2 gap-6">
                 <div className="glass-card p-6 bg-white/[0.02] border-white/5">
                    <p className="text-[10px] text-white/20 font-black uppercase tracking-widest mb-2">Cycles Today</p>
                    <p className="text-2xl font-display font-black tracking-tighter">01 / 05</p>
                 </div>
                 <div className="glass-card p-6 bg-white/[0.02] border-white/5">
                    <p className="text-[10px] text-white/20 font-black uppercase tracking-widest mb-2">Total Yield</p>
                    <p className="text-2xl font-display font-black text-cyan-400 tracking-tighter">₦2,400</p>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
