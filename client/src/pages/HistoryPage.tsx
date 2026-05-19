import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import MusicPlayer from '../components/MusicPlayer';
import { Calendar, Smile, Inbox } from 'lucide-react';

interface HistoryEntry {
  id: number;
  date: string;
  mood: string;
  tracks: number;
  songs?: any[];
  videoIds?: string[];
}

const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('moodify_history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  return (
    <div className="flex min-h-screen bg-[#050505] selection:bg-white/20 animate-fade-in-up">
      <Sidebar />
      <main className="flex-1 p-10 flex flex-col items-center custom-scrollbar overflow-y-auto">
        
        <header className="w-full max-w-4xl mb-12 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-white mb-2">Your History</h1>
            <p className="text-neutral-400 text-lg">Review your personalized emotional journeys over time.</p>
          </div>
          {history.length > 0 && (
            <button 
              onClick={() => {
                localStorage.removeItem('moodify_history');
                setHistory([]);
              }}
              className="px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-xl transition-all font-medium"
            >
              Clear History
            </button>
          )}
        </header>

        <div className="w-full max-w-4xl space-y-4">
          {history.length === 0 ? (
            <div className="text-center py-20 bg-[#0a0a0a] border border-neutral-800 rounded-3xl animate-fade-in-up">
              <Inbox size={48} className="mx-auto text-neutral-600 mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">No history yet</h2>
              <p className="text-neutral-400">Head to your Profile to analyze your mood and discover songs.</p>
            </div>
          ) : (
            history.map((session) => (
              <div 
                key={session.id} 
                onClick={() => setExpandedId(expandedId === session.id ? null : session.id)}
                className="bg-[#0a0a0a] border border-neutral-800 p-6 rounded-3xl flex flex-col gap-4 hover:bg-neutral-900 hover:border-neutral-700 transition-all cursor-pointer animate-fade-in-up"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">{session.date}</h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <span className="block text-xs uppercase tracking-wider text-neutral-500 font-semibold mb-1">
                        {['Recently Listened', 'Explore New', 'Bollywood Chartbusters', 'Hollywood Chartbusters', 'Lofi Beats', 'Your Favorites'].includes(session.mood) 
                          ? 'Playlist' 
                          : ['Happiness', 'Sadness', 'Anger', 'Surprise', 'Neutral', 'Disgust', 'Fear', 'Fatigue'].includes(session.mood) 
                            ? 'Detected Mood' 
                            : 'Search Query'}
                      </span>
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-800 text-neutral-300 rounded-full text-sm font-bold border border-neutral-700">
                        <Smile size={14} />
                        {session.mood}
                      </span>
                    </div>
                    
                    <div className="h-10 w-px bg-neutral-800 hidden md:block"></div>
                    
                    <div className="text-right">
                      <span className="block text-xs uppercase tracking-wider text-neutral-500 font-semibold mb-1">Tracks</span>
                      <span className="text-white font-bold">{session.tracks} Analyzed</span>
                    </div>
                  </div>
                </div>

                {expandedId === session.id && session.songs && (
                  <div className="mt-4 pt-6 border-t border-neutral-800 animate-fade-in-up">
                    <MusicPlayer songs={session.songs} videoIds={session.videoIds || []} />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        
      </main>
    </div>
  );
};

export default HistoryPage;
