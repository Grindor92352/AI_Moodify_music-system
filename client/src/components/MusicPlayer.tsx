import React, { useState } from 'react';

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
  const [activatedIds, setActivatedIds] = useState<Set<string>>(new Set());

  // Build display list — prefer rich song objects, fall back to plain IDs
  const displayList: Song[] = songs && songs.length > 0
    ? songs
    : videoIds.map(id => ({ videoId: id, title: 'Bollywood Track', artist: 'Various Artists' }));

  const activate = (videoId: string) => {
    setActivatedIds(prev => new Set([...prev, videoId]));
  };

  if (!displayList || displayList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center px-4 py-12 rounded-2xl border-2 border-dashed border-neutral-800/50 bg-neutral-900/20">
        <div className="w-16 h-16 rounded-full bg-neutral-800/50 flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-neutral-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-neutral-300 mb-2">Awaiting Analysis</h3>
        <p className="text-neutral-500 text-sm max-w-sm leading-relaxed">
          Click <span className="text-purple-400 font-medium">Detect My Mood</span> and face the camera. The AI will detect your emotion and load personalized Bollywood videos automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 pb-8">
      {displayList.map((song, index) => {
        const { videoId, title, artist } = song;
        const isActive = activatedIds.has(videoId);
        const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

        return (
          <div
            key={`${videoId}-${index}`}
            className="group relative transition-all duration-300 hover:scale-[1.005] hover:-translate-y-0.5"
          >
            {/* Hover glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none" />

            <div className="relative bg-[#0f0f0f] rounded-[16px] overflow-hidden border border-neutral-800 shadow-2xl group-hover:border-neutral-600 transition-colors duration-300">
              {isActive ? (
                /* ── Active: Play the YouTube embed ── */
                <iframe
                  src={embedUrl}
                  width="100%"
                  height="220"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="border-0 block w-full"
                  title={title}
                />
              ) : (
                /* ── Idle: Thumbnail card with click-to-load ── */
                <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                  {/* Thumbnail */}
                  <img
                    src={thumbnailUrl}
                    alt={title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://via.placeholder.com/480x270/111111/444444?text=Bollywood+Music';
                    }}
                  />

                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  {/* Play button — clicking this loads the iframe */}
                  <button
                    onClick={() => activate(videoId)}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-3 group/btn"
                    aria-label={`Play ${title}`}
                  >
                    <div className="w-16 h-16 rounded-full bg-red-600/90 group-hover/btn:bg-red-500 flex items-center justify-center shadow-2xl transition-all duration-200 group-hover/btn:scale-110">
                      <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                    <span className="text-white/80 text-xs font-medium tracking-wider uppercase">Click to Play</span>
                  </button>

                  {/* Song info bar at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 px-4 py-3 flex items-end justify-between">
                    <div className="mr-3 min-w-0">
                      <p className="text-white font-semibold text-sm leading-tight truncate drop-shadow-lg">{title}</p>
                      <p className="text-neutral-300 text-xs truncate drop-shadow">{artist}</p>
                    </div>
                    {/* Open in YouTube link */}
                    <a
                      href={youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="flex-shrink-0 flex items-center gap-1 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 text-white text-[10px] font-bold px-2 py-1 rounded-full transition-all duration-200"
                      aria-label="Watch on YouTube"
                    >
                      <svg className="w-3 h-3 text-red-400" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                      </svg>
                      YouTube
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MusicPlayer;
