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

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userData, signOut } = useAuth();
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

  if (userData?.isAdmin || userData?.email === 'denacchy@gmail.com') {
    navItems.push({ name: 'Admin', icon: ShieldAlert, path: '/admin' });
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile Nav */}
      <div className="md:hidden glass sticky top-0 z-50 px-4 py-3 flex justify-between items-center">
        <Link to="/dashboard" className="flex items-center gap-2">
          <Zap className="text-cyan-500 fill-cyan-500" />
          <span className="font-display font-bold text-xl tracking-tight">NEXORA</span>
        </Link>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ x: isMenuOpen ? 0 : -300 }}
        className={`fixed md:relative md:translate-x-0 z-40 w-64 h-full bg-white/5 backdrop-blur-2xl border-r border-white/10 flex flex-col p-6 transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="hidden md:flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Zap className="w-6 h-6 text-white fill-white" />
          </div>
          <span className="font-display font-bold text-2xl tracking-tighter">NEXORA</span>
        </div>

        <nav className="flex-1 space-y-3">
          {navItems.map((item) => (
            <Link 
              key={item.name}
              to={item.path}
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                location.pathname === item.path 
                  ? 'nav-link-active' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {location.pathname === item.path && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>}
              <item.icon size={18} className={location.pathname === item.path ? 'text-cyan-400' : ''} />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-8 p-5 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-xl mb-8">
          <p className="text-[10px] opacity-80 uppercase font-bold mb-1">Nexora Pro</p>
          <p className="text-xs mb-3 font-semibold text-white">Earn 2x more per task today!</p>
          <button className="w-full py-2 bg-white text-blue-600 text-[10px] font-bold rounded-lg shadow-sm">Upgrade Now</button>
        </div>

        <div className="mt-auto space-y-4 pt-6 border-t border-white/10">
          <div className="flex items-center gap-3 px-2">
            <img 
              src={userData?.photoURL || `https://ui-avatars.com/api/?name=${userData?.displayName}&background=random`} 
              alt="Profile" 
              className="w-10 h-10 rounded-full border-2 border-cyan-400/30 p-0.5"
              referrerPolicy="no-referrer"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{userData?.displayName || 'User'}</p>
              <p className="text-[10px] text-white/40 truncate">{userData?.email}</p>
            </div>
          </div>
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-white/40 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all"
          >
            <LogOut size={18} />
            <span className="font-medium text-sm">Sign Out</span>
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
            className="w-16 h-16 rounded-[2rem] bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-white shadow-2xl shadow-cyan-500/40 border-4 border-white/10 animate-float"
          >
            <Zap size={24} className="fill-white" />
          </motion.button>
        </div>
      </main>
    </div>
  );
};

export default Layout;
