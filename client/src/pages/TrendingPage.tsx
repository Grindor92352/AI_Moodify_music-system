import React, { useCallback, useEffect, useState, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import type { Song } from '../types/music';
import { api } from '../api/client';
import { PlayCircle, X, Sparkles } from 'lucide-react';

const DEFAULT_QUERY = 'trending songs official audio';

const TrendingPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [songs, setSongs] = useState<Song[]>([]);
  const [visibleCount, setVisibleCount] = useState(9);
  const [previewSong, setPreviewSong] = useState<Song | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadTrendingSongs = useCallback(async (query: string) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await api.get('/api/music/trending', {
        params: { query: query.trim() || DEFAULT_QUERY }
      });
      setSongs(response.data.songs || []);
      setVisibleCount(9);
    } catch (err) {
      console.error('[TrendingPage] Failed to load songs:', err);
      setError('Unable to load trending songs right now. Please try again later.');
      setSongs([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrendingSongs(DEFAULT_QUERY);
  }, [loadTrendingSongs]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisibleCount((v) => {
            if (v >= songs.length) return v;
            return Math.min(songs.length, v + 9);
          });
        }
      });
    }, { root: null, rootMargin: '200px', threshold: 0.1 });

    observer.observe(node);
    return () => observer.disconnect();
  }, [songs.length]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await loadTrendingSongs(searchQuery || DEFAULT_QUERY);
  };

  const clearTrendingSearch = async () => {
    setSearchQuery('');
    await loadTrendingSongs(DEFAULT_QUERY);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#050505] selection:bg-white/20 text-white animate-fade-in-up">
      <Sidebar />
      <main className="min-h-0 flex-1 overflow-y-auto custom-scrollbar">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-7 lg:px-10 lg:py-9">
          <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-emerald-400">Trending</p>
              <h1 className="text-3xl font-extrabold tracking-tight text-white lg:text-5xl">Latest Trending Songs</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400 lg:text-base">
                Discover the top trending tracks and preview them instantly. Search for hits and let the backend fetch the latest results.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-3xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-neutral-300">
              <Sparkles size={18} /> Hot music picks updated for you
            </div>
          </header>

          <section className="rounded-2xl border border-white/[0.08] bg-neutral-950 p-5 shadow-2xl">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-white">Search</h2>
              <p className="mt-1 text-xs text-neutral-500">Search any song or artist on YouTube and let the backend return the latest results.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search any song or artist"
                className="min-w-0 rounded-2xl border border-white/[0.08] bg-black/40 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-neutral-500 focus:border-emerald-400/50 sm:flex-1"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="rounded-2xl border border-white/[0.08] bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200 transition-all hover:bg-emerald-500/20"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={clearTrendingSearch}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-neutral-300 transition-all hover:bg-white/[0.08] hover:text-white"
                >
                  Clear
                </button>
              </div>
            </form>
          </section>

          <section className="rounded-2xl border border-white/[0.08] bg-neutral-950 p-5 shadow-2xl">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Trending Songs</h2>
                <p className="mt-1 text-xs text-neutral-500">Results are fetched from YouTube with seeded fallback when needed.</p>
              </div>
              <div className="text-xs text-neutral-500">
                {isLoading ? 'Loading trending songs...' : `Showing ${songs.length} songs.`}
              </div>
            </div>

            {error ? (
              <div className="mb-5 rounded-3xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {songs.length > 0 ? songs.slice(0, visibleCount).map((song, index) => (
                <button
                  key={`${song.videoId}-${index}`}
                  onClick={() => setPreviewSong(song)}
                  className="group overflow-hidden rounded-3xl border border-white/[0.07] bg-neutral-900 p-4 text-left transition-all hover:border-emerald-400/30 hover:bg-white/5"
                >
                  <div className="relative mb-4 overflow-hidden rounded-3xl bg-neutral-950">
                    <img
                      src={`https://img.youtube.com/vi/${song.videoId}/mqdefault.jpg`}
                      alt={song.title}
                      className="h-44 w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                      <PlayCircle size={32} className="text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{song.title}</h3>
                    <p className="mt-1 text-xs text-neutral-400">{song.artist}</p>
                  </div>
                </button>
              )) : (
                <div className="rounded-3xl border border-dashed border-white/[0.08] bg-neutral-900 p-8 text-center text-neutral-500">
                  {isLoading ? 'Fetching songs...' : 'No trending songs are available. Try searching again or refresh.'}
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-center">
              {visibleCount < songs.length ? (
                <button
                  onClick={() => setVisibleCount((v) => Math.min(songs.length, v + 9))}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm text-neutral-300 hover:bg-white/[0.06]"
                >
                  Load more
                </button>
              ) : (
                songs.length > 0 && <div className="text-xs text-neutral-500">No more songs</div>
              )}
            </div>

            <div ref={sentinelRef} />
          </section>

          {previewSong && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
              <div className="w-full max-w-4xl overflow-hidden rounded-[28px] border border-white/[0.08] bg-neutral-950 shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">Preview: {previewSong.title}</h3>
                    <p className="text-xs text-neutral-500">{previewSong.artist}</p>
                  </div>
                  <button
                    onClick={() => setPreviewSong(null)}
                    className="rounded-full border border-white/[0.08] p-2 text-neutral-300 hover:text-white hover:bg-white/[0.05]"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="bg-black p-4">
                  <div className="aspect-video w-full overflow-hidden rounded-3xl bg-neutral-900">
                    <iframe
                      title="Trending song preview"
                      src={`https://www.youtube-nocookie.com/embed/${previewSong.videoId}?autoplay=1&modestbranding=1&rel=0`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="h-full w-full border-0"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TrendingPage;
