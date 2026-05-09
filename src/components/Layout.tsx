import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  Zap,
  Phone,
  Database,
  Megaphone,
  Home
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ActivityPopups from './ActivityPopups';
import ThemeToggle from './ThemeToggle';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userData, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const bottomNavItems = [
    { name: 'Airtime', icon: Phone, path: '/airtime' },
    { name: 'Data', icon: Database, path: '/data' },
    { name: 'Home', icon: Home, path: '/dashboard', center: true },
    { name: 'Ads', icon: Megaphone, path: '/tasks' },
    { name: 'Profile', icon: UserCircle, path: '/profile' },
  ];

  const sidebarNavItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Courses', icon: BookOpen, path: '/courses' },
    { name: 'Tasks', icon: CheckSquare, path: '/tasks' },
    { name: 'Wallet', icon: Wallet, path: '/wallet' },
    { name: 'Referrals', icon: Users, path: '/referrals' },
    { name: 'Games', icon: Gamepad2, path: '/games' },
    { name: 'Profile', icon: UserCircle, path: '/profile' },
  ];

  if (userData?.isAdmin || user?.email === 'denacchy@gmail.com') {
    sidebarNavItems.push({ name: 'Command Center', icon: ShieldAlert, path: '/admin' });
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col md:flex-row h-screen overflow-hidden">
      {/* Mobile/Tablet Bottom Navigation */}
      <div className="lg:hidden fixed bottom-6 left-6 right-6 z-50">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 h-20 rounded-[2.5rem] flex items-center justify-around px-4 shadow-2xl">
          {bottomNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            if (item.center) {
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className="relative -top-8"
                >
                  <div className={`w-16 h-16 rounded-full bg-slate-950 dark:bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/20 active:scale-90 transition-all ${isActive ? 'ring-4 ring-white dark:ring-slate-950' : ''}`}>
                    <item.icon size={28} />
                  </div>
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase text-slate-400">
                    {item.name}
                  </span>
                </Link>
              );
            }
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex flex-col items-center gap-1 transition-all capitalize ${
                  isActive ? 'text-indigo-600' : 'text-slate-400'
                }`}
              >
                <item.icon size={22} />
                <span className="text-[10px] font-bold">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Sidebar (Tablet/Desktop) */}
      <aside className="hidden lg:flex w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col py-10 px-6 shrink-0 h-full">
        <Link to="/dashboard" className="flex items-center gap-3 px-4 mb-12">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black italic">E</div>
          <span className="text-2xl font-black tracking-tighter text-indigo-600">EARNPAL</span>
        </Link>

        <nav className="flex-1 space-y-2">
          {sidebarNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                    : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <item.icon size={22} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-slate-100 dark:border-slate-800 pt-8 space-y-6">
          <div className="flex items-center gap-4 px-4 group cursor-pointer" onClick={() => navigate('/profile')}>
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-100 dark:border-slate-700">
              <img 
                src={userData?.photoURL || `https://ui-avatars.com/api/?name=${userData?.displayName}&background=random`} 
                alt="" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="font-bold truncate">{userData?.displayName || 'User'}</span>
              <span className="text-[10px] text-slate-400 truncate uppercase font-bold tracking-widest">{userData?.isAdmin ? 'Admin' : 'Member'}</span>
            </div>
          </div>
          <button 
            onClick={handleSignOut}
            className="w-full py-4 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative w-full h-full">
        <div className="max-w-6xl mx-auto h-full">
          {children}
        </div>
        <ActivityPopups />
      </main>
    </div>
  );
};

export default Layout;
