import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import { motion } from 'framer-motion';
import { Target, TrendingUp, Award, Clock, Briefcase, Zap, CheckCircle2, BookOpen } from 'lucide-react';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics');
        setData(res.data);
      } catch (err) {
        console.log('Error fetching analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <h2 className="text-xl font-medium text-slate-300">Calculating your career intelligence...</h2>
    </div>
  );

  // Fallback so page never crashes
  const fallbackData = {
    profile: null,
    skillData: [
      { subject: 'Programming', A: 20, fullMark: 100 },
      { subject: 'Problem Solving', A: 20, fullMark: 100 },
      { subject: 'Communication', A: 20, fullMark: 100 },
    ],
    skillBreakdown: [],
    readinessScore: 0,
    weeklyProgress: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => ({ day: d, hours: 0 })),
    totalSteps: 0,
    completedSteps: 0,
    stats: { badges: 0, studyHours: 0, projects: 0, streak: 0, completedSteps: 0, totalSteps: 0 }
  };

  const {
    profile,
    skillData,
    skillBreakdown,
    readinessScore,
    weeklyProgress,
    totalSteps,
    completedSteps,
    stats
  } = data || fallbackData;

  const safeSkillData = skillData && skillData.length >= 3 ? skillData : fallbackData.skillData;
  const safeWeeklyProgress = weeklyProgress && weeklyProgress.length > 0 ? weeklyProgress : fallbackData.weeklyProgress;
  const safeStats = stats || fallbackData.stats;
  const safeScore = readinessScore ?? 0;
  const safeCompleted = completedSteps || 0;
  const safeTotal = totalSteps || 0;
  const progressPct = safeTotal > 0 ? Math.round((safeCompleted / safeTotal) * 100) : 0;
  const isEmpty = !data;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Career Intelligence</h1>
          <p className="text-slate-400 text-sm">
            {profile ? `Analyzing profile for ${profile.goal || 'your career goals'}` : 'Upload a resume to unlock full analytics'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isEmpty && (
            <div className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2">
              ⚠️ Upload a resume to populate your analytics!
            </div>
          )}
          <div className="bg-blue-600/10 text-blue-400 border border-blue-500/20 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm">
            <Zap className="w-4 h-4" />
            Live Analytics
          </div>
        </div>
      </div>

      {/* Row 1: Readiness + Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Readiness Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-800/60 p-8 rounded-xl border border-slate-700/50 shadow-sm flex flex-col items-center justify-center text-center"
        >
          <h3 className="text-sm font-bold mb-5 flex items-center gap-2 tracking-tight text-white uppercase">
            <Target className="text-red-400 w-4 h-4" />
            Job Readiness Score
          </h3>
          <div className="relative w-44 h-44 mb-5">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="88" className="fill-none stroke-slate-700" strokeWidth="12" />
              <circle
                cx="100" cy="100" r="88"
                className="fill-none stroke-blue-500 transition-all duration-1000 ease-out"
                strokeWidth="12"
                strokeDasharray={2 * Math.PI * 88}
                strokeDashoffset={2 * Math.PI * 88 * (1 - safeScore / 100)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-white">{safeScore}%</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Ready</span>
            </div>
          </div>
          <div className="w-full space-y-2 text-left">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Profile Completeness</span>
              <span>{profile ? (profile.skills?.length > 0 ? '✓' : '—') : '—'}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Skill Depth</span>
              <span>{profile?.skills?.length || 0} skills</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Path Progress</span>
              <span>{safeStats.completedSteps || 0} / {safeStats.totalSteps || 0} steps</span>
            </div>
          </div>
        </motion.div>

        {/* Skill Radar — actual skill names */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-slate-800/60 p-8 rounded-xl border border-slate-700/50 shadow-sm"
        >
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2 tracking-tight text-white uppercase">
            <TrendingUp className="text-blue-400 w-4 h-4" />
            Top Skill Proficiency
            {profile?.skills?.length > 0 && (
              <span className="ml-auto text-xs text-slate-500 normal-case font-normal">Top {Math.min(6, profile.skills.length)} skills</span>
            )}
          </h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={safeSkillData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Proficiency" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Row 2: Learning Path Progress */}
      {safeTotal > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-slate-800/60 p-6 rounded-xl border border-slate-700/50 shadow-sm"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold flex items-center gap-2 uppercase tracking-tight text-white">
              <BookOpen className="text-emerald-400 w-4 h-4" />
              Learning Path Progress
            </h3>
            <span className="text-sm font-bold text-emerald-400">{progressPct}%</span>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-3 mb-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="bg-gradient-to-r from-blue-500 to-emerald-500 h-3 rounded-full"
            />
          </div>
          <p className="text-xs text-slate-400">{safeCompleted} of {safeTotal} steps completed across all learning paths</p>
        </motion.div>
      )}

      {/* Row 3: Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { icon: Award, label: 'Badges Earned', value: safeStats.badges, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
          { icon: Clock, label: 'Study Hours', value: `${safeStats.studyHours}h`, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
          { icon: Briefcase, label: 'Paths Created', value: safeStats.projects, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
          { icon: CheckCircle2, label: 'Steps Done', value: safeStats.completedSteps || 0, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.08 }}
            className={`bg-slate-800/60 p-5 rounded-xl border ${stat.border} shadow-sm`}
          >
            <div className={`w-9 h-9 ${stat.bg} ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-white tracking-tight">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Row 4: Skill Bars */}
      {skillBreakdown && skillBreakdown.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-800/60 p-6 rounded-xl border border-slate-700/50 shadow-sm"
        >
          <h3 className="text-sm font-bold mb-5 uppercase tracking-tight text-white">All Skills Breakdown</h3>
          <div className="space-y-3">
            {skillBreakdown.map((skill, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">{skill.name}</span>
                  <span className="text-slate-400">{skill.level}%</span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.level}%` }}
                    transition={{ duration: 0.8, delay: i * 0.05 }}
                    className={`h-2 rounded-full ${
                      skill.level >= 80 ? 'bg-emerald-500' :
                      skill.level >= 60 ? 'bg-blue-500' :
                      skill.level >= 40 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Row 5: Weekly Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-slate-800/60 p-6 rounded-xl border border-slate-700/50 shadow-sm"
      >
        <h3 className="text-sm font-bold mb-5 uppercase tracking-tight text-white">Learning Intensity — Last 7 Days</h3>
        <div style={{ width: '100%', height: 220 }}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={safeWeeklyProgress} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} allowDecimals={false} />
              <Tooltip
                cursor={{ fill: 'rgba(59,130,246,0.06)' }}
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, color: '#f1f5f9' }}
                formatter={(v) => [`${v}h`, 'Study Time']}
              />
              <Bar dataKey="hours" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;
