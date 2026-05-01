import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, ArrowRight, Zap, Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, username);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Visual Side */}
      <div className="hidden lg:flex relative bg-slate-950 items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.1),transparent_50%)]" />
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        <div className="relative z-10 p-12 text-center space-y-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-32 h-32 bg-cyan-500/10 rounded-[3rem] border border-cyan-500/20 flex items-center justify-center mx-auto shadow-2xl shadow-cyan-500/20"
          >
            <Zap size={64} className="text-cyan-400 fill-cyan-400" />
          </motion.div>
          <div className="space-y-4">
            <h1 className="text-5xl font-display font-black text-white leading-tight uppercase italic tracking-tighter">
              The Protocol <br />
              <span className="text-cyan-400">Reborn</span>
            </h1>
            <p className="text-white/40 text-sm font-medium tracking-widest uppercase">
              Establish your credentials and enter the yield matrix.
            </p>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex items-center justify-center p-8 bg-slate-900">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-12"
        >
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-display font-black text-white italic uppercase tracking-tighter">
              {isLogin ? 'Node Activation' : 'Register Genetic sequence'}
            </h2>
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => setIsLogin(true)}
                className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-all ${isLogin ? 'bg-cyan-500 text-white shadow-xl shadow-cyan-500/20' : 'text-white/20 hover:text-white'}`}
              >
                Sign In
              </button>
              <button 
                onClick={() => setIsLogin(false)}
                className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-all ${!isLogin ? 'bg-cyan-500 text-white shadow-xl shadow-cyan-500/20' : 'text-white/20 hover:text-white'}`}
              >
                Sign Up
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] ml-2">Username</label>
                  <div className="relative group">
                    <User size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-cyan-400 transition-colors" />
                    <input 
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Your Protocol Name"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-8 focus:outline-none focus:border-cyan-500 transition-all font-medium text-white placeholder:text-white/10"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] ml-2">Email Address</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-cyan-400 transition-colors" />
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-8 focus:outline-none focus:border-cyan-500 transition-all font-medium text-white placeholder:text-white/10"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] ml-2">Secure Cipher</label>
              <div className="relative group">
                <Lock size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-cyan-400 transition-colors" />
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-8 focus:outline-none focus:border-cyan-500 transition-all font-medium text-white placeholder:text-white/10"
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 p-4 bg-pink-500/10 border border-pink-500/20 rounded-xl"
              >
                <AlertCircle size={18} className="text-pink-500 shrink-0" />
                <p className="text-xs font-bold text-pink-500">{error}</p>
              </motion.div>
            )}

            <button 
              disabled={loading}
              className="w-full btn-primary py-6 text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl shadow-cyan-500/30 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? 'Processing...' : isLogin ? 'Authenticate Node' : 'Initialize Sequence'}
            </button>
          </form>

          <div className="flex items-center gap-4 text-white/10 uppercase font-black text-[10px] tracking-widest">
            <Shield size={14} className="text-cyan-400" />
            End-to-End Quantum Encryption Active
          </div>
        </motion.div>
      </div>
    </div>
  );
}
