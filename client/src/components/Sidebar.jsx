import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserCircle, 
  Map, 
  MessageSquare, 
  BarChart3, 
  Calendar, 
  Settings,
  GraduationCap,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Profile Analyzer', path: '/upload', icon: UserCircle },
    { name: 'Learning Path', path: '/path', icon: Map },
    { name: 'AI Mentor', path: '/mentor', icon: MessageSquare },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Study Planner', path: '/planner', icon: Calendar },
  ];

  if (user && user.role === 'admin') {
    navItems.push({ name: 'Admin', path: '/admin', icon: ShieldCheck });
  }

  return (
    <aside className="w-64 min-h-[calc(100vh-64px)] bg-[#0B0D19] border-r border-white/5 p-4 sticky top-16 hidden lg:block">
      <div className="space-y-1.5 mt-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm tracking-tight font-medium ${
                isActive 
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`
            }
          >
            <item.icon className="w-4 h-4" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </div>

      <div className="absolute bottom-8 left-4 right-4">
        <div className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border border-indigo-500/20 p-4 rounded-xl text-white shadow-lg">
          <GraduationCap className="w-6 h-6 mb-3 text-indigo-400" />
          <h4 className="font-semibold text-sm tracking-tight mb-1">Pro Plan</h4>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">Unlock advanced AI mentorship & analytics.</p>
          <button className="w-full bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 py-2 rounded-lg text-xs font-semibold transition-colors tracking-wide">
            Upgrade Now
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
