import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, Clock, ExternalLink, Play,
  ChevronDown, Code2, Layers, Calendar, ChevronRight, PlayCircle
} from 'lucide-react';

// ── YouTube Video Card Component ─────────────────────────────────────────────
const YouTubeCard = ({ res }) => {
  const isYouTube = res.link && (res.link.includes('youtube.com') || res.link.includes('youtu.be'));

  // Extract search query from YouTube search URL for display
  const getSearchQuery = (url) => {
    try {
      const u = new URL(url);
      const q = u.searchParams.get('search_query');
      return q ? decodeURIComponent(q.replace(/\+/g, ' ')) : res.title;
    } catch {
      return res.title;
    }
  };

  // Build a stable thumbnail-style gradient based on the query string
  const gradients = [
    'from-red-900 to-red-700',
    'from-blue-900 to-blue-700',
    'from-purple-900 to-purple-700',
    'from-emerald-900 to-emerald-700',
    'from-orange-900 to-orange-700',
    'from-pink-900 to-pink-700',
  ];
  const gradientIdx = (res.title?.charCodeAt(0) || 0) % gradients.length;
  const gradient = gradients[gradientIdx];

  const query = isYouTube ? getSearchQuery(res.link) : res.title;

  if (!isYouTube) {
    // Non-YouTube resource — plain card
    return (
      <a
        href={res.link || '#'}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-2 text-xs text-slate-400 hover:text-white bg-slate-700/30 p-3 rounded-xl border border-slate-600/40 hover:bg-slate-700 hover:border-slate-500 transition-all"
      >
        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate flex-1 font-medium">{res.title}</span>
      </a>
    );
  }

  return (
    <a
      href={res.link}
      target="_blank"
      rel="noreferrer"
      className="group block rounded-xl overflow-hidden border border-slate-700/50 hover:border-red-500/40 transition-all hover:shadow-lg hover:shadow-red-900/20 bg-slate-900"
    >
      {/* Thumbnail */}
      <div className={`relative h-32 bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}>
        {/* Grid lines for depth */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }} />
        {/* Topic text in thumbnail */}
        <p className="text-white/60 text-xs font-medium text-center px-4 leading-relaxed z-10 line-clamp-2">{query}</p>
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
          <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-900/50">
            <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
          </div>
        </div>
        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
          YouTube
        </div>
      </div>

      {/* Card footer */}
      <div className="p-3 flex items-start gap-2">
        <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center shrink-0 mt-0.5">
          {/* YouTube logo SVG */}
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="white">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-2.69 12.28 12.28 0 0 0-5.64 0A4.83 4.83 0 0 1 6.41 6.69 5.06 5.06 0 0 0 4 11.07v1.86a5.06 5.06 0 0 0 2.41 4.38 4.83 4.83 0 0 1 3.77 2.69 12.28 12.28 0 0 0 5.64 0 4.83 4.83 0 0 1 3.77-2.69A5.06 5.06 0 0 0 22 12.93v-1.86a5.06 5.06 0 0 0-2.41-4.38zM10 14.5v-5l5 2.5-5 2.5z" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-white leading-snug line-clamp-2 group-hover:text-red-400 transition-colors">{res.title}</p>
          <p className="text-[10px] text-slate-500 mt-0.5 truncate">{query}</p>
        </div>
      </div>
    </a>
  );
};

const LearningPath = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const pathId = searchParams.get('id');

  const [roadmap, setRoadmap] = useState(null);
  const [history, setHistory] = useState([]);
  const [progress, setProgress] = useState({ progressPercentage: 0, completedTopics: [] });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expandedPhases, setExpandedPhases] = useState({});

  // ── Load progress for a given path ID ─────────────────────────────────────
  const loadProgress = useCallback(async (targetPathId) => {
    try {
      const progRes = await api.get('/progress');
      const allProgress = progRes.data || [];
      const match = allProgress.find(p => {
        // Support both populated object and raw ObjectId string
        const pid = p.learningPathId?._id?.toString() || p.learningPathId?.toString();
        return pid === targetPathId?.toString();
      });
      if (match) {
        setProgress(match);
      } else {
        setProgress({ progressPercentage: 0, completedTopics: [] });
      }
    } catch {
      setProgress({ progressPercentage: 0, completedTopics: [] });
    }
  }, []);

  // ── Main data fetch ────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchOrGeneratePath = async () => {
      try {
        const gapAnalysisData = sessionStorage.getItem('gapAnalysis');

        // Always load history first
        const historyRes = await api.get('/ai/history').catch(() => ({ data: [] }));
        const paths = Array.isArray(historyRes.data) ? historyRes.data : [];
        setHistory(paths);

        if (gapAnalysisData) {
          // Generate new path
          setGenerating(true);
          const gapInfo = JSON.parse(gapAnalysisData);
          const res = await api.post('/ai/generate-path', {
            targetRole: gapInfo.targetRole,
            gapAnalysis: gapInfo.gapAnalysis,
            skills: gapInfo.skills,
            timeCommitment: gapInfo.timeCommitment,
          });
          const newPath = res.data.learningPath;
          setRoadmap(newPath);
          setProgress(res.data.progress || { progressPercentage: 0, completedTopics: [] });

          // Refresh history with new path
          const newHistory = await api.get('/ai/history').catch(() => ({ data: paths }));
          setHistory(Array.isArray(newHistory.data) ? newHistory.data : paths);

          sessionStorage.removeItem('gapAnalysis');
        } else {
          // Load existing path
          const url = pathId ? `/ai/learning-path?id=${pathId}` : '/ai/learning-path';
          const pathRes = await api.get(url);
          const loaded = pathRes.data;
          setRoadmap(loaded);
          if (loaded?._id) {
            await loadProgress(loaded._id);
          }
        }
      } catch (err) {
        console.error('LearningPath fetch error:', err);
      } finally {
        setLoading(false);
        setGenerating(false);
      }
    };

    fetchOrGeneratePath();
  }, [pathId]);

  // Expand first phase by default
  useEffect(() => {
    if (roadmap?.phases?.length > 0) {
      setExpandedPhases({ [roadmap.phases[0].phase]: true });
    }
  }, [roadmap]);

  // ── Switch to a different path ─────────────────────────────────────────────
  const switchPath = async (path) => {
    setLoading(true);
    setRoadmap(path);
    setExpandedPhases({ [path.phases?.[0]?.phase]: true });
    await loadProgress(path._id);
    setSearchParams({ id: path._id });
    setLoading(false);
  };

  // ── Mark a step complete — saves to DB with timestamp ─────────────────────
  const markTopicCompleted = async (topicTitle) => {
    if (!roadmap) return;
    // Optimistic update so the UI responds instantly
    const totalSteps = roadmap.phases.reduce((acc, p) => acc + p.steps.length, 0);
    const alreadyDone = progress.completedTopics?.includes(topicTitle);
    if (alreadyDone) return;

    const newCompleted = [...(progress.completedTopics || []), topicTitle];
    const newPct = Math.round((newCompleted.length / totalSteps) * 100);
    setProgress(prev => ({ ...prev, completedTopics: newCompleted, progressPercentage: newPct }));

    try {
      const res = await api.post('/progress/update', {
        learningPathId: roadmap._id,
        completedTopic: topicTitle,
        totalSteps,
      });
      // Sync with server response
      setProgress(res.data);
    } catch (err) {
      console.error('Error saving progress:', err);
      // Revert optimistic update on error
      setProgress(prev => ({
        ...prev,
        completedTopics: prev.completedTopics.filter(t => t !== topicTitle),
        progressPercentage: Math.round(((newCompleted.length - 1) / totalSteps) * 100),
      }));
    }
  };

  const togglePhase = (phaseName) => {
    setExpandedPhases(prev => ({ ...prev, [phaseName]: !prev[phaseName] }));
  };

  // ────────────────────────────────────────────────────────────────────────────
  if (loading || generating) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-xl font-medium text-slate-300">
          {generating ? 'AI is crafting your personalized 20–40 step roadmap...' : 'Loading your roadmap...'}
        </h2>
        {generating && <p className="text-sm text-slate-500 mt-2">This may take up to 60 seconds.</p>}
      </div>
    );
  }

  if (!roadmap || !roadmap.phases) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4 text-white">No Learning Path Found</h2>
        <p className="text-slate-400">Go back and complete the skill review to generate one.</p>
      </div>
    );
  }

  const totalSteps = roadmap.phases.reduce((acc, p) => acc + p.steps.length, 0);
  const completedCount = progress?.completedTopics?.length || 0;
  const overallPct = progress?.progressPercentage || 0;

  return (
    <div className="flex h-full min-h-screen">
      {/* ── LEFT SIDEBAR: All Paths ────────────────────────────────────────── */}
      <aside className="w-72 shrink-0 bg-slate-900/80 border-r border-slate-700/50 flex flex-col overflow-y-auto">
        <div className="p-5 border-b border-slate-700/50">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-2">
            <Layers className="w-3.5 h-3.5" /> All Learning Paths
          </h2>
          <p className="text-[10px] text-slate-600">{history.length} path{history.length !== 1 ? 's' : ''} found</p>
        </div>

        <div className="flex-1 p-3 space-y-2">
          {history.length === 0 && (
            <p className="text-xs text-slate-500 italic p-2">No paths yet.</p>
          )}
          {history.map((path) => {
            const isActive = roadmap._id === path._id;
            const pathSteps = path.phases?.reduce((a, p) => a + (p.steps?.length || 0), 0) || 0;
            return (
              <button
                key={path._id}
                onClick={() => switchPath(path)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all group ${
                  isActive
                    ? 'bg-blue-600/20 border-blue-500/40 text-white'
                    : 'bg-slate-800/40 border-slate-700/40 text-slate-400 hover:bg-slate-800 hover:border-slate-600 hover:text-white'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className={`text-sm font-bold truncate ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                      {path.goal}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        path.currentLevel === 'Advanced' ? 'bg-purple-500/20 text-purple-400' :
                        path.currentLevel === 'Intermediate' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-emerald-500/20 text-emerald-400'
                      }`}>{path.currentLevel}</span>
                      <span className="text-[10px] text-slate-500">{pathSteps} steps</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1.5 text-[10px] text-slate-500">
                      <Calendar className="w-3 h-3" />
                      {new Date(path.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />}
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* ── MAIN CONTENT ──────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-8 max-w-4xl">
        {/* Header */}
        <div className="bg-slate-800/60 p-7 rounded-2xl border border-slate-700/50 shadow-md mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight mb-1">{roadmap.goal}</h1>
              <p className="text-slate-400 text-sm">Level: <span className="text-blue-400 font-semibold uppercase">{roadmap.currentLevel}</span></p>
            </div>
            <div className="flex gap-8 shrink-0">
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-1">Completed</div>
                <div className="text-2xl font-black text-emerald-400">{completedCount}<span className="text-slate-500 text-sm font-normal">/{totalSteps}</span></div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-1">Progress</div>
                <div className="text-2xl font-black text-blue-400">{overallPct}%</div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-700/50 rounded-full h-2.5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${overallPct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
            />
          </div>
        </div>

        {/* Phase Timeline */}
        <div className="space-y-4">
          {roadmap.phases.map((phaseData, phaseIdx) => {
            const isPhaseExpanded = expandedPhases[phaseData.phase];
            const phaseCompleted = phaseData.steps.filter(s => progress?.completedTopics?.includes(s.title)).length;
            const phaseColor =
              phaseData.phase === 'Advanced' ? { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', dot: 'bg-purple-500' } :
              phaseData.phase === 'Intermediate' ? { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', dot: 'bg-blue-500' } :
              { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', dot: 'bg-emerald-500' };

            return (
              <div key={phaseIdx} className={`rounded-2xl border ${phaseColor.border} overflow-hidden`}>
                {/* Phase Header */}
                <button
                  onClick={() => togglePhase(phaseData.phase)}
                  className={`w-full flex items-center justify-between p-5 ${phaseColor.bg} hover:brightness-110 transition-all`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${phaseColor.dot}`} />
                    <div className="text-left">
                      <h2 className={`text-base font-bold ${phaseColor.text} tracking-tight`}>{phaseData.phase} Phase</h2>
                      <p className="text-xs text-slate-500 mt-0.5">{phaseCompleted} / {phaseData.steps.length} steps complete</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${phaseColor.dot} transition-all duration-500`}
                        style={{ width: `${phaseData.steps.length > 0 ? (phaseCompleted / phaseData.steps.length) * 100 : 0}%` }}
                      />
                    </div>
                    <ChevronDown className={`w-5 h-5 ${phaseColor.text} transition-transform ${isPhaseExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {/* Steps */}
                <AnimatePresence>
                  {isPhaseExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="bg-slate-900/40"
                    >
                      <div className="p-5 space-y-5">
                        {phaseData.steps.map((step, sIdx) => {
                          const isCompleted = progress?.completedTopics?.includes(step.title);
                          return (
                            <div
                              key={sIdx}
                              className={`relative pl-8 before:absolute before:left-[11px] before:top-8 before:bottom-[-20px] before:w-0.5 before:bg-slate-700/50 last:before:hidden`}
                            >
                              <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                isCompleted ? 'bg-emerald-500 border-emerald-500' : 'bg-slate-800 border-slate-600'
                              }`}>
                                {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                              </div>

                              <div className={`bg-slate-800/80 p-5 rounded-xl border transition-all ${
                                isCompleted ? 'border-emerald-500/20 opacity-80' : 'border-slate-700/50 hover:border-slate-600'
                              }`}>
                                {/* Step header */}
                                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                                  <h3 className={`text-base font-bold tracking-tight ${isCompleted ? 'text-slate-400 line-through decoration-emerald-500' : 'text-white'}`}>
                                    {step.title}
                                  </h3>
                                  <div className="flex gap-2 flex-wrap">
                                    {step.estimatedTime && (
                                      <span className="flex items-center gap-1 text-[11px] font-semibold text-blue-400 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20 uppercase tracking-wide">
                                        <Clock className="w-3 h-3" /> {step.estimatedTime}
                                      </span>
                                    )}
                                    {step.difficulty && (
                                      <span className={`text-[11px] font-semibold px-2 py-1 rounded border uppercase tracking-wide ${
                                        step.difficulty === 'Hard' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                        step.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                      }`}>{step.difficulty}</span>
                                    )}
                                  </div>
                                </div>

                                <p className="text-slate-400 text-sm mb-3 leading-relaxed">{step.description}</p>

                                {/* Why for you */}
                                {step.reason && (
                                  <div className="mb-3 bg-blue-500/5 border border-blue-500/15 rounded-lg px-4 py-2.5 flex items-start gap-2">
                                    <span className="text-blue-400 text-sm shrink-0">💡</span>
                                    <p className="text-xs text-blue-300 leading-relaxed">
                                      <span className="font-bold text-blue-400">Why for you: </span>{step.reason}
                                    </p>
                                  </div>
                                )}

                                {/* Project */}
                                {step.project && (
                                  <div className="mb-3 bg-slate-900/60 p-3.5 rounded-lg border border-slate-700/50 flex items-start gap-2.5">
                                    <Code2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                    <div>
                                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">Project</h4>
                                      <p className="text-sm font-medium text-slate-300">{step.project}</p>
                                    </div>
                                  </div>
                                )}

                                {/* YouTube Video Resources */}
                                {step.resources && step.resources.length > 0 && (
                                  <div className="mb-4">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                                      <PlayCircle className="w-3.5 h-3.5 text-red-400" />
                                      Recommended Videos
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      {step.resources.map((res, i) => (
                                        <YouTubeCard key={i} res={res} />
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Mark Complete */}
                                <button
                                  onClick={() => markTopicCompleted(step.title)}
                                  disabled={isCompleted}
                                  className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all tracking-wide ${
                                    isCompleted
                                      ? 'bg-emerald-500/10 text-emerald-400 cursor-default border border-emerald-500/20'
                                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm hover:shadow-blue-500/20'
                                  }`}
                                >
                                  {isCompleted ? '✓ Completed' : 'Mark as Complete'}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LearningPath;
