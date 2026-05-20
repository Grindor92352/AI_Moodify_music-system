import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { Mail, Lock, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getApiErrorMessage } from '../types/music';

const SINGER_OPTIONS = [
  { id: 'arijit', name: 'Arijit Singh', img: 'https://i.scdn.co/image/ab6761610000e5eb0261696c5df3be99da6ed3f3' },
  { id: 'taylor', name: 'Taylor Swift', img: 'https://i.scdn.co/image/ab6761610000e5eb5a00969a4698c3132a15fbb0' },
  { id: 'ed', name: 'Ed Sheeran', img: 'https://i.scdn.co/image/ab6761610000e5eb12a2ef08d00dd7451a6dbed6' },
  { id: 'shreya', name: 'Shreya Ghoshal', img: 'https://i.scdn.co/image/ab6761610000e5eb3199859f77f24021200155b9' },
  { id: 'weeknd', name: 'The Weeknd', img: 'https://i.scdn.co/image/ab6761610000e5eb214f3cf1cbe7139c1e26ffbb' },
  { id: 'neha', name: 'Neha Kakkar', img: 'https://i.scdn.co/image/ab6761610000e5ebc1bf25785507ca6cf003ef76' }
];

const SignupPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [preferredSingers, setPreferredSingers] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleStepOneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return setError('Email and password required');
    setError('');
    setStep(2);
  };

  const toggleSinger = (singerName: string) => {
    if (preferredSingers.includes(singerName)) {
      setPreferredSingers(prev => prev.filter(s => s !== singerName));
    } else {
      setPreferredSingers(prev => [...prev, singerName]);
    }
  };

  const handleFinalSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const parsedAge = age.trim() ? parseInt(age, 10) : undefined;
      await api.post('/api/signup', { 
        email, 
        password,
        name: name.trim() || undefined,
        ...(parsedAge !== undefined && !Number.isNaN(parsedAge) ? { age: parsedAge } : {}),
        preferredSingers
      });
      await login();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Signup failed'));
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Background patterns */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }}
        />
        <div className="absolute top-[30%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[450px] aspect-square rounded-full bg-indigo-600/[0.06] blur-[100px]" />
      </div>

      {/* Glass Card Container */}
      <div className="relative z-10 w-full max-w-md bg-white/[0.02] border border-white/[0.05] backdrop-blur-2xl rounded-3xl p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-300">
        
        {/* Step Progress Indicators */}
        <div className="flex gap-2 mb-8">
          <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-indigo-500 shadow-sm shadow-indigo-500/50' : 'bg-white/10'}`} />
          <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-indigo-500 shadow-sm shadow-indigo-500/50' : 'bg-white/10'}`} />
        </div>

        {/* Title Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {step === 1 ? 'Create Account' : 'Taste Profiler'}
          </h2>
          <p className="text-neutral-400 text-xs mt-1.5 leading-relaxed">
            {step === 1 ? 'Join AI Moodify and start your therapy sessions.' : 'Tell us about your listening preferences.'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/10 text-red-400 text-xs text-center font-medium animate-in fade-in-50 duration-200">
            {error}
          </div>
        )}

        {/* STEP 1: CREDENTIALS */}
        {step === 1 ? (
          <form onSubmit={handleStepOneSubmit} className="space-y-4">
            
            {/* Email field */}
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-indigo-400 transition-colors" size={16} />
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email address" 
                className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/70 focus:bg-white/[0.04] transition-all"
              />
            </div>

            {/* Password field */}
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-indigo-400 transition-colors" size={16} />
              <input 
                type="password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password" 
                className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/70 focus:bg-white/[0.04] transition-all"
              />
            </div>

            {/* Next Step CTA */}
            <button 
              type="submit" 
              className="group w-full py-3 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-1.5"
            >
              Continue
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Divider */}
            <div className="mt-6 flex items-center gap-4 before:h-px before:flex-1 before:bg-white/[0.06] after:h-px after:flex-1 after:bg-white/[0.06]">
              <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Or continue with</span>
            </div>

            {/* Google Signup */}
            <button 
              type="button"
              onClick={() => {
                setError('Google sign-in is not configured yet');
              }}
              disabled={loading}
              className="mt-5 w-full py-2.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-neutral-300 hover:text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {loading ? 'Connecting...' : 'Sign up with Google'}
            </button>

            {/* Back to sign in */}
            <p className="mt-8 text-center text-xs text-neutral-400">
              Already have an account? <Link to="/signin" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">Log In</Link>
            </p>
          </form>
        ) : (
          /* STEP 2: PROFILE DETAILS & SINGERS */
          <div className="space-y-5 animate-in slide-in-from-right-8 duration-300">
            
            {/* Name and Age Input fields */}
            <div className="flex gap-3">
              <div className="w-2/3 relative group">
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="First name" 
                  className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-indigo-500/70 focus:bg-white/[0.04] transition-all"
                />
              </div>
              <div className="w-1/3 relative group">
                <input 
                  type="number" 
                  required
                  value={age}
                  onChange={e => setAge(e.target.value)}
                  placeholder="Age" 
                  className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-indigo-500/70 focus:bg-white/[0.04] transition-all"
                />
              </div>
            </div>
            
            {/* Preferred Singer selection grid */}
            <div>
              <p className="text-xs font-semibold text-neutral-400 mb-3 tracking-wide">Select your preferred artists</p>
              <div className="grid grid-cols-3 gap-3">
                {SINGER_OPTIONS.map(singer => {
                  const isSelected = preferredSingers.includes(singer.name);
                  return (
                    <div 
                      key={singer.id} 
                      onClick={() => toggleSinger(singer.name)}
                      className={`relative flex flex-col items-center gap-2 p-2.5 rounded-xl border transition-all duration-300 cursor-pointer ${
                        isSelected 
                          ? 'bg-indigo-600/10 border-indigo-500/50 shadow-lg shadow-indigo-500/5' 
                          : 'bg-transparent border-transparent hover:bg-white/5'
                      }`}
                    >
                      <div className="relative">
                        <img 
                          src={singer.img} 
                          alt={singer.name} 
                          className={`w-14 h-14 rounded-full object-cover border-2 transition-all duration-300 ${
                            isSelected ? 'border-indigo-500 scale-105' : 'border-white/10 hover:scale-105'
                          }`} 
                        />
                        {isSelected && (
                          <div className="absolute -bottom-0.5 -right-0.5 bg-indigo-500 w-5 h-5 rounded-full flex items-center justify-center border border-[#050505]">
                            <Check size={11} className="text-white" />
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-center text-neutral-300 font-semibold truncate w-full">{singer.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Complete Register CTA */}
            <button 
              onClick={handleFinalSubmit}
              disabled={loading || !name}
              className="w-full py-3.5 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-indigo-600/10 disabled:opacity-40"
            >
              {loading ? 'Registering...' : 'Complete Registration'}
            </button>

            {/* Back button */}
            <button 
              onClick={() => setStep(1)}
              className="w-full py-1 text-neutral-500 hover:text-neutral-300 text-xs transition-colors flex items-center justify-center gap-1"
            >
              <ArrowLeft size={13} /> Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignupPage;
