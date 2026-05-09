import React from 'react';
import { motion } from 'motion/react';
import { Zap, Trophy, TrendingUp, AlertCircle, Sparkles } from 'lucide-react';

interface SpinWheelProps {
  isSpinning: boolean;
  onSpinComplete: (reward: number) => void;
  stake: number;
}

const REWARDS = [
  { label: '5X', multiplier: 5, color: 'from-yellow-400 to-yellow-600', icon: Sparkles },
  { label: '0.5X', multiplier: 0.5, color: 'from-slate-700 to-slate-900', icon: AlertCircle },
  { label: '1.5X', multiplier: 1.5, color: 'from-blue-400 to-blue-600', icon: TrendingUp },
  { label: '0X', multiplier: 0, color: 'from-red-500 to-red-700', icon: AlertCircle },
  { label: '2X', multiplier: 2, color: 'from-emerald-400 to-emerald-600', icon: Trophy },
  { label: '0.2X', multiplier: 0.2, color: 'from-slate-700 to-slate-900', icon: AlertCircle },
  { label: '3X', multiplier: 3, color: 'from-purple-400 to-purple-600', icon: Zap },
  { label: '1X', multiplier: 1, color: 'from-cyan-400 to-cyan-600', icon: TrendingUp },
];

export default function SpinWheel({ isSpinning, onSpinComplete, stake }: SpinWheelProps) {
  const [rotation, setRotation] = React.useState(0);
  const [lastResult, setLastResult] = React.useState<number | null>(null);

  const startSpin = () => {
    if (isSpinning) return;

    // Calculate random target
    const extraSpins = 5 + Math.floor(Math.random() * 5);
    const randomIndex = Math.floor(Math.random() * REWARDS.length);
    const segmentSize = 360 / REWARDS.length;
    const targetRotation = rotation + (extraSpins * 360) + (randomIndex * segmentSize) + (Math.random() * segmentSize);

    setRotation(targetRotation);

    // Calculate result after animation duration (should match transition duration)
    setTimeout(() => {
      // Logic adjusted: pointer is at top (-90deg relative to SVG 0deg)
      // When wheel rotates R, we check what index fell into the top
      const segmentSize = 360 / REWARDS.length;
      const normalizedRotation = targetRotation % 360;
      const indexAtTop = Math.floor(((360 - normalizedRotation + 270) % 360) / segmentSize);
      
      const reward = REWARDS[indexAtTop];
      setLastResult(reward.multiplier);
      onSpinComplete(reward.multiplier);
    }, 4000);
  };

  React.useEffect(() => {
    if (isSpinning) {
      startSpin();
    }
  }, [isSpinning]);

  return (
    <div className="relative flex flex-col items-center gap-12 py-8">
      {/* Stake Indicator Card */}
      <div className="absolute top-[-40px] z-30 animate-in fade-in slide-in-from-top-4">
        <div className="px-6 py-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-yellow-500/30 rounded-2xl flex items-center gap-3 shadow-2xl">
          <Zap size={16} className="text-yellow-500 fill-yellow-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-white/60">Active Stake:</span>
          <span className="text-lg font-display font-black text-slate-900 dark:text-white italic">₦{stake.toLocaleString()}</span>
        </div>
      </div>

      {/* Wheel Container */}
      <div className="relative w-80 h-80 md:w-[450px] md:h-[450px]">
        {/* Glow Effect */}
        <div className={`absolute -inset-10 bg-cyan-500/10 blur-[100px] rounded-full transition-opacity duration-1000 ${isSpinning ? 'opacity-100' : 'opacity-40'}`}></div>
        
        {/* Pointer */}
        <div className="absolute -top-4 left-1/2 -track-x-1/2 z-40 flex flex-col items-center">
           <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[24px] border-t-slate-900 dark:border-t-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>
        </div>

        {/* Outer Ring Decoration */}
        <div className="absolute inset-[-20px] border-[2px] border-slate-900/5 dark:border-white/5 rounded-full animate-spin-slow"></div>
        <div className="absolute inset-[-40px] border-[1px] border-slate-900/5 dark:border-white/5 rounded-full animate-reverse-spin-slow opacity-30"></div>

        {/* Main Wheel */}
        <motion.div
           className="relative w-full h-full rounded-full border-[12px] border-slate-900 shadow-2xl overflow-hidden shadow-black/80 ring-4 ring-slate-900/5 dark:ring-white/5"
           animate={{ rotate: rotation }}
           transition={{ 
             duration: 4, 
             ease: [0.15, 0, 0.15, 1], // Custom slow-down ease
           }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {REWARDS.map((reward, i) => {
              const startAngle = (i * 360) / REWARDS.length;
              const endAngle = ((i + 1) * 360) / REWARDS.length;
              const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
              const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
              const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
              const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);

              const d = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

              return (
                <g key={i}>
                  <path
                    d={d}
                    fill={i % 2 === 0 ? 'rgba(15, 23, 42, 0.95)' : 'rgba(2, 6, 23, 1)'}
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="0.2"
                  />
                  <defs>
                    <linearGradient id={`grad-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" className={reward.color.split(' ')[0].replace('from-', 'stop-')} />
                      <stop offset="100%" className={reward.color.split(' ')[1].replace('to-', 'stop-')} />
                    </linearGradient>
                  </defs>
                  
                  {/* Decorative Gradient Overlay */}
                  <path
                    d={d}
                    fill={`url(#grad-${i})`}
                    className="opacity-20"
                  />
                </g>
              );
            })}
          </svg>

          {/* Labels & Icons Layer */}
          <div className="absolute inset-0 pointer-events-none">
            {REWARDS.map((reward, i) => {
              const angle = (i * 360) / REWARDS.length + (360 / REWARDS.length) / 2;
              return (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2"
                  style={{
                    transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-140px)`,
                  }}
                >
                  <reward.icon size={28} className={`text-white group-hover:scale-110 transition-transform ${reward.multiplier >= 1 ? 'drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'opacity-40'}`} />
                  <span className="text-xl font-display font-black text-white tracking-widest">{reward.label}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Center Hub */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="w-24 h-24 rounded-full bg-slate-900 border-[6px] border-slate-800 dark:border-white/10 flex items-center justify-center shadow-2xl relative">
            <div className={`absolute inset-0 rounded-full animate-ping bg-cyan-500/20 ${isSpinning ? 'block' : 'hidden'}`}></div>
            <Zap size={40} className={`text-cyan-400 fill-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,1)] transition-all ${isSpinning ? 'animate-pulse' : ''}`} />
          </div>
        </div>
      </div>

      {/* Quick Spin Status */}
      <div className="flex flex-col items-center gap-4">
        {lastResult !== null && !isSpinning && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`px-8 py-3 rounded-2xl border-2 font-display font-black text-xl italic uppercase tracking-widest ${
              lastResult >= 1 ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-red-500/10 border-red-500/40 text-red-400'
            }`}
          >
            {lastResult > 0 ? `YIELD: ${lastResult}X` : 'VOIDED STATUS'}
          </motion.div>
        )}
      </div>
    </div>
  );
}
