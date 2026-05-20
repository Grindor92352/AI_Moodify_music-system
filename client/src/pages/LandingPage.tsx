import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, ArrowRight, Brain, Music2, History,
  Mail, MapPin, GitBranch, Share2, Camera,
  Shield, Zap, HeartPulse, Smile
} from 'lucide-react';

/* ─────────────────────────────────────────
   Intersection-Observer hook for scroll reveals
   ───────────────────────────────────────── */
function useReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ─────────────────────────────────────────
   Feature card data
   ───────────────────────────────────────── */
const features = [
  {
    icon: <Brain size={24} />,
    accent: 'from-violet-500 to-indigo-500',
    glow: 'rgba(139,92,246,0.15)',
    tag: 'AI-Powered',
    title: 'On-Device Face Analysis',
    desc: 'Our local computer vision model processes facial geometry in milliseconds. It detects emotional states privately on your machine—your video stream never uploads to any server.',
  },
  {
    icon: <Music2 size={24} />,
    accent: 'from-pink-500 to-rose-500',
    glow: 'rgba(236,72,153,0.15)',
    tag: 'Dynamic Curation',
    title: 'Adaptive Music Therapy',
    desc: 'Generates custom playlist selections matching your current mood. Integrates dynamically with the YouTube Data API to ensure your sessions feel fresh and personalized.',
  },
  {
    icon: <History size={24} />,
    accent: 'from-cyan-400 to-blue-500',
    glow: 'rgba(34,211,238,0.15)',
    tag: 'Persistent Memory',
    title: 'Track Your Journey',
    desc: 'Optionally store your mood history and top therapeutic tracks in a secure PostgreSQL database. Observe your emotional patterns and revisit past playlists with ease.',
  },
];

const stats = [
  { value: '48', label: 'Landmarks Tracked' },
  { value: '100%', label: 'Local Data Privacy' },
  { value: '6', label: 'Mapped Mood States' },
  { value: '0', label: 'Cloud Uploads' },
];

const steps = [
  {
    num: '01',
    color: 'from-indigo-500 to-violet-500',
    title: 'Face Scan',
    desc: 'Activate your webcam for a quick, secure frame analysis. Our local AI maps facial landmarks instantly.',
  },
  {
    num: '02',
    color: 'from-violet-500 to-pink-500',
    title: 'Mood Decoding',
    desc: 'The model checks expression metrics to determine if you feel happy, sad, stressed, anxious, angry, or fatigued.',
  },
  {
    num: '03',
    color: 'from-pink-500 to-rose-500',
    title: 'Sound Delivery',
    desc: 'The backend builds a tailored YouTube playlist of Bollywood music designed to lift or soothe your spirits.',
  },
];

const trustBadges = [
  { icon: <Shield size={14} />, label: 'Private & Local AI' },
  { icon: <Zap size={14} />, label: 'Real-Time Detection' },
  { icon: <HeartPulse size={14} />, label: 'Music Therapy' },
];

/* ─────────────────────────────────────────
   Feature Card Component
   ───────────────────────────────────────── */
function FeatureCard({ f, index }: { f: typeof features[0]; index: number }) {
  const { ref, visible } = useReveal();
  const [hovered, setHovered] = useState(false);
  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative rounded-2xl border border-white/[0.05] bg-white/[0.01] backdrop-blur-xl overflow-hidden p-8 transition-all duration-500"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(40px)',
        transition: `opacity 0.7s ease ${index * 0.1}s, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${index * 0.1}s`,
        borderColor: hovered ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)',
        boxShadow: hovered ? `0 10px 40px -15px ${f.glow}` : 'none',
      }}
    >
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.accent} flex items-center justify-center text-white shadow-lg`}>
          {f.icon}
        </div>
        <span className={`text-[10px] font-bold tracking-widest uppercase bg-gradient-to-r ${f.accent} bg-clip-text text-transparent`}>
          {f.tag}
        </span>
      </div>
      <h3 className="text-lg font-bold text-white mb-3 tracking-tight">{f.title}</h3>
      <p className="text-neutral-400 text-sm leading-relaxed">{f.desc}</p>

      {/* Decorative accent glow */}
      <div
        className={`absolute -top-12 -right-12 w-24 h-24 rounded-full bg-gradient-to-br ${f.accent} blur-2xl opacity-10 transition-opacity duration-500 ${hovered ? 'opacity-20' : ''}`}
      />
    </div>
  );
}

/* ─────────────────────────────────────────
   Stats Bar Component
   ───────────────────────────────────────── */
function StatsSection() {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} className="w-full max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.04] rounded-2xl overflow-hidden border border-white/[0.04] backdrop-blur-md">
      {stats.map((s, i) => (
        <div key={s.label} className="bg-black/20 px-8 py-8 flex flex-col items-center text-center"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(20px)',
            transition: `all 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 0.08}s`,
          }}>
          <span className="text-3xl font-black text-white tracking-tight mb-1">
            {s.value}
          </span>
          <span className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   Step Card Component
   ───────────────────────────────────────── */
function StepCard({ s, index }: { s: typeof steps[0]; index: number }) {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} className="flex flex-col items-center text-center relative px-4"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(30px)',
        transition: `all 0.8s cubic-bezier(0.16,1,0.3,1) ${index * 0.15}s`,
      }}>
      <div className="relative mb-6">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-lg font-black text-white shadow-md shadow-indigo-500/10`}>
          {s.num}
        </div>
      </div>
      <h3 className="text-base font-bold text-white mb-2 tracking-tight">{s.title}</h3>
      <p className="text-neutral-500 leading-relaxed text-xs max-w-xs">{s.desc}</p>
    </div>
  );
}

/* ─────────────────────────────────────────
   Main Landing Page Component
   ───────────────────────────────────────── */
const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/20 overflow-x-hidden font-sans relative">
      
      {/* Grid background & Ambient Radial Glows */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Subtle grid layer */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }}
        />
        {/* Top-right blur blob */}
        <div className="absolute top-[-20%] right-[-10%] w-[60%] aspect-square rounded-full bg-indigo-600/[0.08] blur-[120px] pointer-events-none" />
        {/* Mid-left blur blob */}
        <div className="absolute top-[40%] left-[-20%] w-[50%] aspect-square rounded-full bg-pink-600/[0.05] blur-[140px] pointer-events-none" />
      </div>

      {/* ══════════════════════════════════
          STICKY NAVBAR
          ══════════════════════════════════ */}
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.04] bg-[#050505]/70 backdrop-blur-md transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Music2 size={16} className="text-white" />
            </div>
            <span className="text-base font-extrabold tracking-tight text-white">AI Moodify</span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-xs font-medium text-neutral-400 hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-xs font-medium text-neutral-400 hover:text-white transition-colors">How it Works</a>
            <a 
              href="https://github.com/Grindor92352/AI_Moodify_music-system" 
              target="_blank" 
              rel="noreferrer" 
              className="text-xs font-medium text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <GitBranch size={13} />
              GitHub
            </a>
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Link to="/signin" className="text-xs font-bold text-neutral-300 hover:text-white px-4 py-2 transition-colors">
              Log In
            </Link>
            <Link to="/signup" className="text-xs font-bold bg-white text-black hover:bg-neutral-200 px-4 py-2 rounded-lg transition-all shadow-sm">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════
          HERO SECTION
          ══════════════════════════════════ */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-24 md:py-32 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        
        {/* Left column: Headings and copy */}
        <div className="lg:col-span-7 space-y-6 text-left">
          {/* Sparkles Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5 bg-white/[0.02] backdrop-blur-md text-xs text-neutral-300 animate-fade-in-up">
            <Sparkles size={13} className="text-indigo-400" />
            <span className="font-semibold tracking-wide">On-Device Facial Emotion Classifier</span>
          </div>

          <h1 className="text-5xl md:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.05] animate-fade-in-up">
            Tune into your<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400">
              Emotions
            </span>
          </h1>

          <p className="text-base md:text-lg text-neutral-400 max-w-xl font-light leading-relaxed animate-fade-in-up">
            An AI-powered music therapy system that securely maps your facial expressions in real time to curate personalized Bollywood playlists. Local processing ensures full data privacy.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2 animate-fade-in-up">
            <Link to="/signup"
              className="group px-8 py-3.5 bg-white text-black rounded-full font-bold text-sm flex items-center gap-2 transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,255,255,0.15)]">
              Begin Session
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/signin"
              className="px-8 py-3.5 rounded-full font-bold text-sm text-neutral-300 hover:text-white border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:scale-[1.02] transition-all">
              Launch Dashboard
            </Link>
          </div>

          {/* Mini Trust Badges */}
          <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-white/[0.04] w-fit animate-fade-in-up">
            {trustBadges.map(b => (
              <span key={b.label} className="inline-flex items-center gap-1.5 text-xs text-neutral-500">
                <span className="text-indigo-400/80">{b.icon}</span>
                {b.label}
              </span>
            ))}
          </div>
        </div>

        {/* Right column: Sleek visual card/mockup */}
        <div className="lg:col-span-5 relative flex items-center justify-center pointer-events-none">
          {/* Subtle background glow */}
          <div className="absolute w-72 h-72 rounded-full bg-indigo-500/10 blur-[80px]" />
          
          {/* Glassmorphic Mockup Shell */}
          <div className="relative w-full max-w-[400px] aspect-square rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl p-6 shadow-2xl flex flex-col justify-between overflow-hidden">
            
            {/* Mockup Header */}
            <div className="flex items-center justify-between border-b border-white/[0.04] pb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">AI Active Scan</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
            </div>

            {/* Mockup Center: Headphones Floating Gently */}
            <div className="flex-1 flex items-center justify-center my-4 relative">
              <div className="animate-float-gentle">
                <img
                  src="/headphones.png"
                  alt="AI Therapy Headphones"
                  className="w-56 h-56 object-contain filter drop-shadow-[0_0_30px_rgba(99,102,241,0.25)]"
                />
              </div>

              {/* Floating Glass Indicators */}
              <div className="absolute top-2 left-2 px-3 py-1.5 rounded-xl border border-white/10 bg-black/60 backdrop-blur-md flex items-center gap-2 shadow-lg">
                <Camera size={12} className="text-indigo-400" />
                <span className="text-[9px] font-bold text-white uppercase tracking-wider">Webcam Ready</span>
              </div>

              <div className="absolute bottom-2 right-2 px-3 py-1.5 rounded-xl border border-white/10 bg-black/60 backdrop-blur-md flex items-center gap-2 shadow-lg">
                <Smile size={12} className="text-emerald-400" />
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">Mood: Calm</span>
              </div>
            </div>

            {/* Mockup Footer: Custom Equalizer Simulation */}
            <div className="flex items-center gap-1 h-6 px-2 justify-center border-t border-white/[0.04] pt-4">
              {[0.4, 0.9, 0.6, 0.8, 0.3, 0.7, 0.5, 0.9, 0.4, 0.6, 0.8, 0.3].map((val, i) => (
                <div 
                  key={i} 
                  className="w-1 bg-gradient-to-t from-indigo-500 to-pink-500 rounded-full"
                  style={{ 
                    height: `${val * 100}%`,
                    animation: `float-gentle ${1.2 + i * 0.15}s ease-in-out infinite alternate`
                  }} 
                />
              ))}
            </div>
          </div>
        </div>

      </section>

      {/* ══════════════════════════════════
          STATS SECTION
          ══════════════════════════════════ */}
      <section className="py-12 border-t border-white/[0.04] bg-gradient-to-b from-transparent to-[#070707]/30">
        <div className="max-w-6xl mx-auto px-6">
          <StatsSection />
        </div>
      </section>

      {/* ══════════════════════════════════
          FEATURES SECTION
          ══════════════════════════════════ */}
      <section id="features" className="py-24 max-w-6xl mx-auto px-6 relative">
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold tracking-[0.25em] text-indigo-400 uppercase mb-3 block">Technology</span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-white">
            Core Capabilities
          </h2>
          <p className="text-neutral-500 text-sm max-w-lg mx-auto leading-relaxed">
            Designed for privacy, powered by machine learning, and refined for your auditory comfort.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <FeatureCard key={f.title} f={f} index={i} />
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════
          HOW IT WORKS SECTION
          ══════════════════════════════════ */}
      <section id="how-it-works" className="py-24 bg-[#030303]/40 border-y border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-6">
          
          <div className="text-center mb-16">
            <span className="text-[10px] font-bold tracking-[0.25em] text-pink-400 uppercase mb-3 block">Simple Workflow</span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-white">How it Works</h2>
            <p className="text-neutral-500 text-sm max-w-xs mx-auto">Get calibrated in three simple steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 relative">
            {/* Connecting background line on desktop */}
            <div className="hidden md:block absolute top-[24px] left-[15%] right-[15%] h-px bg-gradient-to-r from-indigo-500/20 via-violet-500/20 to-pink-500/20 pointer-events-none z-0" />
            
            {steps.map((s, i) => (
              <StepCard key={s.num} s={s} index={i} />
            ))}
          </div>

          {/* CTA at steps end */}
          <div className="text-center mt-16">
            <Link to="/signup"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full font-bold text-sm text-white hover:scale-[1.02] transition-transform shadow-lg shadow-indigo-600/10">
              Start Your Scan
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          FOOTER SECTION
          ══════════════════════════════════ */}
      <footer className="bg-[#020202] border-t border-white/[0.04] pt-16 pb-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            
            {/* Left brand column */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Music2 size={14} className="text-white" />
                </div>
                <span className="text-base font-extrabold tracking-tight text-white">AI Moodify</span>
              </div>
              <p className="text-neutral-500 text-xs leading-relaxed max-w-xs">
                A localized music curation platform. Designed to process emotional metrics on-device for total security and zero cloud footprints.
              </p>
              
              {/* Social icons */}
              <div className="flex items-center gap-2 pt-2">
                {[
                  { icon: <GitBranch size={14} />, href: 'https://github.com/Grindor92352/AI_Moodify_music-system' },
                  { icon: <Share2 size={14} />, href: '#' },
                  { icon: <Camera size={14} />, href: '#' },
                ].map((s, i) => (
                  <a key={i} href={s.href} target="_blank" rel="noreferrer"
                    className="w-8 h-8 rounded-lg border border-white/5 bg-white/[0.02] flex items-center justify-center text-neutral-400 hover:text-white hover:border-white/20 hover:bg-white/[0.05] transition-all">
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Links column */}
            <div>
              <h4 className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 mb-4">Product</h4>
              <ul className="space-y-2.5 text-xs text-neutral-500">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>

            {/* Contact column */}
            <div>
              <h4 className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 mb-4">Contact</h4>
              <ul className="space-y-2.5 text-xs text-neutral-500">
                <li className="flex items-center gap-2">
                  <Mail size={12} className="text-indigo-400" />
                  support@aimoodify.io
                </li>
                <li className="flex items-center gap-2">
                  <MapPin size={12} className="text-indigo-400" />
                  Jaipur, Rajasthan, India
                </li>
              </ul>
            </div>
          </div>

          {/* Lower footer boundary */}
          <div className="border-t border-white/[0.04] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[10px] text-neutral-600">© {new Date().getFullYear()} AI Moodify. All rights reserved.</p>
            <p className="text-[10px] text-neutral-600 flex items-center gap-1.5">
              Built with <span className="text-pink-500/80">♥</span> using React, Node.js &amp; Python FastAPI
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
