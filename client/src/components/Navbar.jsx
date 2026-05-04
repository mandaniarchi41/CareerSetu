import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { GraduationCap, LogOut, Sun, Moon, Bell, Search } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between sticky top-0 z-50 transition-colors">
      <div className="flex items-center gap-8">
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <GraduationCap className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            LearnPath AI
          </span>
        </Link>

        <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl gap-2 w-80">
          <Search className="w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search courses, skills..." 
            className="bg-transparent border-none outline-none text-sm w-full text-slate-600 dark:text-slate-300"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <button className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
        </button>

        <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2"></div>

        {user ? (
          <div className="flex items-center gap-3 cursor-pointer p-1 pr-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{user.name}</p>
              <button onClick={handleLogout} className="text-[10px] text-red-500 font-bold uppercase tracking-wider hover:underline">Logout</button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Login</Link>
            <Link to="/signup" className="text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors shadow-lg shadow-blue-500/20">Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
