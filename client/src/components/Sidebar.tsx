import React from 'react';
import { NavLink } from 'react-router-dom';
import { User, History, Library, LogOut, Music2, Disc3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  {
    name: 'Profile',
    path: '/profile',
    icon: <User size={18} />,
    gradient: 'from-violet-500 to-purple-600',
    glow: 'rgba(139,92,246,0.4)',
  },
  {
    name: 'History',
    path: '/history',
    icon: <History size={18} />,
    gradient: 'from-pink-500 to-rose-600',
    glow: 'rgba(236,72,153,0.4)',
  },
  {
    name: 'Library',
    path: '/library',
    icon: <Library size={18} />,
    gradient: 'from-cyan-500 to-blue-600',
    glow: 'rgba(6,182,212,0.4)',
  },
];

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const displayName = user?.name || (user?.email ? user.email.split('@')[0] : '');
  const initial = displayName ? displayName.charAt(0).toUpperCase() : 'U';

  return (
    <aside className="w-64 min-h-screen flex flex-col sticky top-0 border-r border-white/[0.06]"
      style={{ background: 'linear-gradient(180deg, #0a0a0f 0%, #050508 100%)' }}>

      {/* Logo */}
      <div className="px-6 pt-8 pb-6 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <Music2 size={18} className="text-white" />
        </div>
        <span className="text-lg font-black tracking-tight text-white">AI Moodify</span>
      </div>

      {/* Divider */}
      <div className="mx-6 mb-6 h-px bg-white/[0.06]" />

      {/* Nav label */}
      <p className="px-6 mb-3 text-[10px] font-bold tracking-[0.2em] text-neutral-600 uppercase">Navigation</p>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
                isActive
                  ? 'text-white'
                  : 'text-neutral-500 hover:text-neutral-200 hover:bg-white/[0.04]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${item.gradient} opacity-15`}
                  />
                )}
                <div
                  className={`relative z-10 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? `bg-gradient-to-br ${item.gradient} shadow-lg`
                      : 'bg-white/[0.05] group-hover:bg-white/[0.08]'
                  }`}
                  style={isActive ? { boxShadow: `0 4px 15px ${item.glow}` } : {}}
                >
                  {item.icon}
                </div>
                <span className="relative z-10 font-semibold text-sm">{item.name}</span>
                {isActive && (
                  <div className={`absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-gradient-to-br ${item.gradient}`} />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom user card */}
      <div className="px-3 pb-6 pt-4 border-t border-white/[0.06] mt-4">
        {/* User info pill */}
        <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-sm font-semibold truncate">{displayName}</p>
            <p className="text-neutral-600 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        {/* Logout */}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-neutral-600 hover:text-red-400 hover:bg-red-500/[0.08] transition-all duration-200 text-sm font-medium"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
