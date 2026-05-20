import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, ArrowRight, Brain, Music2, History,
  Mail, MapPin, Phone, GitBranch, Share2, Camera,
  ChevronDown, Shield, Zap, HeartPulse
} from 'lucide-react';

/* ─────────────────────────────────────────
   Intersection-Observer hook for scroll reveals
───────────────────────────────────────── */
function useReveal(threshold = 0.15) {
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
    icon: <Brain size={28} />,
    accent: 'from-violet-600 to-purple-500',
    glow: 'rgba(139,92,246,0.4)',
    glowHover: '0 8px 60px rgba(139,92,246,0.4)',
    tag: 'AI-Powered',
    title: 'Live Facial Emotion Detection',
    desc: 'Our on-device CNN model reads 48 facial landmarks in milliseconds, privately detecting Happiness, Sadness, Anger, Anxiety and more — all without any data leaving your machine.',
    img: '/feature_face.png',
  },
  {
    icon: <Music2 size={28} />,
    accent: 'from-pink-600 to-rose-500',
    glow: 'rgba(236,72,153,0.4)',
    glowHover: '0 8px 60px rgba(236,72,153,0.4)',
    tag: 'YouTube Integration',
    title: 'Intelligent Dynamic Curation',
    desc: 'Every session generates a fresh playlist via live YouTube Data API v3 queries. No two moods produce the same mix — the music always evolves as you do.',
    img: '/feature_music.png',
  },
  {
    icon: <History size={28} />,
    accent: 'from-cyan-500 to-blue-500',
    glow: 'rgba(6,182,212,0.4)',
    glowHover: '0 8px 60px rgba(6,182,212,0.4)',
    tag: 'Persistent Memory',
    title: 'Seamless Emotional Tracking',
    desc: 'Your full mood and listening history is stored securely in PostgreSQL. Revisit your emotional journey, replay your favourite therapeutic tracks, and understand your emotional patterns.',
    img: '/feature_history.png',
  },
];

const stats = [
  { value: '48', suffix: '', label: 'Facial Landmarks' },
  { value: '100', suffix: '+', label: 'Concurrent Users' },
  { value: '5', suffix: '', label: 'Core Moods Mapped' },
  { value: '0', suffix: '', label: 'Data Sent Externally' },
];

const steps = [
  {
    num: '01',
    color: 'from-indigo-500 to-violet-500',
    glow: 'rgba(99,102,241,0.45)',
    title: 'Open Your Camera',
    desc: 'Click "Detect My Mood" and allow camera access. Our local AI model initialises instantly — no data is ever uploaded.',
  },
  {
    num: '02',
    color: 'from-violet-500 to-pink-500',
    glow: 'rgba(236,72,153,0.45)',
    title: 'AI Reads Your Face',
    desc: 'Our CNN captures one frame, detects facial landmarks, applies histogram equalisation for lighting accuracy, and decodes your dominant emotion.',
  },
  {
    num: '03',
    color: 'from-pink-500 to-orange-400',
    glow: 'rgba(251,146,60,0.45)',
    title: 'Your Playlist Appears',
    desc: 'The system maps your mood to a live YouTube query and instantly generates a fresh Bollywood playlist — ready to play in one click.',
  },
];

const trustBadges = [
  { icon: <Shield size={14} />, label: 'Private & Local AI' },
  { icon: <Zap size={14} />, label: 'Real-Time Detection' },
  { icon: <HeartPulse size={14} />, label: 'Mood Therapeutic' },
];

/* ─────────────────────────────────────────
   Feature Card
───────────────────────────────────────── */
function FeatureCard({ f, index }: { f: typeof features[0]; index: number }) {
  const { ref, visible } = useReveal();
  const [hovered, setHovered] = useState(false);
  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl overflow-hidden cursor-default"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? (hovered ? 'translateY(-8px)' : 'translateY(0)') : 'translateY(60px)',
        transition: `opacity 0.7s ease ${index * 0.15}s, transform 0.5s cubic-bezier(0.16,1,0.3,1)`,
        boxShadow: hovered ? f.glowHover : '0 0 0 rgba(0,0,0,0)',
        borderColor: hovered ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)',
      }}
    >
      {/* Image strip */}
      <div className="relative h-52 overflow-hidden bg-black/40 flex items-center justify-center">
        <img
          src={f.img}
          alt={f.title}
          className="w-full h-full object-contain"
          style={{
            mixBlendMode: 'screen',
            filter: `drop-shadow(0 0 30px ${f.glow})`,
            transform: hovered ? 'scale(1.06)' : 'scale(0.92)',
            transition: 'transform 0.6s ease',
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#090909] to-transparent" />
      </div>

      {/* Content */}
      <div className="p-7">
        <div className="flex items-center gap-3 mb-5">
          <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${f.accent} flex items-center justify-center text-white shadow-lg`}>
            {f.icon}
          </div>
          <span className={`text-xs font-bold tracking-widest uppercase bg-gradient-to-r ${f.accent} bg-clip-text text-transparent`}>
            {f.tag}
          </span>
        </div>
        <h3 className="text-xl font-bold text-white mb-3 leading-snug">{f.title}</h3>
        <p className="text-neutral-400 text-[15px] leading-relaxed">{f.desc}</p>
      </div>

      {/* Bottom animated border */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r ${f.accent}`}
        style={{ opacity: hovered ? 1 : 0, transition: 'opacity 0.4s ease' }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────
   Stats Bar
───────────────────────────────────────── */
function StatsBar() {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} className="w-full max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.05] rounded-3xl overflow-hidden border border-white/[0.05]">
      {stats.map((s, i) => (
        <div key={s.label} className="bg-[#080808] px-8 py-10 flex flex-col items-center text-center"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(30px)',
            transition: `all 0.6s ease ${i * 0.1}s`,
          }}>
          <span className="text-5xl font-black text-white tracking-tighter mb-2">
            {s.value}<span className="text-indigo-400">{s.suffix}</span>
          </span>
          <span className="text-xs text-neutral-500 font-semibold uppercase tracking-widest">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   Features Section Header
───────────────────────────────────────── */
function FeaturesHeader() {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} className="text-center mb-20"
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(40px)', transition: 'all 0.8s ease' }}>
      <span className="text-xs font-bold tracking-[0.3em] text-indigo-400 uppercase mb-4 block">Core Capabilities</span>
      <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-6">
        Everything you need to<br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">feel the music</span>
      </h2>
      <p className="text-neutral-500 text-xl max-w-2xl mx-auto leading-relaxed">
        Three powerful systems working in perfect harmony, designed around your emotional wellbeing.
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────
   How It Works Section
───────────────────────────────────────── */
function HowItWorksHeader() {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} className="text-center mb-20"
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(40px)', transition: 'all 0.8s ease' }}>
      <span className="text-xs font-bold tracking-[0.3em] text-pink-400 uppercase mb-4 block">Simple by Design</span>
      <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-4">How it Works</h2>
      <p className="text-neutral-500 text-xl max-w-xl mx-auto">Three effortless steps to musical harmony.</p>
    </div>
  );
}

function StepCard({ s, index }: { s: typeof steps[0]; index: number }) {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} className="flex flex-col items-center text-center"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(50px)',
        transition: `all 0.8s cubic-bezier(0.16,1,0.3,1) ${index * 0.2}s`,
      }}>
      <div className="relative mb-8">
        <div className={`w-28 h-28 rounded-full bg-gradient-to-br ${s.color} flex items-center justify-center text-4xl font-black text-white`}
          style={{ boxShadow: `0 0 50px ${s.glow}, 0 0 100px ${s.glow}30` }}>
          {s.num}
        </div>
      </div>
      <h3 className="text-xl font-bold mb-3">{s.title}</h3>
      <p className="text-neutral-500 leading-relaxed text-[15px] max-w-xs">{s.desc}</p>
    </div>
  );
}

/* ─────────────────────────────────────────
   Main Landing Page
───────────────────────────────────────── */
const LandingPage: React.FC = () => {
  return (
    <div className="bg-[#050505] text-white selection:bg-indigo-500/30 overflow-x-hidden">

      {/* ══════════════════════════════════
          HERO
      ══════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6">

        {/* Ambient blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-300px] left-[-300px] w-[800px] h-[800px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)' }} />
          <div className="absolute bottom-[-300px] right-[-300px] w-[800px] h-[800px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)' }} />
        </div>

        {/* 3D headphone — ONLY the headphone rotates, text is 100% static */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ perspective: '1200px' }}>
          {/* Ambient glow ring behind the headphone */}
          <div className="absolute w-[600px] h-[600px] rounded-full animate-glow-pulse"
            style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.20) 0%, rgba(139,92,246,0.08) 50%, transparent 75%)' }} />
          {/* Headphone with Y-axis 3D spin */}
          <div className="animate-headphone-spin" style={{ transformStyle: 'preserve-3d' }}>
            <img
              src="/headphones.png"
              alt="3D Headphones"
              className="w-[600px] h-[600px] object-contain"
              style={{
                opacity: 0.65,
                filter: 'drop-shadow(0 0 80px rgba(99,102,241,0.6)) drop-shadow(0 0 30px rgba(139,92,246,0.45)) brightness(1.1) saturate(1.2)',
              }}
            />
          </div>
        </div>

        {/* Foreground text — completely static, no mouse tracking */}
        <div className="relative z-10 w-full max-w-5xl text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-md text-sm text-neutral-300 animate-fade-in-up">
            <Sparkles size={16} className="text-indigo-400" />
            <span className="font-semibold tracking-wide">The Future of Emotional Therapy</span>
          </div>

          {/* Main headline */}
          <h1
            className="text-7xl md:text-8xl lg:text-[100px] font-black tracking-tighter leading-[1.0] animate-fade-in-up"
            style={{ animationDelay: '0.1s', opacity: 0 }}
          >
            Tune into<br />
            <span
              className="animate-gradient-text bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400"
              style={{ backgroundSize: '200% 200%' }}
            >
              your Emotions
            </span>
          </h1>

          <p
            className="text-xl md:text-2xl text-neutral-400 max-w-2xl mx-auto font-light leading-relaxed animate-fade-in-up"
            style={{ animationDelay: '0.2s', opacity: 0 }}
          >
            AI Moodify reads your face, decodes your mood, and curates a perfectly matched Bollywood playlist — all in real time, all on your device.
          </p>

          {/* Trust badges */}
          <div
            className="flex flex-wrap items-center justify-center gap-3 animate-fade-in-up"
            style={{ animationDelay: '0.3s', opacity: 0 }}
          >
            {trustBadges.map(b => (
              <span key={b.label} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.03] text-sm text-neutral-400">
                <span className="text-indigo-400">{b.icon}</span>{b.label}
              </span>
            ))}
          </div>

          {/* CTA */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-fade-in-up"
            style={{ animationDelay: '0.4s', opacity: 0 }}
          >
            <Link to="/signup"
              className="group px-10 py-4 bg-white text-black rounded-full font-bold text-lg flex items-center gap-3 transition-all hover:scale-105 hover:shadow-[0_0_50px_rgba(255,255,255,0.25)]">
              Get Started
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/signin"
              className="px-10 py-4 rounded-full font-bold text-lg text-white border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] hover:scale-105 transition-all">
              Log In
            </Link>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="animate-scroll-bounce absolute bottom-10 left-1/2 flex flex-col items-center gap-2">
          <span className="text-[10px] tracking-[0.3em] font-bold uppercase text-neutral-600">Scroll</span>
          <ChevronDown size={18} className="text-neutral-700" />
        </div>
      </section>

      {/* ══════════════════════════════════
          STATS BAR
      ══════════════════════════════════ */}
      <section className="py-6 px-6 border-y border-white/[0.05]">
        <StatsBar />
      </section>

      {/* ══════════════════════════════════
          FEATURES
      ══════════════════════════════════ */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <FeaturesHeader />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => <FeatureCard key={f.title} f={f} index={i} />)}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════ */}
      <section className="py-32 px-6 bg-[#030303]">
        <div className="max-w-6xl mx-auto">
          <HowItWorksHeader />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-14 left-[16.6%] right-[16.6%] h-px bg-gradient-to-r from-indigo-500/30 via-violet-500/30 to-pink-500/30" />
            {steps.map((s, i) => <StepCard key={s.num} s={s} index={i} />)}
          </div>
          <div className="text-center mt-20">
            <Link to="/signup"
              className="group inline-flex items-center gap-3 px-12 py-5 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full font-bold text-lg text-white hover:scale-105 transition-transform shadow-[0_0_60px_rgba(99,102,241,0.4)] hover:shadow-[0_0_80px_rgba(99,102,241,0.6)]">
              Start for Free
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          FOOTER
      ══════════════════════════════════ */}
      <footer className="border-t border-white/[0.06] bg-[#020202] pt-20 pb-10 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-5">
                <img src="/logo.png" alt="Moodify Logo" className="w-9 h-9 object-contain"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                <span className="text-2xl font-black tracking-tighter">AI Moodify</span>
              </div>
              <p className="text-neutral-500 text-[15px] leading-relaxed max-w-sm mb-6">
                The next-generation emotional music therapy platform. Powered by on-device AI — your data never leaves your machine.
              </p>
              <div className="flex items-center gap-3">
                {[
                  { icon: <GitBranch size={17} />, href: 'https://github.com/Grindor92352/AI_Moodify_music-system' },
                  { icon: <Share2 size={17} />, href: '#' },
                  { icon: <Camera size={17} />, href: '#' },
                ].map((s, i) => (
                  <a key={i} href={s.href} target="_blank" rel="noreferrer"
                    className="w-10 h-10 rounded-xl border border-white/10 bg-white/[0.04] flex items-center justify-center text-neutral-400 hover:text-white hover:border-white/30 hover:bg-white/[0.08] transition-all">
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-xs font-bold tracking-widest uppercase text-neutral-400 mb-5">Product</h4>
              <ul className="space-y-3">
                {['Features', 'How it Works', 'Privacy Policy', 'Open Source'].map(l => (
                  <li key={l}><a href="#" className="text-neutral-500 hover:text-white text-[15px] transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-xs font-bold tracking-widest uppercase text-neutral-400 mb-5">Contact</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-neutral-500 text-[15px]">
                  <Mail size={15} className="text-indigo-400 mt-0.5 shrink-0" />
                  support@aimoodify.io
                </li>
                <li className="flex items-start gap-3 text-neutral-500 text-[15px]">
                  <Phone size={15} className="text-indigo-400 mt-0.5 shrink-0" />
                  +91 98765 43210
                </li>
                <li className="flex items-start gap-3 text-neutral-500 text-[15px]">
                  <MapPin size={15} className="text-indigo-400 mt-0.5 shrink-0" />
                  Jaipur, Rajasthan, India
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/[0.06] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-neutral-700 text-sm">© {new Date().getFullYear()} AI Moodify. All rights reserved.</p>
            <p className="text-neutral-700 text-sm flex items-center gap-2">
              Built with <span className="text-red-500/70">♥</span> using React, Node.js &amp; Python FastAPI
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
