import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import MusicPlayer from '../components/MusicPlayer';
import {
  Heart, Download, ListMusic, Plus, Search, Disc3,
  Music2, Shuffle, Headphones, Star, Play, Inbox, Wand2
} from 'lucide-react';

interface Song {
  videoId: string;
  title: string;
  artist: string;
}

// ── Curated sample collections ──────────────────────────────
const suggestedPlaylists = [
  {
    id: 'mood-boost',
    name: 'Mood Booster',
    desc: '10 tracks to lift your energy',
    color: 'from-yellow-500 to-orange-500',
    glow: 'rgba(234,179,8,0.35)',
    icon: <Star size={20} />,
    songs: [
      { videoId: 'OPf0YbXqDm0', title: 'Uptown Funk', artist: 'Mark Ronson' },
      { videoId: '09R8_2nJtjg', title: 'Sugar', artist: 'Maroon 5' },
      { videoId: 'kJQP7kiw5Fk', title: 'Despacito', artist: 'Luis Fonsi' },
      { videoId: 'JGwWNGJdvx8', title: 'Shape of You', artist: 'Ed Sheeran' },
    ],
  },
  {
    id: 'chill-vibes',
    name: 'Chill Vibes',
    desc: 'Smooth sounds for relaxing',
    color: 'from-cyan-500 to-blue-500',
    glow: 'rgba(6,182,212,0.35)',
    icon: <Headphones size={20} />,
    songs: [
      { videoId: 'lTRiuFIWV54', title: 'Lofi Hip Hop Radio', artist: 'Lofi Girl' },
      { videoId: 'DWcJFNfaw9c', title: 'Late Night', artist: 'Lofi Boy' },
      { videoId: 'n61ULEU7CO0', title: 'Relaxing Lofi', artist: 'Chillhop Music' },
    ],
  },
  {
    id: 'bollywood-love',
    name: 'Bollywood Love',
    desc: 'Romantic Hindi classics',
    color: 'from-pink-500 to-rose-500',
    glow: 'rgba(236,72,153,0.35)',
    icon: <Heart size={20} />,
    songs: [
      { videoId: 'xGerv5FOk', title: 'Tum Hi Ho', artist: 'Arijit Singh' },
      { videoId: 'BddP6PYo2gs', title: 'Channa Mereya', artist: 'Arijit Singh' },
      { videoId: '1wYXwEcmpys', title: 'Gerua', artist: 'Arijit Singh' },
      { videoId: 'VdZpo0k4kH0', title: 'Zaalima', artist: 'Arijit Singh' },
    ],
  },
  {
    id: 'workout',
    name: 'Workout Mode',
    desc: 'High-energy training beats',
    color: 'from-violet-500 to-purple-600',
    glow: 'rgba(139,92,246,0.35)',
    icon: <Shuffle size={20} />,
    songs: [
      { videoId: 'RgKAFK5djSk', title: 'See You Again', artist: 'Wiz Khalifa' },
      { videoId: 'hT_nvWreIhg', title: 'Counting Stars', artist: 'OneRepublic' },
      { videoId: '0yW7w8F2TVA', title: 'Blank Space', artist: 'Taylor Swift' },
    ],
  },
];

type Tab = 'saved' | 'playlists' | 'downloads';

const LibraryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('saved');
  const [savedSongs, setSavedSongs] = useState<Song[]>([]);
  const [downloads, setDownloads] = useState<Song[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<typeof suggestedPlaylists[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('moodify_saved_songs');
    if (saved) setSavedSongs(JSON.parse(saved));
    const dl = localStorage.getItem('moodify_downloads');
    if (dl) setDownloads(JSON.parse(dl));
  }, []);

  const removeSaved = (videoId: string) => {
    const updated = savedSongs.filter(s => s.videoId !== videoId);
    setSavedSongs(updated);
    localStorage.setItem('moodify_saved_songs', JSON.stringify(updated));
  };

  const filteredSaved = savedSongs.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'saved', label: 'Saved Songs', icon: <Heart size={16} /> },
    { key: 'playlists', label: 'Your Playlists', icon: <ListMusic size={16} /> },
    { key: 'downloads', label: 'Downloads', icon: <Download size={16} /> },
  ];

  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto custom-scrollbar">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="mb-10">
            <p className="text-xs font-bold tracking-[0.25em] text-cyan-400 uppercase mb-2">Your Collection</p>
            <h1 className="text-4xl font-black tracking-tighter mb-2">Library</h1>
            <p className="text-neutral-500 text-base">All your music, organized the way you like it.</p>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 mb-8 p-1 bg-white/[0.03] border border-white/[0.06] rounded-2xl w-fit">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => { setActiveTab(t.key); setSelectedPlaylist(null); }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === t.key
                    ? 'bg-white text-black shadow-md'
                    : 'text-neutral-500 hover:text-white'
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {/* ── SAVED SONGS TAB ── */}
          {activeTab === 'saved' && (
            <div>
              {/* Search bar */}
              <div className="relative mb-6">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search saved songs..."
                  className="w-full bg-white/[0.03] border border-white/[0.07] rounded-2xl py-3 pl-11 pr-4 text-white placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500/50 transition-colors text-sm"
                />
              </div>

              {savedSongs.length === 0 ? (
                <EmptyState
                  icon={<Heart size={28} />}
                  title="No saved songs yet"
                  desc='Heart a track in the Results page to save it here.'
                />
              ) : filteredSaved.length === 0 ? (
                <EmptyState icon={<Search size={28} />} title="No matches found" desc="Try a different search term." />
              ) : (
                <div className="space-y-2">
                  {filteredSaved.map((song, i) => (
                    <SongRow
                      key={song.videoId}
                      index={i + 1}
                      song={song}
                      onRemove={() => removeSaved(song.videoId)}
                      removeLabel="Remove"
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── PLAYLISTS TAB ── */}
          {activeTab === 'playlists' && !selectedPlaylist && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <p className="text-neutral-500 text-sm">{suggestedPlaylists.length} curated playlists</p>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-white/[0.05] border border-white/[0.08] text-neutral-300 hover:bg-white/[0.08] hover:text-white transition-all">
                  <Plus size={15} /> Create Playlist
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suggestedPlaylists.map(pl => (
                  <PlaylistCard key={pl.id} pl={pl} onClick={() => setSelectedPlaylist(pl)} />
                ))}
              </div>
            </div>
          )}

          {/* ── PLAYLIST DETAIL ── */}
          {activeTab === 'playlists' && selectedPlaylist && (
            <div>
              <button
                onClick={() => setSelectedPlaylist(null)}
                className="flex items-center gap-2 text-neutral-500 hover:text-white text-sm mb-6 transition-colors"
              >
                ← Back to Playlists
              </button>

              {/* Header */}
              <div className="flex items-center gap-5 mb-8 p-6 rounded-3xl border border-white/[0.06] bg-white/[0.02]"
                style={{ boxShadow: `0 0 40px ${selectedPlaylist.glow}` }}>
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${selectedPlaylist.color} flex items-center justify-center text-white shadow-xl`}
                  style={{ boxShadow: `0 8px 30px ${selectedPlaylist.glow}` }}>
                  {selectedPlaylist.icon}
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-widest font-semibold mb-1">Playlist</p>
                  <h2 className="text-3xl font-black">{selectedPlaylist.name}</h2>
                  <p className="text-neutral-400 text-sm mt-1">{selectedPlaylist.desc} · {selectedPlaylist.songs.length} tracks</p>
                </div>
              </div>

              <MusicPlayer songs={selectedPlaylist.songs} videoIds={[]} />
            </div>
          )}

          {/* ── DOWNLOADS TAB ── */}
          {activeTab === 'downloads' && (
            <div>
              <div className="mb-6 p-4 rounded-2xl border border-yellow-500/20 bg-yellow-500/[0.05] flex items-start gap-3">
                <Download size={16} className="text-yellow-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-yellow-300 text-sm font-semibold">Offline Listening</p>
                  <p className="text-yellow-500/70 text-xs mt-0.5">Songs you save for offline use will appear here. Tap the download icon on any track in the Results page.</p>
                </div>
              </div>

              {downloads.length === 0 ? (
                <EmptyState icon={<Download size={28} />} title="No downloads yet" desc="Download tracks from the Results page to listen offline." />
              ) : (
                <div className="space-y-2">
                  {downloads.map((song, i) => (
                    <SongRow key={song.videoId} index={i + 1} song={song} />
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

/* ─── Sub-components ─── */

function EmptyState({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="text-center py-20 rounded-3xl border border-white/[0.05] bg-white/[0.02]">
      <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mx-auto mb-5 text-neutral-600">
        {icon}
      </div>
      <h2 className="text-lg font-bold mb-2">{title}</h2>
      <p className="text-neutral-600 text-sm max-w-xs mx-auto">{desc}</p>
    </div>
  );
}

function SongRow({ index, song, onRemove, removeLabel }: {
  index: number;
  song: { videoId: string; title: string; artist: string };
  onRemove?: () => void;
  removeLabel?: string;
}) {
  return (
    <div className="group flex items-center gap-4 px-5 py-3.5 rounded-2xl border border-transparent hover:bg-white/[0.04] hover:border-white/[0.07] transition-all">
      <span className="text-neutral-700 text-sm w-6 text-right shrink-0 tabular-nums group-hover:hidden">{index}</span>
      <Play size={14} className="text-indigo-400 hidden group-hover:block w-6 shrink-0" />
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-white/[0.07] flex items-center justify-center shrink-0">
        <Music2 size={16} className="text-indigo-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-semibold truncate">{song.title}</p>
        <p className="text-neutral-600 text-xs truncate">{song.artist}</p>
      </div>
      {onRemove && (
        <button
          onClick={onRemove}
          className="hidden group-hover:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-all"
        >
          {removeLabel}
        </button>
      )}
    </div>
  );
}

function PlaylistCard({ pl, onClick }: { pl: typeof suggestedPlaylists[0]; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="group relative rounded-2xl border cursor-pointer overflow-hidden transition-all duration-300 p-5"
      style={{
        borderColor: hov ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)',
        background: hov ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
        boxShadow: hov ? `0 8px 40px ${pl.glow}` : 'none',
        transform: hov ? 'translateY(-3px)' : 'none',
      }}
    >
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${pl.color} flex items-center justify-center text-white shadow-lg shrink-0`}
          style={{ boxShadow: hov ? `0 4px 20px ${pl.glow}` : 'none' }}>
          {pl.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-base">{pl.name}</h3>
          <p className="text-neutral-500 text-xs mt-0.5">{pl.desc}</p>
          <p className="text-neutral-600 text-xs mt-1">{pl.songs.length} tracks</p>
        </div>
        <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all border ${
          hov ? 'bg-white text-black border-white' : 'border-white/10 text-neutral-600'
        }`}>
          <Play size={14} />
        </div>
      </div>
    </div>
  );
}

export default LibraryPage;
