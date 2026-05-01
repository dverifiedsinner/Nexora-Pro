import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, Users, Wallet, Zap, Award } from 'lucide-react';

const activities = [
  { name: 'Emeka A.', action: 'withdrawn', amount: '₦12,500', icon: Wallet, color: 'text-emerald-400' },
  { name: 'Sarah J.', action: 'earned', amount: '₦5,000', icon: TrendingUp, color: 'text-cyan-400' },
  { name: 'David O.', action: 'registered', amount: 'New User', icon: Users, color: 'text-pink-400' },
  { name: 'Chioma B.', action: 'earned', amount: '₦1,200', icon: Award, color: 'text-amber-400' },
  { name: 'Samuel K.', action: 'won', amount: '₦2,500', icon: Zap, color: 'text-blue-400' },
  { name: 'Grace T.', action: 'withdrawn', amount: '₦8,000', icon: Wallet, color: 'text-emerald-400' },
  { name: 'Blessing E.', action: 'earned', amount: '₦3,400', icon: TrendingUp, color: 'text-cyan-400' },
];

export default function ActivityPopups() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show popup every 8 seconds, keep visible for 4 seconds
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % activities.length);
      setVisible(true);
      
      setTimeout(() => {
        setVisible(false);
      }, 4000);
    }, 8000);

    // Initial delay
    setTimeout(() => setVisible(true), 2000);
    setTimeout(() => setVisible(false), 6000);

    return () => clearInterval(interval);
  }, []);

  const activity = activities[currentIdx];

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
