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
    <div className="min-h-screen text-white overflow-hidden selection:bg-cyan-500/30">
      {/* Background Orbs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] bg-cyan-600/20 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] bg-blue-600/10 blur-[100px] rounded-full"></div>
      </div>

      {/* Nav */}
      <nav className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Zap className="w-6 h-6 text-white fill-white" />
          </div>
          <span className="font-display font-bold text-2xl tracking-tighter">NEXORA</span>
        </div>
        <button 
          onClick={handleSignIn}
          className="px-6 py-2 rounded-xl glass border-cyan-500/10 hover:border-cyan-500/40 transition-all font-bold text-sm tracking-wide"
        >
          SIGN IN
        </button>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-32 grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-widest mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            Platform Live: Join the Revolution
          </div>
          <h1 className="text-7xl md:text-9xl font-display font-bold leading-[0.85] tracking-tighter mb-8 italic">
            EARN. <br />
            GROW. <br />
            <span className="text-gradient">REPEAT.</span>
          </h1>
          <p className="text-white/50 text-lg max-w-sm mb-10 leading-relaxed font-light">
            Monetize your time through completing tasks, learning new skills, and building a powerful referral network. 
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={handleSignIn}
              className="btn-primary flex items-center justify-center gap-2 text-lg px-8 group"
            >
              Get Started <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="btn-outline font-bold tracking-widest text-sm uppercase">Explore Ecosystem</button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative hidden lg:block"
        >
          <div className="relative z-10 p-2 glass-card border-white/5 shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-700 cursor-none">
            <div className="aspect-[16/10] bg-slate-900 rounded-3xl overflow-hidden relative">
              <img 
                src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=1200" 
                alt="App Preview" 
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-cyan-500/10"></div>
              
              {/* Floating UI elements */}
              <div className="absolute top-10 left-10 glass p-4 rounded-2xl border-white/10 w-48">
                 <div className="flex justify-between items-center mb-4">
                   <div className="w-8 h-8 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center">
                     <Users size={16} />
                   </div>
                   <div className="text-[10px] bg-pink-500/10 px-2 py-0.5 rounded text-pink-400 font-bold">+12%</div>
                 </div>
                 <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-1">Total Referrals</p>
                 <p className="text-xl font-display font-bold">1,284</p>
              </div>

              <div className="absolute bottom-10 right-10 glass p-4 rounded-2xl border-white/10 w-48 animate-pulse">
                 <div className="flex justify-between items-center mb-4">
                   <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                     <TrendingUp size={16} />
                   </div>
                   <div className="text-[10px] bg-cyan-500/10 px-2 py-0.5 rounded text-cyan-400 font-bold">LIVE</div>
                 </div>
                 <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-1">Wallet Earnings</p>
                 <p className="text-xl font-display font-bold">₦25,400</p>
              </div>
            </div>
          </div>
          
          {/* Background Decorative elements */}
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-cyan-500/20 blur-2xl rounded-full"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-pink-500/20 blur-3xl rounded-full"></div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-32 relative">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">ENGINEERED FOR RESULTS</h2>
          <p className="text-white/40 max-w-2xl mx-auto">NEXORA provides multiple streams of income within a single, secure environment.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: BookOpen, title: "EdTech Learning", desc: "Unlock premium content and earn financial rewards for every milestone reached.", color: "text-cyan-400" },
            { icon: CheckSquare, title: "Task Economy", desc: "Monetize your attention by completing sponsored tasks and community surveys.", color: "text-pink-400" },
            { icon: Users, title: "The Network", desc: "Build your tribe. Earn lifelong commissions through our multi-tier referral system.", color: "text-blue-400" },
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-10 h-full flex flex-col items-center text-center group active:scale-95 cursor-pointer"
            >
              <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mb-8 border border-white/5 group-hover:bg-white/10 transition-all group-hover:rotate-6">
                <feature.icon className={feature.color} size={28} />
              </div>
              <h3 className="text-2xl font-display font-bold mb-4">{feature.title}</h3>
              <p className="text-white/40 font-light leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trust */}
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-white/[0.02] -skew-y-3"></div>
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30 mb-20">CORE SECURITY INFRASTRUCTURE</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { icon: Shield, label: "Fraud Protection" },
              { icon: Zap, label: "Instant Logistics" },
              { icon: Users, label: "Elite Support" },
              { icon: Gift, label: "Bonus Multipliers" }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-6 group">
                <div className="w-12 h-12 flex items-center justify-center text-white/20 group-hover:text-cyan-400 transition-colors">
                  <item.icon size={40} strokeWidth={1} />
                </div>
                <span className="text-xs font-bold text-white/40 uppercase tracking-widest">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-20 flex flex-col md:flex-row justify-between items-center border-t border-white/5 text-white/20 text-[10px] font-bold uppercase tracking-widest">
        <div className="flex items-center gap-3 mb-8 md:mb-0">
          <Zap className="w-5 h-5 text-cyan-500" />
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
