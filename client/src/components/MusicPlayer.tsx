import React, { useState, useEffect } from 'react';
import { Play, BookmarkPlus, BookmarkCheck, X } from 'lucide-react';

interface Song {
  videoId: string;
  title: string;
  artist: string;
}

interface MusicPlayerProps {
  videoIds: string[];
  songs?: Song[];
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ videoIds, songs }) => {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('moodify_saved_songs') || '[]');
    setSavedIds(new Set(saved.map((s: any) => s.videoId)));
  }, []);

  const displayList: Song[] = songs && songs.length > 0
    ? songs
    : videoIds.map(id => ({ videoId: id, title: 'Bollywood Track', artist: 'Various Artists' }));

  const toggleSave = (song: Song) => {
    const isSaved = savedIds.has(song.videoId);
    let savedList = JSON.parse(localStorage.getItem('moodify_saved_songs') || '[]');
    
    if (isSaved) {
      savedList = savedList.filter((s: any) => s.videoId !== song.videoId);
      setSavedIds(prev => { const next = new Set(prev); next.delete(song.videoId); return next; });
    } else {
      savedList.push(song);
      setSavedIds(prev => new Set([...prev, song.videoId]));
    }
    localStorage.setItem('moodify_saved_songs', JSON.stringify(savedList));
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
      const filteredList = recentList.filter((s: any) => s.videoId !== song.videoId);
      filteredList.unshift(song);
      localStorage.setItem('moodify_recently_played', JSON.stringify(filteredList.slice(0, 50)));
    } catch (e) {
      console.error('Failed to save recently played', e);
    }
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
              
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-800 ml-2 mr-4 flex-shrink-0 relative cursor-pointer" onClick={() => handlePlay(song)}>
                <img src={thumbnailUrl} alt={song.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Play size={20} className="text-white ml-1" />
                </div>
              </div>

              <div className="flex-1 min-w-0 pr-4">
                <h4 className={`font-semibold truncate ${isPlaying ? 'text-purple-400' : 'text-white'}`}>{song.title}</h4>
                <p className="text-neutral-400 text-xs truncate">{song.artist}</p>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
    </div>
  );
};

export default MusicPlayer;
