import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Lock, ArrowRight, ArrowLeft, LineChart, BrainCircuit, BarChart, BookOpen, Mail } from 'lucide-react';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account');
    }
  };

  return (
    <div className="min-h-screen bg-[#070815] flex font-sans selection:bg-blue-500/30 text-white relative">
      
      {/* Back to Home Button */}
      <Link to="/" className="absolute top-8 left-8 z-50 flex items-center gap-2 text-slate-400 hover:text-white transition-colors group text-sm font-semibold">
        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </div>
        Back to Home
      </Link>

      {/* Left Panel - CSS Galaxy & Cards */}
      <div className="hidden lg:flex flex-col relative w-1/2 overflow-hidden border-r border-white/5 items-center justify-center bg-[#070815]">
        
        {/* Background Stars/Glows */}
        <div className="absolute top-[20%] left-[20%] w-1 h-1 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(96,165,250,1)]" />
        <div className="absolute top-[30%] right-[30%] w-1.5 h-1.5 bg-purple-400 rounded-full shadow-[0_0_15px_rgba(192,132,252,1)]" />
        <div className="absolute bottom-[40%] left-[40%] w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,1)]" />

        {/* The Atom/Orb Visual */}
        <div className="relative w-[300px] h-[300px] flex items-center justify-center mb-12">
          
          {/* Core Orb - Scaled down but vibrant */}
          <motion.div 
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute z-10 w-12 h-28 bg-gradient-to-br from-cyan-400 via-indigo-500 to-purple-700 rounded-[100%] shadow-[0_0_40px_rgba(99,102,241,0.5)] flex items-center justify-center border border-white/30"
          >
             <div className="w-2 h-16 bg-white/50 rounded-[100%] blur-[1px]" />
          </motion.div>

          {/* Subtle Rings */}
          <motion.div 
            animate={{ rotate: [-45, 315] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute w-[260px] h-[80px] border border-indigo-400/30 rounded-[100%]" style={{ borderStyle: 'dotted' }} 
          />
          <motion.div 
            animate={{ rotate: [45, 405] }}
            transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
            className="absolute w-[260px] h-[80px] border border-cyan-400/30 rounded-[100%]" style={{ borderStyle: 'dotted' }}
          />

          {/* Floating Cards mapped to the image */}
          {/* Top: Track Progress */}
          <motion.div 
            animate={{ y: [0, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}
            className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#0A0B1A] border border-emerald-500/40 px-3 py-1.5 rounded-md flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.15)] z-20"
          >
            <LineChart className="w-3 h-3 text-emerald-400" />
            <span className="text-[11px] font-bold text-emerald-400">Track Progress</span>
          </motion.div>

          {/* Right: AI Analysis */}
          <motion.div 
            animate={{ y: [0, 5, 0] }} transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
            className="absolute top-[40%] -right-4 bg-[#0A0B1A] border border-purple-500/40 px-3 py-1.5 rounded-md flex items-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.15)] z-20"
          >
            <BrainCircuit className="w-3 h-3 text-purple-400" />
            <span className="text-[11px] font-bold text-purple-400">AI Analysis</span>
          </motion.div>

          {/* Left: Skill Gap */}
          <motion.div 
            animate={{ y: [0, -5, 0] }} transition={{ duration: 4.5, repeat: Infinity, delay: 0.5 }}
            className="absolute top-[50%] -left-4 bg-[#0A0B1A] border border-pink-500/40 px-3 py-1.5 rounded-md flex items-center gap-2 shadow-[0_0_15px_rgba(236,72,153,0.15)] z-20"
          >
            <BarChart className="w-3 h-3 text-pink-400" />
            <span className="text-[11px] font-bold text-pink-400">Skill Gap</span>
          </motion.div>

          {/* Bottom: Career Path */}
          <motion.div 
            animate={{ y: [0, 5, 0] }} transition={{ duration: 5, repeat: Infinity, delay: 1.5 }}
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#0A0B1A] border border-cyan-500/40 px-3 py-1.5 rounded-md flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.15)] z-20"
          >
            <BookOpen className="w-3 h-3 text-cyan-400" />
            <span className="text-[11px] font-bold text-cyan-400">Career Path</span>
          </motion.div>
        </div>

        {/* Text Below Orb */}
        <div className="relative z-20 text-center mb-10">
          <h1 className="text-[28px] font-black text-white mb-2 tracking-tight">
            Navigate Your Career
          </h1>
          <p className="text-slate-400 text-xs max-w-[240px] mx-auto leading-relaxed font-medium">
            AI-powered pathways tailored to your goals, skills & ambitions
          </p>
        </div>

      </div>

      {/* Right Panel - Signup Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-8 sm:px-16 relative bg-[#0B0D19]">
        
        <div className="w-full max-w-[360px] relative z-10">
          
          {/* Top Tabs (Small & Centered) */}
          <div className="flex p-1 bg-[#131527] rounded-full border border-white/5 mb-14 max-w-[200px] mx-auto">
            <Link to="/login" className="flex-1 py-2 rounded-full text-slate-400 hover:text-white font-bold text-sm text-center transition-colors block text-center">
              Login
            </Link>
            <button className="flex-1 py-2 rounded-full bg-[#3B82F6] text-white font-bold text-sm shadow-[0_4px_15px_rgba(59,130,246,0.3)]">
              Sign Up
            </button>
          </div>

          <div className="mb-10 text-center sm:text-left">
            <h2 className="text-[2rem] font-black text-white mb-2 tracking-tight">Create Account</h2>
            <p className="text-slate-400 text-sm">Join the elite community of tech learners.</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm mb-6 animate-shake text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 tracking-widest uppercase ml-1">FULL NAME</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0F1123] border border-[#1E213A] rounded-xl py-3.5 pl-11 pr-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-600 text-sm"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 tracking-widest uppercase ml-1">EMAIL ADDRESS</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0F1123] border border-[#1E213A] rounded-xl py-3.5 pl-11 pr-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-600 text-sm"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 tracking-widest uppercase ml-1">PASSWORD</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0F1123] border border-[#1E213A] rounded-xl py-3.5 pl-11 pr-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-600 text-sm"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-[#6366F1] hover:bg-[#5254D8] text-white font-bold py-3.5 rounded-xl shadow-[0_4px_20px_rgba(99,102,241,0.3)] transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 group mt-6 text-sm"
            >
              Sign Up
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <p className="text-center mt-8 text-slate-500 text-sm">
            Already have an account? {' '}
            <Link to="/login" className="text-blue-400 font-bold hover:text-blue-300 transition-colors underline underline-offset-4">Sign In</Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Signup;
