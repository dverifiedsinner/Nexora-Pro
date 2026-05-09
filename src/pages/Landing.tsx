import React from 'react';
import { motion } from 'motion/react';
import { Zap, ArrowRight, Shield, TrendingUp, Gift, Smartphone, BookOpen, CheckSquare, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Landing() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate('/auth');
  };

  React.useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  return (
    <div className="min-h-screen text-slate-900 dark:text-white overflow-hidden selection:bg-yellow-500/30 transition-colors duration-500">
      {/* Background Orbs & Cinematic Space */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10 bg-white dark:bg-[#020617]">
        <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,#64748b_0%,transparent_70%)] dark:bg-[radial-gradient(circle_at_center,#1e293b_0%,transparent_70%)] opacity-20 transition-all duration-1000"></div>
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] right-[10%] w-[600px] h-[600px] bg-yellow-400/10 dark:bg-yellow-600/5 blur-[150px] rounded-full" 
        />
        <motion.div 
          animate={{ x: [0, -40, 0], y: [0, 40, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[20%] left-[10%] w-[500px] h-[500px] bg-blue-400/20 dark:bg-blue-600/10 blur-[150px] rounded-full" 
        />
        {/* Star Field Simulation */}
        <div className="absolute inset-0 opacity-[0.05] dark:opacity-30" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '100px 100px' }}></div>
      </div>

      {/* Nav */}
      <nav className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center relative z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center shadow-[0_0_20px_rgba(250,204,21,0.5)]">
            <Zap className="w-6 h-6 text-slate-950 fill-slate-950" />
          </div>
          <span className="font-display font-black text-2xl tracking-tighter italic">NEXORA</span>
        </div>
        <button 
          onClick={handleSignIn}
          className="px-8 py-2.5 rounded-full glass border border-white/10 hover:bg-black/5 dark:hover:bg-white/10 transition-all font-black text-xs tracking-[0.2em] relative group overflow-hidden"
        >
          <span className="relative z-10 text-slate-900 dark:text-white">SIGN IN</span>
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-48 grid lg:grid-cols-2 gap-24 items-center relative">
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-black/[0.03] dark:bg-white/5 border border-black/5 dark:border-white/10 text-yellow-600 dark:text-yellow-400 text-[11px] font-black uppercase tracking-[0.3em] mb-10 shadow-lg"
          >
            <div className="flex gap-1.5">
              {[1, 2, 3].map(i => (
                <span key={i} className={`h-1.5 w-1.5 rounded-full bg-yellow-500 animate-pulse`} style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
            Universal Earnings Protocol v2.0
          </motion.div>
          <h1 className="text-8xl md:text-[11rem] font-display font-black leading-[0.8] tracking-tighter mb-10 italic">
            EARN <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-600 dark:from-yellow-400 dark:via-yellow-200 dark:to-white drop-shadow-[0_0_30px_rgba(250,204,21,0.3)]">5× FASTER.</span>
          </h1>
          <p className="text-slate-600 dark:text-white/40 text-xl max-w-sm mb-12 leading-relaxed font-medium">
            The world's first cinematic earning engine. Complete nodes, solve matrices, and unlock your true financial potential.
          </p>
          <div className="flex flex-wrap gap-6">
            <button 
              onClick={handleSignIn}
              className="relative group px-10 py-5 bg-yellow-400 text-slate-950 rounded-2xl font-black text-lg tracking-tighter flex items-center gap-3 overflow-hidden shadow-2xl shadow-yellow-500/40"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              EARN 5× NOW <ArrowRight className="group-hover:translate-x-2 transition-transform" />
            </button>
            <button className="px-10 py-5 rounded-2xl border-2 border-black/5 dark:border-white/10 font-black text-lg tracking-tighter hover:bg-black/[0.02] dark:hover:bg-white/5 transition-all text-slate-400 dark:text-white/60 hover:text-slate-900 dark:hover:text-white">
              WATCH TRAILER
            </button>
          </div>
        </motion.div>

        <div className="relative flex justify-center items-center">
          {/* Glowing Ring */}
          <div className="absolute w-[120%] aspect-square border border-white/5 rounded-full animate-spin-slow"></div>
          <div className="absolute w-[110%] aspect-square border border-white/10 rounded-full animate-pulse"></div>

          {/* Floating Golden Coin */}
          <motion.div 
            animate={{ 
              y: [-20, 20, -20],
              rotateY: [0, 360],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative z-20"
          >
            <div className="w-64 h-64 md:w-80 md:h-80 bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-700 rounded-full shadow-[0_0_100px_rgba(245,158,11,0.5)] flex items-center justify-center border-t-4 border-amber-200/50 p-4">
              <div className="w-full h-full rounded-full border-4 border-amber-600/30 flex items-center justify-center bg-yellow-600/10">
                <Zap className="w-32 h-32 md:w-40 md:h-40 text-amber-100 fill-amber-100 drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]" />
              </div>
            </div>
            
            {/* Parallax elements */}
            <motion.div
               animate={{ x: [-10, 10, -10], y: [-10, 10, -10] }}
               transition={{ duration: 5, repeat: Infinity }}
               className="absolute top-0 -right-10 w-24 h-24 glass rounded-3xl border-white/20 flex flex-col items-center justify-center shadow-2xl backdrop-blur-3xl"
            >
              <TrendingUp className="text-yellow-400 mb-1" />
              <span className="text-[10px] font-black">+500%</span>
            </motion.div>
          </motion.div>

          {/* Floating Particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ 
                y: [0, -100, -200],
                x: [0, (i % 2 === 0 ? 50 : -50), (i % 2 === 0 ? 100 : -100)],
                opacity: [0, 1, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: 4 + Math.random() * 4,
                repeat: Infinity,
                delay: i * 0.8
              }}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full blur-[2px]"
              style={{ left: `${20 + i * 15}%`, top: '50%' }}
            />
          ))}
        </div>
      </section>

      {/* Scrolling Ticker */}
      <div className="relative z-20 py-10 bg-black/40 backdrop-blur-md border-y border-white/5 overflow-hidden">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="flex whitespace-nowrap gap-24 items-center"
        >
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex gap-12 items-center">
              <span className="text-4xl font-display font-black tracking-tighter opacity-10">THE FUTURE IS LIQUID</span>
              <Zap className="text-yellow-500 fill-yellow-500" />
              <span className="text-4xl font-display font-black tracking-tighter text-gradient">EARN 5× ON EVERY NODE</span>
              <div className="w-2 h-2 rounded-full bg-white/20" />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-32 relative">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">ENGINEERED FOR RESULTS</h2>
          <p className="text-white/40 max-w-2xl mx-auto">NEXORA provides multiple streams of income within a single, secure environment.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-10">
          {[
            { icon: BookOpen, title: "EdTech Learning", desc: "Unlock premium content and earn financial rewards for every milestone reached.", color: "from-yellow-400 to-yellow-600", accent: "text-yellow-400" },
            { icon: CheckSquare, title: "Task Economy", desc: "Monetize your attention by completing sponsored tasks and community surveys.", color: "from-blue-500 to-blue-700", accent: "text-blue-400" },
            { icon: Users, title: "The Network", desc: "Build your tribe. Earn lifelong commissions through our multi-tier referral system.", color: "from-slate-600 to-slate-800", accent: "text-slate-400" },
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
              whileHover={{ y: -15 }}
              className="relative glass-card p-12 h-full flex flex-col items-center text-center group border-white/5 hover:border-yellow-500/20 transition-all rounded-[3rem] overflow-hidden"
            >
              {/* Feature Glow */}
              <div className={`absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-20 blur-3xl transition-opacity`} />
              
              <div className={`w-20 h-20 bg-gradient-to-br ${feature.color} rounded-[2rem] flex items-center justify-center mb-10 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] border-t border-white/30 group-hover:rotate-12 transition-transform relative z-10`}>
                <feature.icon className={`${feature.color.includes('yellow') ? 'text-slate-950' : 'text-white'} drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]`} size={32} />
              </div>
              
              <h3 className="text-3xl font-display font-black mb-6 tracking-tighter group-hover:text-white transition-colors">{feature.title}</h3>
              <p className="text-white/40 font-medium leading-relaxed italic">{feature.desc}</p>
              
              {/* Bottom line accent */}
              <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trust */}
      <section className="py-48 relative">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-[10px] font-black uppercase tracking-[0.8em] text-white/20 mb-24">SECURITY CORE INFRASTRUCTURE</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-16 md:gap-24">
            {[
              { icon: Shield, label: "Neural Shield", color: "text-yellow-400" },
              { icon: Zap, label: "Instant Flux", color: "text-amber-400" },
              { icon: Users, label: "Hive Minds", color: "text-blue-400" },
              { icon: Gift, label: "Prime Rewards", color: "text-slate-400" }
            ].map((item, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center gap-8 group"
              >
                <div className="relative">
                  <div className={`absolute inset-0 blur-2xl opacity-0 group-hover:opacity-30 transition-opacity bg-yellow-500`} />
                  <div className="w-20 h-20 rounded-3xl border border-white/5 flex items-center justify-center text-white/10 group-hover:text-white group-hover:border-yellow-500/20 transition-all relative z-10 bg-white/[0.02]">
                    <item.icon size={44} strokeWidth={0.5} className={`${item.color} group-hover:scale-110 transition-transform`} />
                  </div>
                </div>
                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] group-hover:text-white transition-colors">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-20 flex flex-col md:flex-row justify-between items-center border-t border-white/5 text-white/20 text-[10px] font-bold uppercase tracking-widest">
        <div className="flex items-center gap-3 mb-8 md:mb-0">
          <Zap className="w-5 h-5 text-yellow-500" />
          <span className="text-white">NEXORA</span>
        </div>
        <p className="opacity-50 italic">© 2026 NEXORA Ecosystem. Built for the bold.</p>
        <div className="flex gap-8 mt-8 md:mt-0">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
        </div>
      </footer>
    </div>
  );
}
