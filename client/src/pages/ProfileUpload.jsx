import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { UploadCloud, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const ProfileUpload = () => {
  const [file, setFile] = useState(null);
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setError('');
    setSuggestions(null);

    const formData = new FormData();
    formData.append('resume', file);

    setLoading(true);
    try {
      const res = await api.post('/profile/upload-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data && res.data.careerSuggestions) {
        setSuggestions(res.data.careerSuggestions);
      } else {
        navigate('/skills');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error uploading file');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkedInSubmit = async (e) => {
    e.preventDefault();
    if (!linkedinUrl) return;

    setError('');
    setSuggestions(null);

    setLoading(true);
    try {
      const res = await api.post('/profile/linkedin', { url: linkedinUrl });
      setSuggestions(res.data.careerSuggestions);
    } catch (err) {
      setError('Error analyzing LinkedIn profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRole = (role) => {
    sessionStorage.setItem('suggestedRole', role);
    navigate('/skills');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/60 p-8 rounded-xl border border-slate-700/50 shadow-md"
      >
        <h1 className="text-2xl font-bold mb-2 tracking-tight text-white">Enhance Your Profile</h1>
        <p className="text-slate-400 mb-8 text-sm leading-relaxed">Analyze your background via Resume or LinkedIn for a personalized career path.</p>

        {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg mb-4">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Resume Upload */}
          <section>
            <h2 className="text-lg font-semibold mb-4 tracking-tight text-white">Option 1: Upload Resume</h2>
            <form onSubmit={handleUpload}>
              <div className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer relative min-h-[200px] flex flex-col justify-center">
                <input 
                  type="file" 
                  accept="application/pdf"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <UploadCloud className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                {file ? (
                  <p className="text-blue-400 font-medium">{file.name}</p>
                ) : (
                  <p className="text-slate-300">Drag PDF here</p>
                )}
              </div>
              <button 
                type="submit" 
                disabled={!file || loading}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-lg font-medium transition-colors"
              >
                {loading ? 'Analyzing...' : 'Extract from Resume'}
              </button>
            </form>
          </section>

          {/* LinkedIn URL */}
          <section>
            <h2 className="text-lg font-semibold mb-4 tracking-tight text-white">Option 2: LinkedIn Analysis</h2>
            <form onSubmit={handleLinkedInSubmit} className="space-y-4">
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-8 min-h-[200px] flex flex-col justify-center">
                <label className="block text-sm font-medium text-slate-400 mb-2 text-center">Paste LinkedIn Profile URL</label>
                <input 
                  type="url" 
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <button 
                type="submit" 
                disabled={!linkedinUrl || loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-lg font-medium transition-colors"
              >
                {loading ? 'Analyzing Profile...' : 'Analyze LinkedIn'}
              </button>
            </form>
          </section>
        </div>

        {/* Career Suggestions */}
        {suggestions && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-12 pt-8 border-t border-slate-700/50"
          >
            <h2 className="text-xl font-bold mb-6 text-emerald-400 tracking-tight">Recommended Career Paths</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {suggestions.map((s, i) => (
                <div 
                  key={i} 
                  onClick={() => handleSelectRole(s.role)}
                  className="bg-slate-800/40 p-6 rounded-xl border border-slate-700/50 hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all cursor-pointer group shadow-sm"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-base group-hover:text-emerald-400 transition-colors tracking-tight text-white">{s.role}</h3>
                    <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-1 rounded-md font-bold uppercase tracking-wider">{s.matchScore}% Match</span>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed mb-4">{s.reason}</p>
                  <div className="text-xs font-semibold text-emerald-500 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Select Path <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex justify-center">
              <button onClick={() => navigate('/skills')} className="text-slate-500 hover:text-white transition-colors text-sm">
                Skip and enter role manually
              </button>
            </div>
          </motion.div>
        )}

        {!suggestions && (
          <div className="mt-8 text-center">
            <button 
              onClick={() => navigate('/skills')}
              className="text-slate-500 hover:text-white transition-colors"
            >
              Skip & enter skills manually
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ProfileUpload;
