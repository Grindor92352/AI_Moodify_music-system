import React, { useState, useEffect } from 'react';
import api from '../api/client';
import type { Song } from '../types/music';
import { Play, BookmarkPlus, BookmarkCheck, X, Plus, ListMusic } from 'lucide-react';

interface Playlist {
  id: number;
  name: string;
  songCount: number;
}

interface MusicPlayerProps {
  videoIds: string[];
  songs?: Song[];
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ videoIds, songs }) => {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [previewVideoId, setPreviewVideoId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [showPlaylistModal, setShowPlaylistModal] = useState<Song | null>(null);
  const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('moodify_saved_songs') || '[]');
    setSavedIds(new Set(saved.map((s: Song) => s.videoId)));
  }, []);

  const displayList: Song[] = songs && songs.length > 0
    ? songs
    : videoIds.map(id => ({ videoId: id, title: 'Bollywood Track', artist: 'Various Artists' }));

  const loadUserPlaylists = async () => {
    setIsLoadingPlaylists(true);
    try {
      const res = await api.get<{ playlists: Playlist[] }>('/api/playlists');
      setUserPlaylists(res.data.playlists || []);
    } catch (error) {
      console.error('Failed to load playlists:', error);
      setUserPlaylists([]);
    } finally {
      setIsLoadingPlaylists(false);
    }
  };

  const addToPlaylist = async (playlistId: number, song: Song) => {
    try {
      await api.post(`/api/playlists/${playlistId}/add-song`, {
        videoId: song.videoId,
        title: song.title,
        artist: song.artist,
      });

      setShowPlaylistModal(null);

      const playlist = userPlaylists.find(p => p.id === playlistId);
      alert(`Added "${song.title}" to "${playlist?.name}" playlist!`);
    } catch (error) {
      console.error('Failed to add song to playlist:', error);
      alert('Failed to add song to playlist. Please try again.');
    }
  };

  const openPlaylistModal = (song: Song) => {
    setShowPlaylistModal(song);
    loadUserPlaylists();
  };

  const toggleSave = (song: Song) => {
    const isSaved = savedIds.has(song.videoId);
    const savedList: Song[] = JSON.parse(localStorage.getItem('moodify_saved_songs') || '[]');

    let nextSavedList: Song[];
    if (isSaved) {
      nextSavedList = savedList.filter((s: Song) => s.videoId !== song.videoId);
      setSavedIds(prev => {
        const next = new Set(prev);
        next.delete(song.videoId);
        return next;
      });
    } else {
      nextSavedList = [...savedList, song];
      setSavedIds(prev => new Set([...prev, song.videoId]));
    }

    localStorage.setItem('moodify_saved_songs', JSON.stringify(nextSavedList));
  };

  if (!displayList || displayList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 bg-neutral-900/30 rounded-2xl border border-dashed border-neutral-800 text-neutral-500">
        <p>No tracks available.</p>
      </div>
    );
  }

  const handlePlay = (song: Song) => {
    setActiveVideoId(song.videoId);
    // Add to recently played history
    try {
      const recentList = JSON.parse(localStorage.getItem('moodify_recently_played') || '[]');
      const filteredList = recentList.filter((s: Song) => s.videoId !== song.videoId);
      filteredList.unshift(song);
      localStorage.setItem('moodify_recently_played', JSON.stringify(filteredList.slice(0, 50)));
    } catch (e) {
      console.error('Failed to save recently played', e);
    }
  };

  const handlePreview = (song: Song) => {
    setPreviewVideoId(song.videoId);
  };

  return (
    <div className="w-full">
      <div className="flex flex-col gap-2">
        {displayList.map((song, index) => {
          const isSaved = savedIds.has(song.videoId);
          const isPlaying = activeVideoId === song.videoId;
          const thumbnailUrl = `https://img.youtube.com/vi/${song.videoId}/default.jpg`;

          return (
            <div 
              key={`${song.videoId}-${index}`}
              className={`group flex items-center p-3 rounded-2xl transition-all border ${isPlaying ? 'bg-purple-600/10 border-purple-500/30' : 'bg-transparent border-transparent hover:bg-white/5'}`}
            >
              <div className="w-10 text-center text-neutral-500 font-medium text-sm cursor-pointer" onClick={() => handlePlay(song)}>
                {isPlaying ? <Play size={16} className="mx-auto text-purple-400 animate-pulse" /> : (index + 1).toString().padStart(2, '0')}
              </div>
              
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-800 ml-2 mr-4 shrink-0 relative cursor-pointer" onClick={() => handlePlay(song)}>
                <img src={thumbnailUrl} alt={song.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Play size={20} className="text-white ml-1" />
                </div>
              </div>

              <div className="flex-1 min-w-0 pr-4">
                <h4 className={`font-semibold truncate ${isPlaying ? 'text-purple-400' : 'text-white'}`}>{song.title}</h4>
                <p className="text-neutral-400 text-xs truncate">{song.artist}</p>
              </div>

              <div className="flex items-center gap-2 transition-colors">
                <button 
                  onClick={() => openPlaylistModal(song)}
                  className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all"
                  title="Add to Playlist"
                >
                  <Plus size={18} />
                </button>
                <button 
                  onClick={() => handlePreview(song)}
                  className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all"
                  title="Preview"
                >
                  <Play size={18} />
                </button>
                <button 
                  onClick={() => toggleSave(song)}
                  className={`p-2 rounded-lg transition-colors ${isSaved ? 'text-purple-400 bg-purple-400/10' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
                  title="Save to Library"
                >
                  {isSaved ? <BookmarkCheck size={18} /> : <BookmarkPlus size={18} />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {previewVideoId && (
        <div className="mt-5 rounded-3xl border border-white/[0.08] bg-neutral-950 p-4">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Preview</p>
              <h3 className="text-lg font-semibold text-white truncate">
                {displayList.find((song) => song.videoId === previewVideoId)?.title || 'Preview'}
              </h3>
            </div>
            <button
              onClick={() => setPreviewVideoId(null)}
              className="rounded-xl border border-white/[0.08] px-3 py-2 text-sm text-neutral-300 hover:bg-white/[0.05] hover:text-white transition-all"
            >
              Close
            </button>
          </div>
          <div className="aspect-video overflow-hidden rounded-2xl bg-black">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${previewVideoId}?autoplay=1&controls=1&modestbranding=1`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>
        </div>
      )}

      {activeVideoId && (
        <div className="fixed bottom-6 right-6 w-80 bg-neutral-900 border border-neutral-700 p-3 rounded-2xl shadow-2xl z-50 animate-in slide-in-from-bottom-5">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2 text-purple-400 text-sm font-bold">
              <Play size={14} className="animate-pulse" /> Now Playing
            </div>
            <button onClick={() => setActiveVideoId(null)} className="text-neutral-500 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>
          <div className="w-full aspect-video rounded-xl overflow-hidden bg-black">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${activeVideoId}?autoplay=1&modestbranding=1&showinfo=0`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>
        </div>
      )}

      {/* Add to Playlist Modal */}
      {showPlaylistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-700 rounded-3xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Add to Playlist</h2>
              <button 
                onClick={() => setShowPlaylistModal(null)}
                className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="mb-4 p-3 rounded-xl bg-neutral-800 border border-neutral-700">
              <h3 className="font-semibold text-white text-sm truncate">{showPlaylistModal.title}</h3>
              <p className="text-neutral-400 text-xs truncate">{showPlaylistModal.artist}</p>
            </div>

            {isLoadingPlaylists ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              </div>
            ) : userPlaylists.length === 0 ? (
              <div className="text-center py-8">
                <ListMusic size={24} className="mx-auto text-neutral-600 mb-2" />
                <p className="text-neutral-500 text-sm">No playlists yet</p>
                <p className="text-neutral-600 text-xs">Create one in the Library section</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {userPlaylists.map(playlist => (
                  <button
                    key={playlist.id}
                    onClick={() => addToPlaylist(playlist.id, showPlaylistModal)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-neutral-700 hover:bg-neutral-800 hover:border-neutral-600 transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
                      <ListMusic size={16} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white text-sm truncate">{playlist.name}</h4>
                      <p className="text-neutral-500 text-xs">{playlist.songCount} tracks</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicPlayer;
