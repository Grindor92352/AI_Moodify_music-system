import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import MusicPlayer from '../components/MusicPlayer';
import { useAuth } from '../context/AuthContext';
import { Mic, Camera, Loader2, PlayCircle, Disc3 } from 'lucide-react';

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

const ProfilePage: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [moodText, setMoodText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showLofiBanner, setShowLofiBanner] = useState(true);
  const [isFetchingPlaylist, setIsFetchingPlaylist] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let animationFrameId: number;
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        setMousePos({ x, y });
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : user?.email ? user.email.charAt(0).toUpperCase() : 'U';

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

  return (
    <div className="flex min-h-screen bg-[#050505] selection:bg-white/20 text-white animate-fade-in-up relative">
      {isFetchingPlaylist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in-up">
          <div className="flex flex-col items-center">
             <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4" />
             <h2 className="text-xl font-bold text-white tracking-widest uppercase">Curating Playlist...</h2>
          </div>
        </div>
      )}
      {/* 3D Parallax Background Effect */}
      <div 
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 flex items-center justify-center pointer-events-none transition-transform duration-700 ease-out"
        style={{ transform: `translate(calc(-50% + ${mousePos.x * -40}px), calc(-50% + ${mousePos.y * -40}px)) scale(1.1)` }}
      >
        {/* Soft radial glow behind headphone */}
        <div className="absolute w-[900px] h-[900px] rounded-full" style={{ background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.13) 0%, rgba(139,92,246,0.07) 45%, transparent 75%)' }} />
        <img 
          src="/headphones.png" 
          alt="3D Background" 
          className="w-[1200px] h-[1200px] object-contain"
          style={{ opacity: 0.28, filter: 'drop-shadow(0 0 60px rgba(139,92,246,0.4)) drop-shadow(0 0 20px rgba(99,102,241,0.3)) brightness(1.15) saturate(1.3)' }}
        />
      </div>

      <Sidebar />
      <main className="flex-1 p-10 flex flex-col items-center custom-scrollbar overflow-y-auto relative z-10 transition-transform duration-500 ease-out" style={{ transform: `translate(${mousePos.x * 10}px, ${mousePos.y * 10}px)` }}>
        <header className="w-full max-w-5xl mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold mb-2">Your Profile</h1>
            <p className="text-neutral-400 text-lg">Let's tune into your emotions today.</p>
          </div>
          <div className="relative group">
            <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center text-lg font-bold shadow-lg cursor-pointer">
              {userInitial}
            </div>
            <div className="absolute right-0 mt-2 w-32 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-xl">
                Logout
              </button>
            </div>
          </div>
        </header>

        {showLofiBanner && (
          <div className="w-full max-w-5xl mb-8 bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between shadow-lg gap-4 animate-fade-in-up">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-neutral-900 rounded-full flex items-center justify-center text-neutral-300 flex-shrink-0 border border-neutral-800">
                <Disc3 size={20} />
              </div>
              <div>
                <h3 className="font-bold text-white">Need to relax and focus?</h3>
                <p className="text-sm text-neutral-300">Would you like to listen to 10 calming Lofi songs right now?</p>
              </div>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <button onClick={() => setShowLofiBanner(false)} className="px-4 py-2 text-sm text-neutral-500 hover:text-white transition-colors">Maybe Later</button>
              <button onClick={() => navigate('/results', { state: { mood: 'Lofi Beats', image: null, songs: mockCategories.lofi.slice(0, 10) } })} className="px-5 py-2 bg-white hover:bg-neutral-200 text-black rounded-xl text-sm font-bold shadow-lg transition-all">Sure, let's play</button>
            </div>
          </div>
        )}

        <div className="w-full max-w-5xl grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12 animate-fade-in-up">
          {/* Analysis Card */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col gap-6">
            <h2 className="text-xl font-bold flex items-center gap-2"><Disc3 className="text-neutral-400" /> AI Detection</h2>
            
            <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-neutral-800 flex items-center justify-center">
              {error && <div className="absolute top-4 left-4 right-4 z-10 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">{error}</div>}
              
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className={`w-full h-full object-cover transform -scale-x-100 ${cameraActive ? 'opacity-100' : 'opacity-0'}`}
              />
              <canvas ref={canvasRef} className="hidden" />

              {!cameraActive && !loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-600">
                  <Camera size={40} className="mb-3 opacity-50" />
                  <p>Ready for Visual Analysis</p>
                </div>
              )}

              {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/80 backdrop-blur-sm z-20">
                  <Loader2 size={40} className="animate-spin text-white mb-4" />
                  <p className="font-medium tracking-wide animate-pulse">Analyzing...</p>
                </div>
              )}
            </div>

            <div className="bg-black/50 border border-neutral-800 rounded-2xl p-2 pl-4 flex items-center gap-3">
              <input 
                type="text" 
                value={moodText}
                onChange={e => setMoodText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleTextAnalysis()}
                placeholder="How are you feeling?" 
                className="flex-1 bg-transparent border-none text-white focus:outline-none placeholder:text-neutral-500"
              />
              <button 
                onClick={handleVoiceInput}
                className={`p-3 rounded-xl transition-all ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`}
                title="Voice Input"
              >
                <Mic size={20} />
              </button>
              <button 
                onClick={handleTextAnalysis}
                disabled={loading || !moodText.trim()}
                className="p-3 text-neutral-400 hover:text-white hover:bg-white/5 rounded-xl transition-all disabled:opacity-50"
                title="Search via Text"
              >
                <PlayCircle size={20} />
              </button>
              <button 
                onClick={handleCaptureAndAnalyze}
                disabled={loading}
                className="px-5 py-3 ml-2 bg-white hover:bg-neutral-200 text-black rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg"
              >
                <Camera size={18} />
                {cameraActive ? 'Snap' : 'Cam'}
              </button>
            </div>
          </div>

          {/* Quick Playlists Area */}
          <div className="flex flex-col gap-6 animate-fade-in-up">
            <h2 className="text-xl font-bold">Your Playlists</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user?.preferredSingers && user.preferredSingers.length > 0 && (
                <PlaylistCard onClick={() => handlePlaylistClick('Your Favorites', mockCategories.explore)} title="Your Favorites" subtitle="Based on your top artists" color="bg-neutral-800" className="md:col-span-2" />
              )}
              <PlaylistCard onClick={() => handlePlaylistClick('Recently Listened')} title="Recently Listened" subtitle="Continue your journey" color="bg-neutral-800" />
              <PlaylistCard onClick={() => handlePlaylistClick('Explore New', mockCategories.explore)} title="Explore New" subtitle="Discover fresh tracks" color="bg-neutral-800" />
              <PlaylistCard onClick={() => handlePlaylistClick('Bollywood Chartbusters', mockCategories.bollywood)} title="Bollywood Chartbusters" subtitle="Top trending hits" color="bg-neutral-800" />
              <PlaylistCard onClick={() => handlePlaylistClick('Hollywood Chartbusters', mockCategories.hollywood)} title="Hollywood Chartbusters" subtitle="Global top 50" color="bg-neutral-800" />
              <PlaylistCard onClick={() => handlePlaylistClick('Lofi Beats', mockCategories.lofi)} title="Lofi Beats" subtitle="Relax and focus" color="bg-neutral-800" className="md:col-span-2" />
            </div>
          </div>
        </div>

        {/* Categories Player Demo */}
        <div className="w-full max-w-5xl space-y-10 mb-10 animate-fade-in-up">
           <div>
             <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Disc3 className="text-neutral-400"/> Quick Access: Lofi</h2>
             <div className="bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-6 shadow-xl">
                <MusicPlayer songs={mockCategories.lofi.slice(0, 5)} videoIds={[]} />
             </div>
           </div>
        </div>

      </main>
    </div>
  );
};

const PlaylistCard = ({ title, subtitle, color, className = '', onClick }: { title: string, subtitle: string, color: string, className?: string, onClick?: () => void }) => (
  <div onClick={onClick} className={`p-5 rounded-2xl border border-neutral-800 bg-[#0a0a0a] hover:bg-neutral-900 hover:border-neutral-700 transition-all cursor-pointer relative overflow-hidden group ${className}`}>
    <h3 className="text-white font-bold text-lg relative z-10">{title}</h3>
    <p className="text-neutral-400 text-sm mt-1 relative z-10">{subtitle}</p>
    <div className="mt-4 w-10 h-10 rounded-full border border-neutral-700 flex items-center justify-center text-white relative z-10 group-hover:bg-white group-hover:text-black group-hover:border-white transition-colors">
      <PlayCircle size={20} />
    </div>
  </div>
);

export default ProfilePage;
