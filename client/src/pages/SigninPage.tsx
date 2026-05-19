import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Music } from 'lucide-react';

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
      await axios.post('http://localhost:5000/api/login', { email, password });
      login(); // The cookie is automatically stored; just update state
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-neutral-900/50 border border-neutral-800 backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-purple-600/20 text-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Music size={24} />
          </div>
          <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
          <p className="text-neutral-400 mt-2">Log in to continue your session</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={20} />
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email address" 
              className="w-full bg-black/50 border border-neutral-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-purple-500 transition-colors"
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
              className="w-full bg-black/50 border border-neutral-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
          
          <div className="flex justify-end">
            <a href="#" className="text-sm text-purple-400 hover:text-purple-300">Forgot Password?</a>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold transition-all disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="mt-6 flex items-center gap-4 before:h-px before:flex-1 before:bg-neutral-800 after:h-px after:flex-1 after:bg-neutral-800">
          <span className="text-xs text-neutral-500 uppercase">Or continue with</span>
        </div>

        <button 
          onClick={async () => {
            setLoading(true);
            try {
              // Real OAuth integration would redirect to the backend OAuth provider
              window.location.href = 'http://localhost:5000/api/auth/google';
            } catch (err) {
              setLoading(false);
            }
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
          {loading ? 'Connecting...' : 'Continue with Google'}
        </button>

        <p className="mt-8 text-center text-sm text-neutral-400">
          Don't have an account? <Link to="/signup" className="text-purple-400 hover:text-purple-300 font-semibold">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default SigninPage;
