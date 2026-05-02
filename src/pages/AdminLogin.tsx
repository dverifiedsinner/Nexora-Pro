import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Terminal, ShieldCheck, Zap, Lock, ArrowRight, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function AdminLogin() {
  const { user, signIn, userData } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (userData?.isAdmin || user?.email === 'denacchy@gmail.com') {
      const timer = setTimeout(() => {
        navigate('/admin');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [userData, user, navigate]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      // Wait a moment for context to update
      setTimeout(() => {
        navigate('/admin');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Access Denied: Neural handshake failed.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="text-center mb-10 space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-gradient-to-tr from-cyan-400 to-blue-600 p-0.5 shadow-2xl shadow-cyan-500/20 mb-6">
            <div className="w-full h-full rounded-[1.9rem] bg-[#050505] flex items-center justify-center">
              <ShieldCheck size={40} className="text-cyan-400" />
            </div>
          </div>
          <h1 className="text-4xl font-display font-black tracking-tighter italic uppercase text-gradient">Admin Portal.</h1>
          <p className="text-white/30 text-xs font-black uppercase tracking-[0.3em]">Nexora Intelligence Network</p>
        </div>

        <div className="glass-card p-10 md:p-12 border-white/5 bg-white/[0.02] shadow-2xl relative overflow-hidden">
          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Admin Identity (Email)</label>
                <div className="relative group">
                  <Terminal className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-cyan-400 transition-colors" size={18} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:border-cyan-500/40 transition-all font-medium text-sm"
                    placeholder="admin@nexora.io"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Universal Key (Password)</label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-cyan-400 transition-colors" size={18} />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:border-cyan-500/40 transition-all font-medium text-sm"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 bg-pink-500/10 border border-pink-500/20 rounded-xl flex items-center gap-3 text-pink-400 text-xs font-bold italic"
              >
                <AlertTriangle size={16} />
                {error}
              </motion.div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-5 text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-2xl shadow-cyan-500/30 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>Authorize Access <ArrowRight size={18} /></>
              )}
            </button>
            
            <div className="text-center">
              <button 
                type="button"
                onClick={() => navigate('/')}
                className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 hover:text-cyan-400 transition-colors"
              >
                Exit Terminal & Return to NEXORA.
              </button>
            </div>
          </form>

          {/* Decorative scanline */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent h-20 w-full animate-scanline opacity-20"></div>
        </div>

        <div className="mt-8 text-center text-[10px] font-black uppercase tracking-[0.4em] text-white/10 animate-pulse">
          Confidential System • Level 7 Clearance Required
        </div>
      </motion.div>

      {/* Floating Zap */}
      <div className="fixed bottom-10 right-10 opacity-20">
        <Zap size={100} className="text-cyan-400 animate-float" />
      </div>
    </div>
  );
}
