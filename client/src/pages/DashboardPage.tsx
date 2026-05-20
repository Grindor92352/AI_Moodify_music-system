import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { Mic, Camera, Loader2, PlayCircle, Disc3, Sparkles, Headphones, Brain, Music } from 'lucide-react';

// Extend Window interface for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const baseBollywood = [
  { videoId: 'xGerv5FOk', title: 'Tum Hi Ho', artist: 'Arijit Singh' },
  { videoId: 'BddP6PYo2gs', title: 'Channa Mereya', artist: 'Arijit Singh' },
  { videoId: 'jfKfPfyJRdk', title: 'Kabira', artist: 'Tochi Raina' },
  { videoId: '5qap5aO4i9A', title: 'Iktara', artist: 'Kavita Seth' },
  { videoId: '1wYXwEcmpys', title: 'Gerua', artist: 'Arijit Singh' },
  { videoId: 'VdZpo0k4kH0', title: 'Zaalima', artist: 'Arijit Singh' },
  { videoId: 'tQjc6L3D7Y4', title: 'Ae Dil Hai Mushkil', artist: 'Arijit Singh' },
  { videoId: 'W7o7l2gZtI0', title: 'Nashe Si Chadh Gayi', artist: 'Arijit Singh' },
  { videoId: '6McsLVDLcdQ', title: 'Ghungroo', artist: 'Arijit Singh' },
  { videoId: 'PDbX-oP_O7g', title: 'Subhanallah', artist: 'Sreerama Chandra' }
];

const baseHollywood = [
  { videoId: 'RgKAFK5djSk', title: 'See You Again', artist: 'Wiz Khalifa' },
  { videoId: '09R8_2nJtjg', title: 'Sugar', artist: 'Maroon 5' },
  { videoId: 'kJQP7kiw5Fk', title: 'Despacito', artist: 'Luis Fonsi' },
  { videoId: 'fLexgOxsZu0', title: 'The Lazy Song', artist: 'Bruno Mars' },
  { videoId: 'JGwWNGJdvx8', title: 'Shape of You', artist: 'Ed Sheeran' },
  { videoId: 'OPf0YbXqDm0', title: 'Uptown Funk', artist: 'Mark Ronson' },
  { videoId: '0yW7w8F2TVA', title: 'Blank Space', artist: 'Taylor Swift' },
  { videoId: 'hT_nvWreIhg', title: 'Counting Stars', artist: 'OneRepublic' },
  { videoId: 'YQHsXMglC9A', title: 'Hello', artist: 'Adele' },
  { videoId: 'nfWlot6h_JM', title: 'Shake It Off', artist: 'Taylor Swift' }
];

const baseLofi = [
  { videoId: 'lTRiuFIWV54', title: 'Lofi Hip Hop Radio', artist: 'Lofi Girl' },
  { videoId: '5qap5aO4i9A', title: 'Iktara Lofi', artist: 'Kavita Seth' },
  { videoId: '1fueZCTYkpA', title: 'Chill Vibes', artist: 'ChilledCow' },
  { videoId: 'DWcJFNfaw9c', title: 'Late Night', artist: 'Lofi Boy' },
  { videoId: 'tfBVp0Zi2iE', title: 'Coffee Shop Radio', artist: 'STEEZYASFUCK' },
  { videoId: 'n61ULEU7CO0', title: 'Relaxing Lofi', artist: 'Chillhop Music' },
  { videoId: 'jfKfPfyJRdk', title: 'Kabira Lofi', artist: 'Tochi Raina' }
];

// Helper to fill an array up to a certain count
const fillTo50 = (baseArr: any[]) => {
  const result: any[] = [];
  while(result.length < 50) {
    result.push(...baseArr);
  }
  return result.slice(0, 50);
};

const mockCategories = {
  recent: fillTo50([...baseBollywood, ...baseHollywood].reverse()).slice(0, 20),
  explore: fillTo50([...baseHollywood, ...baseBollywood]).slice(0, 30),
  bollywood: fillTo50(baseBollywood),
  hollywood: fillTo50(baseHollywood),
  lofi: fillTo50(baseLofi)
};

const QUICK_MOODS = ['Happy', 'Calm', 'Sad', 'Anxious', 'Focused', 'Tired'];

const DashboardPage: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [moodText, setMoodText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isFetchingPlaylist, setIsFetchingPlaylist] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const displayName = user?.name || (user?.email ? user.email.split('@')[0] : 'there');
  const firstName = displayName.split(' ')[0]; // Just first name for greeting

  const startCamera = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err) {
      setError('Camera access denied or unavailable.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const handleCaptureAndAnalyze = async () => {
    if (!cameraActive) {
      await startCamera();
      return;
    }
    if (!videoRef.current || !canvasRef.current) return;
    
    setLoading(true);
    setError('');

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Canvas context failed');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64Image = canvas.toDataURL('image/jpeg', 0.85);

      const res = await axios.post('http://localhost:8000/analyze-frame', { 
        image_base64: base64Image 
      });

      if (res.data.error) throw new Error(res.data.error);

      stopCamera();

      // Hit node API to get songs for mood
      const nodeRes = await axios.post('http://localhost:5000/api/music/refresh', { mood: res.data.dominant_mood });
      
      // Save history to PostgreSQL database
      await saveHistory(res.data.dominant_mood, nodeRes.data.songs, nodeRes.data.videoIds);

      navigate('/results', { 
        state: { 
          mood: res.data.dominant_mood, 
          image: base64Image,
          songs: nodeRes.data.songs,
          videoIds: nodeRes.data.videoIds
        } 
      });

    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Analysis failed');
      setLoading(false);
    }
  };

  const handleTextAnalysis = async () => {
    if (!moodText.trim()) return;
    setLoading(true);
    setError('');

    try {
      const nodeRes = await axios.post('http://localhost:5000/api/music/refresh', { mood: moodText });
      await saveHistory(moodText, nodeRes.data.songs, nodeRes.data.videoIds);

      navigate('/results', {
        state: {
          mood: moodText,
          image: null,
          songs: nodeRes.data.songs,
          videoIds: nodeRes.data.videoIds
        }
      });
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Text analysis failed');
      setLoading(false);
    }
  };

  const handlePlaylistClick = async (playlistName: string, defaultSongs?: any[]) => {
    if (playlistName === 'Recently Listened') {
      try {
        const res = await axios.get('http://localhost:5000/api/history', { withCredentials: true });
        const history = res.data.history || [];
        if (history.length > 0) {
          // Flatten all songs from the history entries into one list
          const recentSongs = history.flatMap((h: any) => h.songs || []).slice(0, 20);
          navigate('/results', { state: { mood: 'Recently Listened', image: null, songs: recentSongs } });
        } else {
          alert("You haven't played any songs yet! Listen to some tracks first.");
        }
      } catch {
        alert("Could not fetch history. Please try again.");
      }
      return;
    }

    setIsFetchingPlaylist(true);
    try {
      let query = playlistName;
      if (playlistName === 'Your Favorites' && user?.preferredSingers?.length) {
         query = `Top songs by ${user.preferredSingers.join(' and ')}`;
      }
      
      const nodeRes = await axios.post('http://localhost:5000/api/music/refresh', { mood: query });
      // We explicitly DO NOT call saveHistory here, as per user request to only save camera/text/voice.
      
      navigate('/results', {
        state: {
          mood: playlistName,
          image: null,
          songs: nodeRes.data.songs,
          videoIds: nodeRes.data.videoIds
        }
      });
    } catch (err: any) {
      // Fallback to mock data if the API rate limits or fails
      navigate('/results', {
        state: {
          mood: playlistName,
          image: null,
          songs: defaultSongs || []
        }
      });
    } finally {
      setIsFetchingPlaylist(false);
    }
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setMoodText(transcript);
    };

    recognition.onerror = (event: any) => {
      setError('Speech recognition error: ' + event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const saveHistory = async (mood: string, songs: any[], videoIds?: string[]) => {
    try {
      await axios.post('http://localhost:5000/api/history/save', { mood, songs, videoIds }, { withCredentials: true });
    } catch (err) {
      // Fallback to localStorage if DB save fails (e.g. user not logged in)
      const history = JSON.parse(localStorage.getItem('moodify_history') || '[]');
      history.unshift({ id: Date.now(), date: new Date().toLocaleString(), mood, songs, videoIds, tracks: songs?.length || 0 });
      localStorage.setItem('moodify_history', JSON.stringify(history.slice(0, 50)));
    }
  };

  const useQuickMood = (mood: string) => {
    setMoodText(mood);
    setError('');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#050505] selection:bg-white/20 text-white animate-fade-in-up">
      {isFetchingPlaylist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
          <div className="flex flex-col items-center rounded-2xl border border-white/[0.08] bg-neutral-950 px-8 py-7 shadow-2xl">
             <div className="mb-4 h-10 w-10 rounded-full border-4 border-white/15 border-t-white animate-spin" />
             <h2 className="text-sm font-bold text-white tracking-[0.2em] uppercase">Curating Playlist</h2>
          </div>
        </div>
      )}

      <Sidebar />
      <main className="min-h-0 flex-1 overflow-y-auto custom-scrollbar">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-7 lg:px-10 lg:py-9">
          <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-emerald-400">Dashboard</p>
              <h1 className="text-3xl font-extrabold tracking-tight text-white lg:text-5xl">Good to see you, {firstName}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400 lg:text-base">
                Check your mood, describe what you need, or open a playlist. Everything here should move you toward music, not clutter the page.
              </p>
            </div>
            <button
              onClick={() => document.getElementById('mood-input')?.focus()}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/[0.08] bg-white px-4 py-3 text-sm font-bold text-black transition-all hover:bg-neutral-200"
            >
              <Sparkles size={16} />
              Quick Mood
            </button>
          </header>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
            <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-neutral-950 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
                <div>
                  <h2 className="text-lg font-bold text-white">Mood Check</h2>
                  <p className="mt-1 text-xs text-neutral-500">Use camera, voice, or text to create a playlist.</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
                  <Disc3 size={20} />
                </div>
              </div>

              <div className="flex flex-col gap-5 p-5">
                <div className="relative aspect-video max-h-[420px] overflow-hidden rounded-xl border border-white/[0.08] bg-black">
                  {error && <div className="absolute left-4 right-4 top-4 z-10 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}
                  
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className={`h-full w-full object-cover transform -scale-x-100 ${cameraActive ? 'opacity-100' : 'opacity-0'}`}
                  />
                  <canvas ref={canvasRef} className="hidden" />

                  {!cameraActive && !loading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
                        <Camera size={30} />
                      </div>
                      <p className="text-base font-bold text-white">Visual mood scan</p>
                      <p className="mt-2 max-w-sm text-sm leading-6 text-neutral-500">Turn on your camera, then take one snapshot. The app detects a mood and builds a playlist from it.</p>
                      <div className="mt-5 grid w-full max-w-md grid-cols-3 gap-2">
                        <MiniStep icon={<Camera size={15} />} label="Capture" />
                        <MiniStep icon={<Brain size={15} />} label="Analyze" />
                        <MiniStep icon={<Music size={15} />} label="Play" />
                      </div>
                    </div>
                  )}

                  {loading && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 text-white backdrop-blur-sm">
                      <Loader2 size={38} className="mb-4 animate-spin text-emerald-300" />
                      <p className="text-sm font-bold uppercase tracking-[0.2em] text-neutral-300">Analyzing</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-4 rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-500">Text or Voice</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {QUICK_MOODS.map(mood => (
                        <button
                          key={mood}
                          type="button"
                          onClick={() => useQuickMood(mood)}
                          className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                            moodText === mood
                              ? 'border-emerald-400/40 bg-emerald-400/15 text-emerald-200'
                              : 'border-white/[0.08] bg-white/[0.04] text-neutral-400 hover:bg-white/[0.08] hover:text-white'
                          }`}
                        >
                          {mood}
                        </button>
                      ))}
                    </div>
                    <textarea
                      id="mood-input"
                      value={moodText}
                      onChange={e => setMoodText(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleTextAnalysis();
                        }
                      }}
                      placeholder="I feel calm but tired..."
                      className="mt-3 min-h-24 w-full resize-none rounded-xl border border-white/[0.08] bg-black/40 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-neutral-600 focus:border-emerald-400/50"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 sm:max-w-md">
                    <button 
                      onClick={handleVoiceInput}
                      className={`flex items-center justify-center rounded-xl border border-white/[0.08] py-3 transition-all ${isListening ? 'bg-red-500/15 text-red-300' : 'bg-white/[0.04] text-neutral-300 hover:bg-white/[0.08] hover:text-white'}`}
                      title="Voice Input"
                    >
                      <Mic size={18} />
                    </button>
                    <button 
                      onClick={handleTextAnalysis}
                      disabled={loading || !moodText.trim()}
                      className="flex items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] py-3 text-neutral-300 transition-all hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                      title="Search via Text"
                    >
                      <PlayCircle size={18} />
                    </button>
                    <button 
                      onClick={handleCaptureAndAnalyze}
                      disabled={loading}
                      className="flex items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-bold text-black transition-all hover:bg-neutral-200 disabled:opacity-50"
                    >
                      <Camera size={17} />
                      {cameraActive ? 'Snap' : 'Cam'}
                    </button>
                  </div>
                  <p className="text-xs leading-5 text-neutral-600">Text and voice moods are saved to history after a playlist is created.</p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-white/[0.08] bg-neutral-950 p-5 shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Playlists</h2>
                  <p className="mt-1 text-xs text-neutral-500">Live search when available, category fallback otherwise.</p>
                </div>
                <Headphones className="text-neutral-500" size={22} />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {user?.preferredSingers && user.preferredSingers.length > 0 && (
                  <PlaylistCard onClick={() => handlePlaylistClick('Your Favorites', mockCategories.explore)} title="Your Favorites" subtitle="Based on your top artists" gradient="from-amber-400 to-orange-500" glow="rgba(251,191,36,0.22)" />
                )}
                <PlaylistCard onClick={() => handlePlaylistClick('Recently Listened')} title="Recently Listened" subtitle="From your saved sessions" gradient="from-indigo-400 to-violet-500" glow="rgba(129,140,248,0.22)" />
                <PlaylistCard onClick={() => handlePlaylistClick('Explore New', mockCategories.explore)} title="Explore New" subtitle="Fresh mixed picks" gradient="from-emerald-400 to-teal-500" glow="rgba(52,211,153,0.22)" />
                <PlaylistCard onClick={() => handlePlaylistClick('Bollywood Chartbusters', mockCategories.bollywood)} title="Bollywood Chartbusters" subtitle="Hindi hits and crowd favorites" gradient="from-pink-400 to-rose-500" glow="rgba(244,114,182,0.22)" />
                <PlaylistCard onClick={() => handlePlaylistClick('Hollywood Chartbusters', mockCategories.hollywood)} title="Hollywood Chartbusters" subtitle="Global pop picks" gradient="from-sky-400 to-blue-500" glow="rgba(56,189,248,0.22)" />
                <PlaylistCard onClick={() => handlePlaylistClick('Lofi Beats', mockCategories.lofi)} title="Lofi Beats" subtitle="Relax and focus" gradient="from-slate-400 to-neutral-500" glow="rgba(148,163,184,0.18)" />
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

const PlaylistCard = ({ title, subtitle, gradient, glow, onClick, span2 = false }: {
  title: string; subtitle: string; gradient: string; glow: string;
  onClick?: () => void; span2?: boolean;
}) => {
  const [hov, setHov] = React.useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className={`relative p-5 rounded-2xl border cursor-pointer overflow-hidden transition-all duration-300 ${span2 ? 'md:col-span-2' : ''}`}
      style={{
        borderColor: hov ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)',
        background: hov ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
        boxShadow: hov ? `0 6px 30px ${glow}` : 'none',
        transform: hov ? 'translateY(-2px)' : 'none',
      }}
    >
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-gradient-to-b ${gradient}`} style={{ opacity: hov ? 1 : 0.4 }} />
      <div className="pl-3">
        <h3 className="text-white font-bold text-base">{title}</h3>
        <p className="text-neutral-500 text-xs mt-1">{subtitle}</p>
        <div className={`mt-4 w-9 h-9 rounded-xl flex items-center justify-center text-white bg-gradient-to-br ${gradient} transition-all duration-300`}
          style={{ boxShadow: hov ? `0 4px 15px ${glow}` : 'none' }}>
          <PlayCircle size={17} />
        </div>
      </div>
    </div>
  );
};

const MiniStep = ({ icon, label }: {
  icon: React.ReactNode;
  label: string;
}) => (
  <div className="flex flex-col items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-3">
    <div className="text-emerald-300">{icon}</div>
    <span className="text-[11px] font-semibold text-neutral-400">{label}</span>
  </div>
);

export default DashboardPage;
