import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import type { Song } from '../types/music';
import { Heart, Play, Music2, X } from 'lucide-react';

const FavoritesPage: React.FC = () => {
  const [savedSongs, setSavedSongs] = useState<Song[]>([]);
  const [previewVideoId, setPreviewVideoId] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>('Preview');
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('moodify_saved_songs');
    if (saved) {
      try {
        setSavedSongs(JSON.parse(saved));
      } catch {
        setSavedSongs([]);
      }
    }
  }, []);

  const playAllFavorites = () => {
    if (!savedSongs.length) return;
    navigate('/results', {
      state: {
        mood: 'Favorites',
        image: null,
        songs: savedSongs,
        videoIds: savedSongs.map((song) => song.videoId),
      },
    });
  };

  const previewSong = (song: Song) => {
    setPreviewVideoId(song.videoId);
    setPreviewTitle(song.title);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#050505] text-white">
      <Sidebar />
      <main className="min-h-0 flex-1 p-8 overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold tracking-[0.25em] text-rose-400 uppercase mb-2">Favorites</p>
              <h1 className="text-4xl font-black tracking-tighter mb-2">Saved Songs</h1>
              <p className="text-neutral-500 text-base">Access the songs you've favorited and preview them instantly.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={playAllFavorites}
                disabled={savedSongs.length === 0}
                className="rounded-2xl bg-rose-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-rose-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Play size={16} />
                <span className="ml-2">Play All</span>
              </button>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="rounded-2xl border border-white/[0.08] bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
              >
                Refresh List
              </button>
            </div>
          </div>

          {savedSongs.length === 0 ? (
            <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-12 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-500/10 text-rose-300">
                <Heart size={28} />
              </div>
              <h2 className="text-2xl font-bold mb-3">No favorites yet</h2>
              <p className="text-neutral-500 text-sm max-w-md mx-auto">
                Save songs from the Results page and they will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
              <div className="space-y-4">
                {savedSongs.map((song, index) => (
                  <div key={song.videoId} className="group flex items-center justify-between gap-4 rounded-3xl border border-white/[0.06] bg-neutral-950 p-4 transition-all hover:border-white/[0.1] hover:bg-white/[0.03]">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-rose-500/10 text-rose-300 text-sm font-bold">
                        {String(index + 1).padStart(2, '0')}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{song.title}</p>
                        <p className="text-xs text-neutral-500 truncate">{song.artist}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => previewSong(song)}
                      className="rounded-2xl border border-white/[0.08] bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/[0.08]"
                    >
                      Preview
                    </button>
                  </div>
                ))}
              </div>

              {previewVideoId && (
                <div className="rounded-3xl border border-white/[0.06] bg-neutral-950 p-4 min-w-0">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Preview</p>
                      <h2 className="mt-2 text-lg font-semibold text-white truncate">{previewTitle}</h2>
                    </div>
                    <button
                      onClick={() => setPreviewVideoId(null)}
                      className="rounded-2xl border border-white/[0.08] bg-white/5 px-4 py-2 text-sm text-neutral-300 transition hover:bg-white/[0.08] hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="aspect-video overflow-hidden rounded-3xl bg-black">
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${previewVideoId}?autoplay=1&controls=1&modestbranding=1`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default FavoritesPage;
