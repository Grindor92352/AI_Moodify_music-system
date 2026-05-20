import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import MusicPlayer from '../components/MusicPlayer';
import api from '../api/client';
import {
  Heart, Download, ListMusic, Plus,
  Music2, Headphones, Star, Play, Wand2,
  Trash2, X, Check
} from 'lucide-react';

interface Song {
  videoId: string;
  title: string;
  artist: string;
}

interface Playlist {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  songCount: number;
  songs: Song[];
}

interface SuggestedPlaylist {
  id: string;
  name: string;
  desc: string;
  color: string;
  glow: string;
  icon: React.ReactNode;
  songs: Song[];
}

const suggestedPlaylists: SuggestedPlaylist[] = [
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
    ],
  },
];

type Tab = 'saved' | 'playlists' | 'downloads';

const LibraryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('saved');
  const [savedSongs, setSavedSongs] = useState<Song[]>([]);
  const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | SuggestedPlaylist | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('moodify_saved_songs');
    if (saved) setSavedSongs(JSON.parse(saved));

    if (activeTab === 'playlists') {
      loadUserPlaylists();
    }
  }, [activeTab]);

  const loadUserPlaylists = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<{ playlists: Playlist[] }>('/api/playlists');
      setUserPlaylists(res.data.playlists || []);
    } catch (error) {
      console.error('Failed to load playlists:', error);
      setUserPlaylists([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createPlaylist = async () => {
    if (!newPlaylistName.trim()) return;

    setIsCreating(true);
    try {
      const res = await api.post<{ playlist: Playlist }>('/api/playlists/create', {
        name: newPlaylistName.trim(),
        description: ''
      });

      setUserPlaylists(prev => [res.data.playlist, ...prev]);
      setNewPlaylistName('');
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create playlist:', error);
      alert('Failed to create playlist. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const deletePlaylist = async (playlistId: number) => {
    if (!confirm('Are you sure you want to delete this playlist?')) return;

    try {
      await api.delete(`/api/playlists/${playlistId}`);
      setUserPlaylists(prev => prev.filter(p => p.id !== playlistId));
      if (selectedPlaylist && 'id' in selectedPlaylist && selectedPlaylist.id === playlistId) {
        setSelectedPlaylist(null);
      }
    } catch (error) {
      console.error('Failed to delete playlist:', error);
      alert('Failed to delete playlist. Please try again.');
    }
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'saved', label: 'Saved Songs', icon: <Heart size={16} /> },
    { key: 'playlists', label: 'Your Playlists', icon: <ListMusic size={16} /> },
    { key: 'downloads', label: 'Downloads', icon: <Download size={16} /> },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#050505] text-white">
      <Sidebar />
      <main className="min-h-0 flex-1 p-8 overflow-y-auto custom-scrollbar">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10">
            <p className="text-xs font-bold tracking-[0.25em] text-cyan-400 uppercase mb-2">Your Collection</p>
            <h1 className="text-4xl font-black tracking-tighter mb-2">Library</h1>
            <p className="text-neutral-500 text-base">All your music, organized the way you like it.</p>
          </div>

          <div className="flex items-center gap-2 mb-8 p-1 bg-white/3 border border-white/6 rounded-2xl w-fit">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => { setActiveTab(t.key); setSelectedPlaylist(null); }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === t.key
                  ? 'bg-white text-black shadow-md'
                  : 'text-neutral-500 hover:text-white'
                  }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {activeTab === 'saved' && (
            <div>
              {savedSongs.length === 0 ? (
                <div className="text-center py-20 rounded-3xl border border-white/5 bg-white/2">
                  <div className="w-16 h-16 rounded-2xl bg-white/4 border border-white/7 flex items-center justify-center mx-auto mb-5 text-neutral-600">
                    <Heart size={28} />
                  </div>
                  <h2 className="text-lg font-bold mb-2">No saved songs yet</h2>
                  <p className="text-neutral-600 text-sm max-w-xs mx-auto">Heart a track in the Results page to save it here.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {savedSongs.map((song, i) => (
                    <div key={song.videoId} className="group flex items-center gap-4 px-5 py-3.5 rounded-2xl border border-transparent hover:bg-white/4 hover:border-white/7 transition-all">
                      <span className="text-neutral-700 text-sm w-6 text-right shrink-0 tabular-nums group-hover:hidden">{i + 1}</span>
                      <Play size={14} className="text-indigo-400 hidden group-hover:block w-6 shrink-0" />
                      <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500/20 to-violet-500/20 border border-white/7 flex items-center justify-center shrink-0">
                        <Music2 size={16} className="text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold truncate">{song.title}</p>
                        <p className="text-neutral-600 text-xs truncate">{song.artist}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'playlists' && !selectedPlaylist && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <p className="text-neutral-500 text-sm">
                  {isLoading ? 'Loading...' : `${userPlaylists.length} custom playlists · ${suggestedPlaylists.length} curated`}
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-white text-black hover:bg-neutral-200 transition-all"
                >
                  <Plus size={15} /> Create Playlist
                </button>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {userPlaylists.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <ListMusic size={20} />
                        Your Playlists
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {userPlaylists.map(playlist => (
                          <UserPlaylistCard
                            key={playlist.id}
                            playlist={playlist}
                            onClick={() => setSelectedPlaylist(playlist)}
                            onDelete={() => deletePlaylist(playlist.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Wand2 size={20} />
                      Curated Collections
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {suggestedPlaylists.map(pl => (
                        <PlaylistCard key={pl.id} pl={pl} onClick={() => setSelectedPlaylist(pl)} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'playlists' && selectedPlaylist && (
            <div>
              <button
                onClick={() => setSelectedPlaylist(null)}
                className="flex items-center gap-2 text-neutral-500 hover:text-white text-sm mb-6 transition-colors"
              >
                ← Back to Playlists
              </button>

              <div className="flex items-center gap-5 mb-8 p-6 rounded-3xl border border-white/6 bg-white/2">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-white shadow-xl ${'description' in selectedPlaylist
                  ? 'bg-linear-to-br from-indigo-500 to-purple-600'
                  : `bg-linear-to-br ${selectedPlaylist.color}`
                  }`}>
                  {'description' in selectedPlaylist ? <ListMusic size={24} /> : selectedPlaylist.icon}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-neutral-500 uppercase tracking-widest font-semibold mb-1">Playlist</p>
                  <h2 className="text-3xl font-black">{selectedPlaylist.name}</h2>
                  <p className="text-neutral-400 text-sm mt-1">
                    {'description' in selectedPlaylist
                      ? `${selectedPlaylist.description} · ${selectedPlaylist.songs.length} tracks`
                      : `${selectedPlaylist.desc} · ${selectedPlaylist.songs.length} tracks`
                    }
                  </p>
                </div>
                {'description' in selectedPlaylist && (
                  <button
                    onClick={() => deletePlaylist(selectedPlaylist.id)}
                    className="p-2 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
                    title="Delete Playlist"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              <MusicPlayer songs={selectedPlaylist.songs} videoIds={[]} />
            </div>
          )}

          {activeTab === 'downloads' && (
            <div className="text-center py-20 rounded-3xl border border-white/5 bg-white/2">
              <div className="w-16 h-16 rounded-2xl bg-white/4 border border-white/7 flex items-center justify-center mx-auto mb-5 text-neutral-600">
                <Download size={28} />
              </div>
              <h2 className="text-lg font-bold mb-2">No downloads yet</h2>
              <p className="text-neutral-600 text-sm max-w-xs mx-auto">Download tracks from the Results page to listen offline.</p>
            </div>
          )}
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-neutral-900 border border-neutral-700 rounded-3xl p-8 w-full max-w-md mx-4 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Create Playlist</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-300 mb-2">Playlist Name</label>
                  <input
                    type="text"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    placeholder="My Awesome Playlist"
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-white placeholder:text-neutral-500 focus:outline-none focus:border-indigo-500 transition-colors"
                    maxLength={100}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-neutral-700 text-neutral-300 hover:bg-neutral-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={createPlaylist}
                  disabled={!newPlaylistName.trim() || isCreating}
                  className="flex-1 py-3 px-4 rounded-xl bg-white text-black font-semibold hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      Create
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

function UserPlaylistCard({ playlist, onClick, onDelete }: {
  playlist: Playlist;
  onClick: () => void;
  onDelete: () => void;
}) {
  const [hov, setHov] = useState(false);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="group relative rounded-2xl border cursor-pointer overflow-hidden transition-all duration-300 p-5"
      style={{
        borderColor: hov ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)',
        background: hov ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
        transform: hov ? 'translateY(-3px)' : 'none',
      }}
    >
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shrink-0">
          <ListMusic size={20} />
        </div>
        <div className="flex-1 min-w-0" onClick={onClick}>
          <h3 className="font-bold text-white text-base truncate">{playlist.name}</h3>
          <p className="text-neutral-500 text-xs mt-0.5 truncate">{playlist.description || 'Custom playlist'}</p>
          <p className="text-neutral-600 text-xs mt-1">{playlist.songCount} tracks</p>
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all border border-white/10 text-neutral-600 hover:bg-white hover:text-black"
          >
            <Play size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function PlaylistCard({ pl, onClick }: { pl: SuggestedPlaylist; onClick: () => void }) {
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
        <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${pl.color} flex items-center justify-center text-white shadow-lg shrink-0`}
          style={{ boxShadow: hov ? `0 4px 20px ${pl.glow}` : 'none' }}>
          {pl.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-base">{pl.name}</h3>
          <p className="text-neutral-500 text-xs mt-0.5">{pl.desc}</p>
          <p className="text-neutral-600 text-xs mt-1">{pl.songs.length} tracks</p>
        </div>
        <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all border ${hov ? 'bg-white text-black border-white' : 'border-white/10 text-neutral-600'
          }`}>
          <Play size={14} />
        </div>
      </div>
    </div>
  );
}

export default LibraryPage;