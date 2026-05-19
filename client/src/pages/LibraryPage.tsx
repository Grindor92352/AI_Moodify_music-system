import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import MusicPlayer from '../components/MusicPlayer';
import { Library, Inbox } from 'lucide-react';

interface Song {
  videoId: string;
  title: string;
  artist: string;
}

const LibraryPage: React.FC = () => {
  const [savedSongs, setSavedSongs] = useState<Song[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('moodify_saved_songs');
    if (saved) {
      setSavedSongs(JSON.parse(saved));
    }
  }, []);

  return (
    <div className="flex min-h-screen bg-[#050505] selection:bg-purple-500/30 text-white">
      <Sidebar />
      <main className="flex-1 p-10 flex flex-col items-center custom-scrollbar overflow-y-auto">
        <header className="w-full max-w-5xl mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold mb-2 flex items-center gap-3">
              <Library className="text-purple-500" size={36} />
              Your Library
            </h1>
            <p className="text-neutral-400 text-lg">Tracks you've saved for later listening.</p>
          </div>
        </header>

        <div className="w-full max-w-5xl">
          {savedSongs.length === 0 ? (
            <div className="text-center py-20 bg-neutral-900 border border-neutral-800 rounded-3xl">
              <Inbox size={48} className="mx-auto text-neutral-600 mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">No saved songs yet</h2>
              <p className="text-neutral-400">Heart a song during analysis to add it here.</p>
            </div>
          ) : (
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl">
              <h2 className="text-xl font-bold mb-6 text-white border-b border-neutral-800 pb-4">
                Saved Tracks ({savedSongs.length})
              </h2>
              <MusicPlayer songs={savedSongs} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LibraryPage;
