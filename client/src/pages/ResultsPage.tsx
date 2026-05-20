import React, { useState } from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import api from '../api/client';
import Sidebar from '../components/Sidebar';
import MusicPlayer from '../components/MusicPlayer';
import type { MusicRefreshResponse, Song } from '../types/music';
import { ArrowLeft, Disc3, RefreshCcw } from 'lucide-react';

const mockSongs: Song[] = [
  { videoId: 'xGerv5FOk', title: 'Tum Hi Ho', artist: 'Arijit Singh' },
  { videoId: 'BddP6PYo2gs', title: 'Channa Mereya', artist: 'Arijit Singh' },
  { videoId: 'jfKfPfyJRdk', title: 'Kabira', artist: 'Tochi Raina, Rekha Bhardwaj' },
  { videoId: '5qap5aO4i9A', title: 'Iktara', artist: 'Kavita Seth, Amitabh Bhattacharya' }
];

const ResultsPage: React.FC = () => {
  const location = useLocation();
  const { mood, image, songs, videoIds } = (location.state || {}) as {
    mood?: string;
    image?: string | null;
    songs?: Song[];
    videoIds?: string[];
  };
  const [localSongs, setLocalSongs] = useState<Song[] | undefined>(songs);
  const [localVideoIds, setLocalVideoIds] = useState<string[] | undefined>(videoIds);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!mood) return;
    setIsRefreshing(true);
    try {
      const res = await api.post<MusicRefreshResponse>('/api/music/refresh', { mood });
      setLocalSongs(res.data.songs);
      setLocalVideoIds(res.data.videoIds);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!mood) {
    return <Navigate to="/dashboard" replace />;
  }

  const fallbackVideoIds = localVideoIds?.length
    ? localVideoIds
    : mockSongs.map(s => s.videoId);

  return (
    <div className="flex h-screen overflow-hidden bg-[#050505] selection:bg-white/20 animate-fade-in-up">
      <Sidebar />
      <main className="min-h-0 flex-1 p-10 flex flex-col items-center overflow-y-auto custom-scrollbar">
        
        <header className="w-full max-w-5xl mb-8 flex items-center">
          <Link to="/dashboard" className="p-2 mr-4 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-white">{image ? 'Analysis Complete' : mood}</h1>
            <p className="text-neutral-400 text-sm mt-1">{image ? 'Here is what our AI discovered.' : 'Playlist curated from your dashboard.'}</p>
          </div>
        </header>

        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8">
          {image && (
            <div className="lg:col-span-1 space-y-6 animate-fade-in-up">
              <div className="bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-6 shadow-xl">
                <h3 className="text-xs uppercase tracking-widest text-neutral-500 font-semibold mb-4">Input Source</h3>
                <div className="aspect-square bg-black rounded-2xl overflow-hidden border border-neutral-800 relative flex items-center justify-center">
                  <img src={image} alt="User capture" className="w-full h-full object-cover transform -scale-x-100" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-sm font-bold shadow-lg">
                      Camera Input
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 opacity-5 pointer-events-none transform translate-x-1/4 -translate-y-1/4 text-white">
                  <Disc3 size={120} />
                </div>
                <h3 className="text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2">
                  Detected Mood
                </h3>
                <p className="text-4xl font-extrabold text-white capitalize">{mood}</p>
              </div>
            </div>
          )}

          <div className={image ? "lg:col-span-2 animate-fade-in-up delay-75" : "lg:col-span-3 animate-fade-in-up"}>
            <div className="bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-8 shadow-xl h-full flex flex-col">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  {image ? 'Recommended Tracks' : `${mood} Tracks`}
                </h2>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleRefresh} 
                    disabled={isRefreshing}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-neutral-200 disabled:opacity-50 rounded-xl text-sm font-bold shadow-lg transition-all"
                  >
                    <RefreshCcw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                    Refresh
                  </button>
                  <span className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-neutral-400 font-medium">
                    Based on {mood}
                  </span>
                </div>
              </div>

              <div className="flex-1 custom-scrollbar overflow-y-auto pr-2">
                <MusicPlayer songs={localSongs} videoIds={fallbackVideoIds} />
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default ResultsPage;
