import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, Users, Wallet, Zap, Award } from 'lucide-react';

const firstNames = ['Emeka', 'Sarah', 'David', 'Chioma', 'Samuel', 'Grace', 'Blessing', 'John', 'Alice', 'Michael', 'Esther', 'Peter', 'Joy', 'Victory', 'Emmanuel', 'Priscilla', 'Kelechi', 'Abubakar', 'Fatima', 'Ibrahim', 'Chidi', 'Nneka', 'Tunde', 'Amaka', 'Zainab', 'Musa', 'Oluchi', 'Ifeanyi', 'Olamide', 'Bisi'];
const lastInitials = ['A.', 'J.', 'O.', 'B.', 'K.', 'T.', 'E.', 'W.', 'S.', 'M.', 'N.', 'U.', 'Y.', 'Z.', 'C.', 'D.', 'F.', 'G.', 'L.', 'H.'];

const activityTypes = [
  { action: 'withdrawn', icon: Wallet, color: 'text-emerald-400', prefix: '₦' },
  { action: 'earned', icon: TrendingUp, color: 'text-cyan-400', prefix: '₦' },
  { action: 'registered', icon: Users, color: 'text-pink-400', amount: 'New User' },
  { action: 'won', icon: Zap, color: 'text-blue-400', prefix: '₦' },
  { action: 'completed a task', icon: Award, color: 'text-amber-400', prefix: '₦' },
  { action: 'purchased a course', icon: Zap, color: 'text-blue-400', amount: 'Knowledge Node' },
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
      icon: type.icon,
      color: type.color
    };
  };

  useEffect(() => {
    // Show popup every 12 seconds, keep visible for 5 seconds
    const interval = setInterval(() => {
      setActivity(generateRandomActivity());
      setVisible(true);
      
      setTimeout(() => {
        setVisible(false);
      }, 5000);
    }, 12000);

    // Initial delay for the first one
    const initialTimeout = setTimeout(() => {
      setActivity(generateRandomActivity());
      setVisible(true);
      setTimeout(() => setVisible(false), 5000);
    }, 3000);

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
            initial={{ opacity: 0, x: -50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            className="glass-card p-4 border-white/10 bg-black/60 backdrop-blur-xl shadow-2xl flex items-center gap-4 min-w-[240px]"
          >
            <div className={`p-2.5 rounded-xl bg-white/5 ${activity.color}`}>
              <activity.icon size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-white/90">
                <span className="text-cyan-400">{activity.name}</span> just {activity.action}
              </p>
              <p className="text-sm font-black tracking-tight text-white">
                {activity.amount}
              </p>
            </div>
            <div className="absolute top-1 right-1">
              <div className="w-1 h-1 bg-cyan-400 rounded-full animate-ping"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
