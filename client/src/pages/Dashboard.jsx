import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import { FileUp, BookOpen, Map, ArrowRight, History, Calendar, CheckCircle2, Trash2 } from 'lucide-react';

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch profile and history independently so one failure doesn't kill both
        const profileRes = await api.get('/profile').catch(() => null);
        const historyRes = await api.get('/ai/history').catch(() => null);
        
        if (profileRes?.data) setProfile(profileRes.data);
        // Always ensure history is an array
        setHistory(Array.isArray(historyRes?.data) ? historyRes.data : []);
      } catch (err) {
        console.log("Dashboard data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDeletePath = async (e, id) => {
    e.stopPropagation(); 
    if (!window.confirm("Are you sure you want to delete this learning path?")) return;
    
    try {
      await api.delete(`/ai/learning-path/${id}`);
      setHistory(history.filter(p => p._id !== id));
    } catch (err) {
      console.error("Failed to delete path", err);
    }
  };

  if (loading) return <div className="p-8">Loading dashboard...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 tracking-tight text-white">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div whileHover={{ scale: 1.02 }} className="bg-slate-800/80 p-6 rounded-xl border border-slate-700/50 shadow-sm hover:shadow-md transition-all">
          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mb-5">
            <FileUp className="w-5 h-5 text-blue-400" />
          </div>
          <h2 className="text-lg font-semibold mb-1.5 tracking-tight text-white">1. Your Profile</h2>
          <p className="text-slate-400 mb-5 text-sm leading-relaxed">Upload your resume to extract skills or enter them manually.</p>
          <Link to="/upload" className="text-blue-400 hover:text-blue-300 font-medium text-sm tracking-wide flex items-center gap-1">
            {profile ? 'Update Profile' : 'Upload Resume'} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="bg-slate-800/80 p-6 rounded-xl border border-slate-700/50 shadow-sm hover:shadow-md transition-all opacity-95">
          <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mb-5">
            <BookOpen className="w-5 h-5 text-purple-400" />
          </div>
          <h2 className="text-lg font-semibold mb-1.5 tracking-tight text-white">2. Review Skills</h2>
          <p className="text-slate-400 mb-5 text-sm leading-relaxed">Review extracted skills, define your goal, and analyze gaps.</p>
          <Link to="/skills" className="text-purple-400 hover:text-purple-300 font-medium text-sm tracking-wide flex items-center gap-1">
            Review &amp; Analyze <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="bg-slate-800/80 p-6 rounded-xl border border-slate-700/50 shadow-sm hover:shadow-md transition-all opacity-95">
          <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-5">
            <Map className="w-5 h-5 text-emerald-400" />
          </div>
          <h2 className="text-lg font-semibold mb-1.5 tracking-tight text-white">3. Learning Path</h2>
          <p className="text-slate-400 mb-5 text-sm leading-relaxed">Generate and track your personalized roadmap to success.</p>
          <Link to="/path" className="text-emerald-400 hover:text-emerald-300 font-medium text-sm tracking-wide flex items-center gap-1">
            {history.length > 0 ? 'View Roadmap' : 'Generate Roadmap'} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>
      </div>

      {history.length > 0 && (
        <div className="mt-10 bg-slate-800/60 p-6 rounded-xl border border-slate-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold mb-1 flex items-center gap-2 tracking-tight text-white">
              <CheckCircle2 className="text-emerald-400 w-5 h-5" />
              Current Goal: {history[0].goal}
            </h2>
            <p className="text-slate-400 text-sm">Level: <span className="font-semibold text-blue-400">{history[0].currentLevel}</span></p>
          </div>
          <Link to="/path" className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg transition-colors text-sm font-semibold tracking-wide shadow-sm">
            Continue Learning
          </Link>
        </div>
      )}
      
      {/* Path History Section */}
      <section className="mt-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-purple-500/10 p-2 rounded-lg">
            <History className="w-5 h-5 text-purple-400" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">Your Path History</h2>
        </div>

        {history.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {history.map((path, idx) => (
              <motion.div 
                key={path._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-slate-800/40 p-5 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-all group cursor-pointer shadow-sm"
                onClick={() => navigate('/path')}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-base font-bold group-hover:text-blue-400 transition-colors tracking-tight text-white">{path.goal}</h3>
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-1 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(path.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold ${
                      path.currentLevel === 'Advanced' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 
                      path.currentLevel === 'Intermediate' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
                      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {path.currentLevel}
                    </span>
                    <button 
                      onClick={(e) => handleDeletePath(e, path._id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                      title="Delete Path"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-700/50">
                  <span className="text-xs font-medium text-slate-500">
                    {path.phases ? path.phases.reduce((acc, p) => acc + (p.steps ? p.steps.length : 0), 0) : (path.steps ? path.steps.length : 0)} Steps
                  </span>
                  <div className="flex items-center gap-1 text-blue-400 text-xs font-semibold group-hover:gap-1.5 transition-all">
                    View Path <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-800/30 border border-dashed border-slate-700/60 p-10 rounded-xl text-center">
            <p className="text-slate-400 text-sm italic">No previous paths found. Start by analyzing your profile!</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
