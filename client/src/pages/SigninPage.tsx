import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { getApiErrorMessage } from '../types/music';
import { Mail, Lock, Music2, ArrowRight } from 'lucide-react';

const SigninPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/api/login', { email, password });
      await login(); // The cookie is automatically stored; verify before routing.
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Decorative Background Assets */}
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

      {/* Main Glass Card */}
      <div className="relative z-10 w-full max-w-md bg-white/[0.02] border border-white/[0.05] backdrop-blur-2xl rounded-3xl p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-300">
        
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Music2 size={20} className="text-white" />
            </div>
            <span className="text-lg font-black tracking-tight text-white">AI Moodify</span>
          </Link>
          <h2 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h2>
          <p className="text-neutral-400 text-xs mt-1.5 leading-relaxed">Log in to restore your sessions and library.</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/10 text-red-400 text-xs text-center font-medium animate-in fade-in-50 duration-200">
            {error}
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email Input */}
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

          {/* Password Input */}
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
          
          {/* Forgot Password link */}
          <div className="flex justify-end pt-1">
            <a href="#" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium">Forgot Password?</a>
          </div>

          {/* Submit CTA */}
          <button 
            type="submit" 
            disabled={loading}
            className="group w-full py-3 mt-2 bg-white hover:bg-neutral-200 text-black rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Sign In'}
            {!loading && <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />}
          </button>
        </form>

        {/* Divider */}
        <div className="mt-6 flex items-center gap-4 before:h-px before:flex-1 before:bg-white/[0.06] after:h-px after:flex-1 after:bg-white/[0.06]">
          <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Or continue with</span>
        </div>

        {/* Google OAuth Button */}
        <button 
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
          {loading ? 'Connecting...' : 'Continue with Google'}
        </button>

        {/* Footer Link */}
        <p className="mt-8 text-center text-xs text-neutral-400">
          Don't have an account? <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default SigninPage;
