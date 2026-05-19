import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, User, Check, ArrowRight } from 'lucide-react';

const SINGER_OPTIONS = [
  { id: 'arijit', name: 'Arijit Singh', img: 'https://i.scdn.co/image/ab6761610000e5eb0261696c5df3be99da6ed3f3' },
  { id: 'taylor', name: 'Taylor Swift', img: 'https://i.scdn.co/image/ab6761610000e5eb5a00969a4698c3132a15fbb0' },
  { id: 'ed', name: 'Ed Sheeran', img: 'https://i.scdn.co/image/ab6761610000e5eb12a2ef08d00dd7451a6dbed6' },
  { id: 'shreya', name: 'Shreya Ghoshal', img: 'https://ui-avatars.com/api/?name=Shreya+Ghoshal&background=random&color=fff&size=256' },
  { id: 'weeknd', name: 'The Weeknd', img: 'https://i.scdn.co/image/ab6761610000e5eb214f3cf1cbe7139c1e26ffbb' },
  { id: 'neha', name: 'Neha Kakkar', img: 'https://ui-avatars.com/api/?name=Neha+Kakkar&background=random&color=fff&size=256' }
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
  const navigate = useNavigate();

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
      await axios.post('http://localhost:5000/api/signup', { 
        email, 
        password,
        name,
        age: parseInt(age),
        preferredSingers
      });
      navigate('/signin');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Signup failed');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-neutral-900/50 border border-neutral-800 backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-600/20 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <User size={24} />
          </div>
          <h2 className="text-3xl font-bold text-white">{step === 1 ? 'Create Account' : 'Build Profile'}</h2>
          <p className="text-neutral-400 mt-2">{step === 1 ? 'Join AI Moodify today' : 'Tell us about your taste'}</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm text-center">{error}</div>}

        {step === 1 ? (
          <form onSubmit={handleStepOneSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={20} />
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email address" 
                className="w-full bg-black/50 border border-neutral-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={20} />
              <input 
                type="password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password" 
                className="w-full bg-black/50 border border-neutral-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <button 
              type="submit" 
              className="w-full py-3.5 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              Next Step <ArrowRight size={18} />
            </button>

            <div className="mt-6 flex items-center gap-4 before:h-px before:flex-1 before:bg-neutral-800 after:h-px after:flex-1 after:bg-neutral-800">
              <span className="text-xs text-neutral-500 uppercase">Or continue with</span>
            </div>

            <button 
              type="button"
              onClick={() => {
                setLoading(true);
                window.location.href = 'http://localhost:5000/api/auth/google';
              }}
              disabled={loading}
              className="mt-6 w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {loading ? 'Connecting...' : 'Sign up with Google'}
            </button>

            <p className="mt-8 text-center text-sm text-neutral-400">
              Already have an account? <Link to="/signin" className="text-indigo-400 hover:text-indigo-300 font-semibold">Log In</Link>
            </p>
          </form>
        ) : (
          <div className="space-y-5">
            <div className="flex gap-3">
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="First Name" 
                className="w-2/3 bg-black/50 border border-neutral-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <input 
                type="number" 
                value={age}
                onChange={e => setAge(e.target.value)}
                placeholder="Age" 
                className="w-1/3 bg-black/50 border border-neutral-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            
            <div>
              <p className="text-sm text-neutral-400 mb-3">Select your preferred singers</p>
              <div className="grid grid-cols-3 gap-3">
                {SINGER_OPTIONS.map(singer => {
                  const isSelected = preferredSingers.includes(singer.name);
                  return (
                    <div 
                      key={singer.id} 
                      onClick={() => toggleSinger(singer.name)}
                      className={`relative flex flex-col items-center gap-2 p-2 rounded-xl border transition-all cursor-pointer ${isSelected ? 'bg-indigo-600/20 border-indigo-500' : 'bg-transparent border-transparent hover:bg-white/5'}`}
                    >
                      <div className="relative">
                        <img src={singer.img} alt={singer.name} className={`w-14 h-14 rounded-full object-cover border-2 transition-all ${isSelected ? 'border-indigo-400' : 'border-transparent'}`} />
                        {isSelected && (
                          <div className="absolute -bottom-1 -right-1 bg-indigo-500 w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#050505]">
                            <Check size={12} className="text-white" />
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-center text-neutral-300 font-medium">{singer.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <button 
              onClick={handleFinalSubmit}
              disabled={loading || !name}
              className="w-full py-3.5 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-all disabled:opacity-50"
            >
              {loading ? 'Finishing...' : 'Complete Registration'}
            </button>
            <button 
              onClick={() => setStep(1)}
              className="w-full py-2 text-neutral-500 hover:text-white text-sm transition-colors"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignupPage;
