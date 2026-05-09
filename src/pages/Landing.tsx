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
      <section className="max-w-7xl mx-auto px-6 pt-12 pb-48 relative">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10"
        >
          <div className="title-wrapper mb-20">
            <h1 className="text-[12vw] md:text-[18vw] font-display font-black leading-[0.75] tracking-[-0.04em] uppercase text-ink dark:text-white transition-colors duration-500">
              PROTOCOL <br />
              <div className="flex items-center gap-4">
                <span>NEXORA</span>
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="w-[10vw] h-[10vw] md:w-[15vw] md:h-[15vw] rounded-full border-[1.5vw] border-yellow-400 border-dashed"
                />
              </div>
            </h1>
          </div>

          <div className="grid lg:grid-cols-2 gap-24 items-end">
            <div className="space-y-12">
              <p className="text-2xl md:text-3xl text-ink/60 dark:text-white/40 leading-tight font-medium max-w-xl">
                The world's most advanced synthetic earning engine. Deploy nodes, verification tasks, and unlock high-yield curricula.
              </p>
              
              <div className="flex flex-wrap gap-8">
                <button 
                  onClick={handleSignIn}
                  className="px-12 py-6 bg-ink dark:bg-white text-white dark:text-ink font-black text-xl tracking-tighter hover:bg-yellow-400 dark:hover:bg-yellow-400 hover:text-ink transition-all duration-300 uppercase skew-x-[-10deg]"
                >
                  <span className="skew-x-[10deg] block flex items-center gap-4">
                    INITIALIZE <ArrowRight />
                  </span>
                </button>
                
                <div className="flex flex-col justify-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-yellow-500 mb-2">NETWORK STATUS</span>
                  <div className="flex items-center gap-3">
                    <span className="flex h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-mono font-bold uppercase tracking-widest text-ink/40 dark:text-white/40">OPERATIONAL // NODE v2.4</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative border-l-4 border-yellow-400 pl-12 hidden lg:block">
              <div className="space-y-8">
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-ink/30 dark:text-white/20">TOTAL FLOW</span>
                  <p className="text-6xl font-display font-black italic tracking-tighter">₦8.2B+</p>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-ink/30 dark:text-white/20">ACTIVE OPERATORS</span>
                  <p className="text-6xl font-display font-black italic tracking-tighter">1.2M</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Marquee Section */}
      <div className="py-20 border-y-4 border-ink dark:border-white bg-yellow-400 overflow-hidden relative z-20">
        <motion.div 
          animate={{ x: [0, -2000] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="flex whitespace-nowrap gap-12 items-center"
        >
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex gap-12 items-center">
              <span className="text-7xl font-display font-black tracking-[-0.05em] uppercase text-ink italic">EARN 5× FASTER // PROTOCOL NEXORA // SYSTEM ONLINE // VERIFIED YIELD</span>
              <div className="w-12 h-12 rounded-full bg-ink" />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-48 relative">
        <div className="grid lg:grid-cols-3 gap-0 border-4 border-ink dark:border-white">
          {[
            { id: '01', icon: BookOpen, title: "EDTECH NODES", desc: "Unlock premium curricula. Complete verification cycles to release locked yields. Knowledge is capitalization.", color: "bg-ink dark:bg-white" },
            { id: '02', icon: CheckSquare, title: "TASK VESTING", desc: "Monetize micro-interactions. Solve high-priority network tasks and sponsored social operations.", color: "bg-yellow-400" },
            { id: '03', icon: Users, title: "HIVE NETWORK", desc: "Recursive referral topology. Build multi-tier clusters and earn permanent protocol percentages.", color: "bg-cyan-400" },
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className={`p-12 flex flex-col gap-12 border-ink dark:border-white ${i < 2 ? 'lg:border-r-4' : ''} ${i < 2 ? 'border-b-4 lg:border-b-0' : ''} group hover:bg-yellow-500 transition-colors duration-500`}
            >
              <div className="flex justify-between items-start">
                <span className="text-4xl font-display font-black opacity-20 group-hover:opacity-100 transition-opacity">{feature.id}</span>
                <div className="w-16 h-16 bg-white dark:bg-ink flex items-center justify-center border-4 border-ink dark:border-white group-hover:rotate-12 transition-transform">
                  <feature.icon className="text-ink dark:text-white" size={32} />
                </div>
              </div>
              
              <div className="space-y-6">
                <h3 className="text-4xl font-display font-black tracking-tight uppercase leading-none">{feature.title}</h3>
                <p className="text-lg font-medium leading-tight opacity-60 group-hover:opacity-100 transition-opacity italic">{feature.desc}</p>
              </div>
              
              <div className="mt-auto pt-10 border-t-2 border-ink/10 dark:border-white/10 flex items-center gap-4">
                <span className="text-[10px] font-mono font-black uppercase tracking-widest">ENCRYPTION: AES-256</span>
                <div className="flex-1 h-px bg-ink/10 dark:white/10" />
                <ArrowRight className="opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trust / Stats Block */}
      <section className="py-24 bg-ink text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
          {[
            { label: "NETWORK UPTIME", value: "99.98%", sub: "REAL-TIME" },
            { label: "AVG DAILY PAYOUT", value: "₦142M", sub: "SETTLED" },
            { label: "NODE LATENCY", value: "0.2ms", sub: "QUANTUM" },
            { label: "SECURE VAULTS", value: "4.2M", sub: "ENCRYPTED" }
          ].map((stat, i) => (
            <div key={i} className="space-y-4 border-l-2 border-white/20 pl-8">
              <span className="text-[10px] font-mono font-black tracking-[0.4em] opacity-40">{stat.label}</span>
              <p className="text-5xl font-display font-black italic">{stat.value}</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-400" />
                <span className="text-[8px] font-mono font-black tracking-widest opacity-20">{stat.sub}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
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
