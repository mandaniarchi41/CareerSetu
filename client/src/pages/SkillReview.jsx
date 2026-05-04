import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Plus, X, ArrowRight, Clock } from 'lucide-react';

const TIME_OPTIONS = [
  { label: '1–2 hrs/week', value: '1-2 hours per week' },
  { label: '3–5 hrs/week', value: '3-5 hours per week' },
  { label: '5–10 hrs/week', value: '5-10 hours per week' },
  { label: '10+ hrs/week', value: '10+ hours per week (full-time learner)' },
];

const SkillReview = () => {
  const [skills, setSkills] = useState([]);            // full objects [{name, level}]
  const [newSkill, setNewSkill] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState(50);
  const [targetRole, setTargetRole] = useState('');
  const [timeCommitment, setTimeCommitment] = useState(TIME_OPTIONS[1].value);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedRole = sessionStorage.getItem('suggestedRole');
    if (storedRole) {
      setTargetRole(storedRole);
      sessionStorage.removeItem('suggestedRole');
    }

    const fetchProfile = async () => {
      try {
        const res = await api.get('/profile');
        if (res.data && res.data.skills) {
          // Keep as objects {name, level}
          const extracted = res.data.skills.map(s =>
            typeof s === 'string' ? { name: s, level: 50 } : { name: s.name, level: s.level || 50 }
          );
          setSkills(extracted);
        }
      } catch (err) {
        console.error('No profile found or error fetching', err);
      }
    };
    fetchProfile();
  }, []);

  const handleAddSkill = (e) => {
    e.preventDefault();
    const name = newSkill.trim();
    if (name && !skills.find(s => s.name.toLowerCase() === name.toLowerCase())) {
      setSkills([...skills, { name, level: newSkillLevel }]);
      setNewSkill('');
      setNewSkillLevel(50);
    }
  };

  const handleRemoveSkill = (skillName) => {
    setSkills(skills.filter(s => s.name !== skillName));
  };

  const handleLevelChange = (skillName, level) => {
    setSkills(skills.map(s => s.name === skillName ? { ...s, level: Number(level) } : s));
  };

  const handleAnalyze = async () => {
    if (!targetRole.trim() || skills.length === 0) return;

    setLoading(true);
    try {
      // Update profile with full skill objects including levels
      await api.post('/profile/manual', { skills }).catch(() => {});

      // Gap analysis — pass skill names + levels + time commitment
      const gapRes = await api.post('/ai/analyze-profile', {
        targetRole,
        skills,        // [{name, level}]
        timeCommitment
      }).catch(() => ({
        data: {
          targetRole,
          skills,
          timeCommitment,
          gapAnalysis: { missingSkills: ['System Design', 'AWS'], currentLevel: 'Intermediate' }
        }
      }));

      // Store everything needed for path generation
      sessionStorage.setItem('gapAnalysis', JSON.stringify({
        ...gapRes.data,
        skills,
        timeCommitment
      }));

      navigate('/path');
    } catch (err) {
      console.error('Error analyzing skills:', err);
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level) => {
    if (level >= 80) return 'text-emerald-400';
    if (level >= 60) return 'text-blue-400';
    if (level >= 40) return 'text-amber-400';
    return 'text-red-400';
  };

  const getLevelLabel = (level) => {
    if (level >= 80) return 'Expert';
    if (level >= 60) return 'Proficient';
    if (level >= 40) return 'Learning';
    return 'Beginner';
  };

  return (
    <div className="p-8 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Left: Skills */}
      <div>
        <h1 className="text-2xl font-bold mb-2 tracking-tight text-white">Review Skills</h1>
        <p className="text-slate-400 mb-6 text-sm leading-relaxed">
          Set your proficiency level for each skill. The AI uses these levels to skip what you know and focus on what you don't.
        </p>

        {/* Add skill form */}
        <form onSubmit={handleAddSkill} className="mb-6 space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add a skill (e.g. React, Python)"
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-4 rounded-lg text-white font-semibold text-sm transition-colors">
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 w-20 shrink-0">Proficiency:</span>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={newSkillLevel}
              onChange={(e) => setNewSkillLevel(Number(e.target.value))}
              className="flex-1 accent-blue-500"
            />
            <span className={`text-xs font-bold w-20 text-right ${getLevelColor(newSkillLevel)}`}>
              {newSkillLevel}% {getLevelLabel(newSkillLevel)}
            </span>
          </div>
        </form>

        {/* Skill list with levels */}
        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
          {skills.map((skill, idx) => (
            <div key={idx} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-white">{skill.name}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${getLevelColor(skill.level)}`}>
                    {skill.level}% — {getLevelLabel(skill.level)}
                  </span>
                  <button onClick={() => handleRemoveSkill(skill.name)} className="text-slate-500 hover:text-red-400 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={skill.level}
                onChange={(e) => handleLevelChange(skill.name, e.target.value)}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                <span>Beginner</span>
                <span>Proficient</span>
                <span>Expert</span>
              </div>
            </div>
          ))}
          {skills.length === 0 && <p className="text-slate-500 italic text-sm">No skills added yet.</p>}
        </div>
      </div>

      {/* Right: Goal + Time + CTA */}
      <div className="bg-slate-800/60 p-8 rounded-xl border border-slate-700/50 shadow-md h-fit sticky top-24 space-y-6">
        <div>
          <h2 className="text-lg font-bold mb-1 tracking-tight text-white">Set Your Goal</h2>
          <p className="text-sm text-slate-400 mb-4 leading-relaxed">What role are you aiming for?</p>
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g. Full Stack Developer"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          />
        </div>

        {/* Time Commitment */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-white">Weekly Time Commitment</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {TIME_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setTimeCommitment(opt.value)}
                className={`py-2.5 px-3 rounded-lg text-xs font-semibold border transition-all ${
                  timeCommitment === opt.value
                    ? 'bg-purple-600 border-purple-500 text-white'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={!targetRole.trim() || skills.length === 0 || loading}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl flex justify-center items-center gap-2 transition-colors shadow-lg shadow-purple-500/20"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              AI is Analyzing...
            </>
          ) : (
            <>Generate My Personalized Path <ArrowRight className="w-5 h-5" /></>
          )}
        </button>

        <p className="text-[11px] text-slate-500 text-center">
          The AI will skip skills you already know ({skills.filter(s => s.level >= 70).length} strong) and focus on your {skills.filter(s => s.level < 70).length} weaker areas.
        </p>
      </div>
    </div>
  );
};

export default SkillReview;
