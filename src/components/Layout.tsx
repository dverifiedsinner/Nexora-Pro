import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  BookOpen, 
  CheckSquare, 
  Wallet, 
  Users, 
  Gamepad2, 
  UserCircle,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ActivityPopups from './ActivityPopups';
import ThemeToggle from './ThemeToggle';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userData, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Courses', icon: BookOpen, path: '/courses' },
    { name: 'Tasks', icon: CheckSquare, path: '/tasks' },
    { name: 'Wallet', icon: Wallet, path: '/wallet' },
    { name: 'Referrals', icon: Users, path: '/referrals' },
    { name: 'Games', icon: Gamepad2, path: '/games' },
    { name: 'Profile', icon: UserCircle, path: '/profile' },
  ];

  if (userData?.isAdmin || user?.email === 'denacchy@gmail.com') {
    navItems.push({ name: 'Command Center', icon: ShieldAlert, path: '/admin' });
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row text-slate-900 dark:text-white selection:bg-yellow-500/30 transition-colors duration-500">
      {/* Mobile/Tablet Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-2 bg-gradient-to-t from-white dark:from-[#020617] via-white/95 dark:via-[#020617]/95 to-transparent">
        <div className="glass shadow-2xl shadow-yellow-500/10 rounded-3xl p-2 flex justify-between items-center">
          {navItems.slice(0, 5).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex flex-col items-center gap-1.5 px-3 py-2 rounded-2xl transition-all relative ${
                  isActive ? 'text-yellow-500' : 'text-slate-400 dark:text-white/30'
                }`}
              >
                <item.icon size={18} className={isActive ? 'animate-pulse text-yellow-500' : ''} />
                <span className="text-[8px] font-black uppercase tracking-[0.1em]">{item.name}</span>
                {isActive && (
                  <motion.div 
                    layoutId="mobile-active-nav"
                    className="absolute -bottom-1 w-1 h-1 bg-yellow-500 rounded-full"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile Top Nav (Hidden on LG) */}
      <div className="lg:hidden sticky top-0 z-50 px-6 py-4 flex justify-between items-center glass border-b border-white/5">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/20">
            <Zap className="w-5 h-5 text-slate-950 fill-slate-950" />
          </div>
          <span className="font-display font-black text-xl tracking-tighter italic">NEXORA.</span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-yellow-500 active:scale-95 transition-all"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ x: isMenuOpen ? 0 : -300 }}
        className={`fixed lg:relative top-0 left-0 z-40 w-72 h-[100dvh] lg:h-screen bg-white/90 dark:bg-[#0a192f] lg:bg-white/5 backdrop-blur-3xl border-r border-white/5 flex flex-col p-6 lg:p-10 transition-all duration-300 ease-in-out lg:translate-x-0 ${isMenuOpen ? 'translate-x-0 shadow-[0_0_100px_rgba(0,0,0,0.8)]' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="hidden lg:flex items-center justify-between mb-10 lg:mb-16 px-2">
          <Link to="/dashboard" className="flex items-center gap-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-[1.25rem] bg-gradient-to-tr from-yellow-400 to-yellow-600 flex items-center justify-center shadow-2xl shadow-yellow-500/30 shrink-0">
              <Zap className="w-6 h-6 lg:w-7 lg:h-7 text-slate-950 fill-slate-950" />
            </div>
            <span className="font-display font-black text-2xl lg:text-3xl tracking-tighter italic lg:block truncate">NEXORA.</span>
          </Link>
          <ThemeToggle />
        </div>

        <nav className="flex-1 space-y-3 lg:space-y-4 pr-1 -mr-1 overflow-y-auto scrollbar-hide py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.name}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-4 px-4 lg:px-6 py-3 lg:py-4 rounded-xl lg:rounded-[1.25rem] transition-all group relative overflow-hidden lg:justify-start ${
                  isActive 
                    ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 shadow-[0_0_20px_rgba(250,204,21,0.1)]' 
                    : 'text-slate-400 dark:text-white/30 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 border border-transparent'
                }`}
                title={item.name}
              >
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active-glow"
                    className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-transparent pointer-events-none"
                  />
                )}
                <div className={`relative z-10 transition-all duration-500 shrink-0 ${isActive ? 'scale-110 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]' : 'group-hover:scale-110 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                  <item.icon size={20} className={isActive ? 'text-yellow-500' : 'text-slate-400 dark:text-white/30 group-hover:text-slate-900 dark:group-hover:text-white'} />
                </div>
                <span className="relative z-10 font-bold text-[10px] lg:block uppercase tracking-[0.2em] leading-none truncate">{item.name}</span>
                
                {isActive && (
                  <motion.div 
                    layoutId="active-indicator"
                    className="absolute left-0 w-1 h-6 lg:h-8 bg-yellow-500 rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 lg:block p-5 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-xl mb-8">
          <p className="text-[10px] text-slate-950 opacity-80 uppercase font-black mb-1">Nexora Pro</p>
          <p className="text-xs mb-3 font-semibold text-slate-950">Earn 2x more per task today!</p>
          <button className="w-full py-2 bg-slate-950 text-yellow-400 text-[10px] font-black rounded-lg shadow-sm">Upgrade Now</button>
        </div>

        <div className="mt-auto space-y-4 pt-6 border-t border-white/10">
          <div className="flex items-center gap-3 px-2 lg:justify-start">
            <img 
              src={userData?.photoURL || `https://ui-avatars.com/api/?name=${userData?.displayName}&background=020617&color=facc15`} 
              alt="Profile" 
              className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border-2 border-yellow-400/30 p-0.5 shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="overflow-hidden lg:block">
              <p className="text-xs lg:text-sm font-semibold truncate">{userData?.displayName || 'User'}</p>
              <p className="text-[9px] lg:text-[10px] text-white/40 truncate">{userData?.email}</p>
            </div>
          </div>
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-white/40 hover:text-pink-500 hover:bg-pink-500/5 rounded-xl transition-all lg:justify-start"
            title="Sign Out"
          >
            <LogOut size={18} className="shrink-0" />
            <span className="font-medium text-sm lg:block">Sign Out</span>
          </button>
        </div>
      </motion.aside>

      {/* Backdrop for mobile */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-10 relative">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
        <ActivityPopups />
        
        {/* Floating Support Icon */}
        <div className="fixed bottom-8 right-8 z-50 pointer-events-auto">
          <motion.button
            whileHover={{ scale: 1.1, rotate: 12 }}
            whileTap={{ scale: 0.9 }}
            className="w-16 h-16 rounded-[2rem] bg-gradient-to-tr from-yellow-400 to-yellow-600 flex items-center justify-center text-slate-950 shadow-2xl shadow-yellow-500/40 border-4 border-white/10 animate-float"
          >
            <Zap size={24} className="fill-slate-950" />
          </motion.button>
        </div>
      </main>
    </div>
  );
};

export default Layout;
