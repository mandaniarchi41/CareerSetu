import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Rocket, 
  Target, 
  Compass,
  BarChart,
  Globe,
  Activity,
  FileText,
  Map,
  BrainCircuit,
  ChevronRight,
  Sparkles
} from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#0A0B1A] text-white selection:bg-blue-500/30 font-sans">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-6 py-4 max-w-[1200px] mx-auto border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">
            CareerSetu
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Log in</Link>
          <Link to="/signup" className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            Sign up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-6 max-w-[1200px] mx-auto flex flex-col lg:flex-row items-center gap-12">
        
        {/* Left Content */}
        <div className="flex-1 w-full z-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 bg-blue-900/20 border border-blue-500/20 px-3 py-1 rounded-full text-blue-300 text-xs font-medium mb-6"
          >
            <Sparkles className="w-3 h-3 text-blue-400" />
            India's AI-Powered Career Navigator
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-4xl lg:text-[3.5rem] font-semibold mb-6 leading-[1.1] tracking-tight"
          >
            Bridge the gap to <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              your dream career.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-400 max-w-md mb-8 leading-relaxed"
          >
            CareerSetu uses AI to create a personalised, step-by-step roadmap based on your background, skills, and goals.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-col sm:flex-row items-center gap-3 mb-12"
          >
            <Link to="/signup" className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white px-5 py-2.5 rounded-md text-sm font-medium transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)] flex items-center justify-center gap-2">
              Start for free
              <ChevronRight className="w-4 h-4" />
            </Link>
            <a href="#how-it-works" className="w-full sm:w-auto bg-[#1A1B2E] hover:bg-[#23243B] border border-white/5 text-white px-5 py-2.5 rounded-md text-sm font-medium transition-colors flex items-center justify-center">
              Learn more
            </a>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-8 text-sm"
          >
            <div>
              <div className="font-bold text-white text-base">50+</div>
              <div className="text-slate-500 font-medium">Career Paths</div>
            </div>
            <div>
              <div className="font-bold text-white text-base">AI-Powered</div>
              <div className="text-slate-500 font-medium">Engine</div>
            </div>
            <div>
              <div className="font-bold text-white text-base">NSQF</div>
              <div className="text-slate-500 font-medium">Aligned</div>
            </div>
          </motion.div>
        </div>

        {/* Right - Subtle Minimal Orb Visual */}
        <div className="flex-1 w-full flex items-center justify-center lg:justify-end relative">
          <div className="relative w-[300px] h-[300px] flex items-center justify-center">
            
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

            {/* Minimal Floating Tags */}
            <div className="absolute -top-2 right-4 bg-[#0F1123] border border-indigo-500/30 px-3 py-1.5 rounded-md flex items-center gap-2 z-20 shadow-md">
              <BarChart className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-xs font-medium text-slate-300">Skill Analysis</span>
            </div>

            <div className="absolute top-[40%] -left-8 bg-[#0F1123] border border-emerald-500/30 px-3 py-1.5 rounded-md flex items-center gap-2 z-20 shadow-md">
              <Rocket className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-medium text-slate-300">Job Ready</span>
            </div>

            <div className="absolute bottom-[20%] -right-4 bg-[#0F1123] border border-cyan-500/30 px-3 py-1.5 rounded-md flex items-center gap-2 z-20 shadow-md">
              <Map className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs font-medium text-slate-300">Learning Path</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 border-t border-white/5 bg-[#080914]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-3 tracking-tight">Three steps to your career path.</h2>
            <p className="text-slate-400 text-base max-w-xl">
              No lengthy consultations. No guesswork. Just your profile and our AI engine.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Fill Your Profile', desc: 'Answer a quick form about your education, skills, and goals.', icon: FileText },
              { step: '02', title: 'AI Analyses You', desc: 'Our engine maps your data against thousands of career paths.', icon: BrainCircuit },
              { step: '03', title: 'Get Your Roadmap', desc: 'Receive a step-by-step learning roadmap tailored to you.', icon: Map }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5, scale: 1.02, rotateX: 2, rotateY: 2 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 300 }}
                className="bg-[#0F1123] border border-white/5 p-6 rounded-xl hover:border-white/20 transition-all shadow-lg hover:shadow-[0_10px_30px_rgba(37,99,235,0.1)] relative group perspective-1000"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl pointer-events-none" />
                <div className="w-10 h-10 bg-slate-900 border border-white/5 rounded-lg flex items-center justify-center mb-5 relative z-10 group-hover:border-blue-500/30 transition-colors">
                  <item.icon className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-xs font-semibold text-blue-500 mb-1 relative z-10">STEP {item.step}</div>
                <h3 className="text-base font-semibold mb-2 text-white relative z-10">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed relative z-10">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 border-t border-white/5">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-3 tracking-tight">Everything you need to succeed.</h2>
            <p className="text-slate-400 text-base max-w-xl">
              Built specifically for Indian learners at every stage of their journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Compass, color: 'text-orange-400', bgHover: 'hover:bg-orange-500/5 hover:border-orange-500/20', title: 'AI Career Mapping', desc: 'Personalised roadmap aligned to your specific goals.' },
              { icon: BarChart, color: 'text-emerald-400', bgHover: 'hover:bg-emerald-500/5 hover:border-emerald-500/20', title: 'Skill Gap Analysis', desc: 'Know exactly what to learn next to bridge the gap.' },
              { icon: Target, color: 'text-rose-400', bgHover: 'hover:bg-rose-500/5 hover:border-rose-500/20', title: 'NSQF-Aligned', desc: 'Framework recognised across India for skills.' },
              { icon: Activity, color: 'text-indigo-400', bgHover: 'hover:bg-indigo-500/5 hover:border-indigo-500/20', title: 'Progress Tracking', desc: 'Visual dashboard to stay on track continuously.' },
              { icon: Globe, color: 'text-cyan-400', bgHover: 'hover:bg-cyan-500/5 hover:border-cyan-500/20', title: 'Offline-Friendly', desc: 'Works seamlessly even with limited connectivity.' },
              { icon: Rocket, color: 'text-purple-400', bgHover: 'hover:bg-purple-500/5 hover:border-purple-500/20', title: 'Instant Results', desc: 'Get your tailored career pathway in seconds.' }
            ].map((feat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={`bg-[#0F1123] border border-white/5 p-6 rounded-xl transition-all duration-300 flex items-start gap-4 cursor-pointer hover:shadow-xl group ${feat.bgHover}`}
              >
                <div className="mt-1 group-hover:scale-110 transition-transform">
                  <feat.icon className={`w-5 h-5 ${feat.color}`} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-1 text-white">{feat.title}</h3>
                  <p className="text-slate-400 text-sm">{feat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-t border-white/5 bg-[#080914]">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col items-center text-center">
          <h2 className="text-3xl font-semibold mb-4 tracking-tight">Ready to chart your career?</h2>
          <p className="text-slate-400 text-base max-w-md mb-8">
            Join learners who've discovered their path with CareerSetu. Free. Instant. Personalised.
          </p>
          <Link to="/signup" className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white px-6 py-3 rounded-md text-sm font-semibold transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] flex items-center justify-center gap-2">
            Get started for free
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/5 bg-[#0A0B1A]">
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-indigo-500" />
            <span className="font-medium text-sm text-slate-300">CareerSetu</span>
          </div>
          <div className="text-xs text-slate-500">
            © 2025 CareerSetu · AI-Powered Career Navigation
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
