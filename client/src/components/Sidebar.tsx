import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, User, History, Library, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar: React.FC = () => {
  const { logout } = useAuth();

  const navItems = [
    { name: 'Profile', path: '/profile', icon: <User size={20} /> },
    { name: 'History', path: '/history', icon: <History size={20} /> },
    { name: 'Library', path: '/library', icon: <Library size={20} /> },
  ];

  return (
    <aside className="w-64 min-h-screen bg-neutral-900 border-r border-neutral-800 flex flex-col items-start p-6 text-white sticky top-0">
      <div className="mb-10 w-full flex items-center justify-start gap-3">
        <img src="/logo.png" alt="AI Moodify Logo" className="w-10 h-10 object-contain" />
        <h1 className="text-2xl font-extrabold text-white">AI Moodify</h1>
      </div>
      
      <nav className="flex-1 w-full space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-white text-black font-semibold shadow-md' 
                  : 'text-neutral-400 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-8 pt-6 border-t border-neutral-800 w-full">
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
