import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, Users, Wallet, Zap, Award } from 'lucide-react';

const firstNames = ['Emeka', 'Sarah', 'David', 'Chioma', 'Samuel', 'Grace', 'Blessing', 'John', 'Alice', 'Michael', 'Esther', 'Peter', 'Joy', 'Victory', 'Emmanuel', 'Priscilla', 'Kelechi', 'Abubakar', 'Fatima', 'Ibrahim', 'Chidi', 'Nneka', 'Tunde', 'Amaka', 'Zainab', 'Musa', 'Oluchi', 'Ifeanyi', 'Olamide', 'Bisi'];
const lastInitials = ['A.', 'J.', 'O.', 'B.', 'K.', 'T.', 'E.', 'W.', 'S.', 'M.', 'N.', 'U.', 'Y.', 'Z.', 'C.', 'D.', 'F.', 'G.', 'L.', 'H.'];

const activityTypes = [
  { action: 'withdrawn', icon: '💰', color: 'text-emerald-400', prefix: '₦', badge: 'PAID' },
  { action: 'earned', icon: '📈', color: 'text-cyan-400', prefix: '₦', badge: 'EARNED' },
  { action: 'registered', icon: '🚀', color: 'text-pink-400', amount: 'New Node Active', badge: 'NEW' },
  { action: 'won spin', icon: '🎡', color: 'text-purple-400', prefix: '₦', badge: 'WIN' },
  { action: 'hit jackpot', icon: '💎', color: 'text-amber-400', prefix: '₦', badge: 'JACKPOT' },
  { action: 'earned 5×', icon: '🔥', color: 'text-orange-500', prefix: '₦', badge: '5×WIN' },
  { action: 'completed task', icon: '🏆', color: 'text-blue-400', prefix: '₦', badge: 'EARNED' },
];

export default function ActivityPopups() {
  const [activity, setActivity] = useState<any>(null);
  const [visible, setVisible] = useState(false);

  const generateRandomActivity = () => {
    const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lInit = lastInitials[Math.floor(Math.random() * lastInitials.length)];
    const type = activityTypes[Math.floor(Math.random() * activityTypes.length)];
    
    let amountStr = type.amount;
    if (!amountStr && type.prefix) {
      const amount = Math.floor(Math.random() * 25000) + 500;
      amountStr = `${type.prefix}${amount.toLocaleString()}`;
    }

    return {
      name: `${fName} ${lInit}`,
      action: type.action,
      amount: amountStr,
      emoji: type.icon,
      color: type.color,
      badge: type.badge
    };
  };

  useEffect(() => {
    // frequent constant rotation every 3-5 seconds
    const interval = setInterval(() => {
      setActivity(generateRandomActivity());
      setVisible(true);
      
      setTimeout(() => {
        setVisible(false);
      }, 3000);
    }, 4500);

    // Initial delay for the first one
    const initialTimeout = setTimeout(() => {
      setActivity(generateRandomActivity());
      setVisible(true);
      setTimeout(() => setVisible(false), 3000);
    }, 1500);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimeout);
    };
  }, []);

  if (!activity) return null;

  return (
    <div className="fixed bottom-24 left-4 md:left-8 z-50 pointer-events-none">
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, x: -50, scale: 0.9, rotateY: -15, filter: 'blur(10px)' }}
            animate={{ opacity: 1, x: 0, scale: 1, rotateY: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.8, x: -20, filter: 'blur(10px)' }}
            transition={{ type: "spring", damping: 15, stiffness: 100 }}
            className="relative bg-black/60 backdrop-blur-2xl border border-white/10 p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-4 min-w-[300px] overflow-hidden"
          >
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-none" />
            
            <div className="relative flex-shrink-0">
              <div className="text-3xl filter drop-shadow-[0_0_10px_rgba(255,255,255,0.4)] animate-bounce-subtle">
                {activity.emoji}
              </div>
            </div>
            
            <div className="relative flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[9px] px-2 py-0.5 rounded-full border border-current font-black tracking-tighter ${activity.color} bg-black/40`}>
                  {activity.badge}
                </span>
                <div className="h-1 w-1 bg-white/20 rounded-full" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-white/30">Network Node</span>
              </div>
              <p className="text-white/80 font-medium text-xs leading-tight">
                <span className="text-white font-bold">{activity.name}</span>
                <span className="mx-1 lowercase">just {activity.action}</span>
              </p>
              <p className={`text-xl font-black tracking-tighter ${activity.color} font-display leading-none mt-1`}>
                {activity.amount}
              </p>
            </div>

            {/* Sweep light effect */}
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
