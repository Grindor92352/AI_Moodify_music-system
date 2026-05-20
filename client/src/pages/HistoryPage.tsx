import React, { useEffect, useState } from 'react';
import api from '../api/client';
import Sidebar from '../components/Sidebar';
import MusicPlayer from '../components/MusicPlayer';
import type { HistoryEntry } from '../types/music';
import { Smile, Inbox, Trash2, ChevronDown, ChevronUp, Music2, Clock } from 'lucide-react';

const moodColors: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  Happiness:  { bg: 'rgba(234,179,8,0.12)',   border: 'rgba(234,179,8,0.3)',   text: '#fbbf24', glow: 'rgba(234,179,8,0.25)' },
  Sadness:    { bg: 'rgba(59,130,246,0.12)',   border: 'rgba(59,130,246,0.3)',  text: '#60a5fa', glow: 'rgba(59,130,246,0.25)' },
  Anger:      { bg: 'rgba(239,68,68,0.12)',    border: 'rgba(239,68,68,0.3)',   text: '#f87171', glow: 'rgba(239,68,68,0.25)' },
  Anxiety:    { bg: 'rgba(168,85,247,0.12)',   border: 'rgba(168,85,247,0.3)',  text: '#c084fc', glow: 'rgba(168,85,247,0.25)' },
  Fatigue:    { bg: 'rgba(148,163,184,0.12)',  border: 'rgba(148,163,184,0.3)', text: '#94a3b8', glow: 'rgba(148,163,184,0.25)' },
};
const defaultMoodStyle = { bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.3)', text: '#818cf8', glow: 'rgba(99,102,241,0.25)' };

function getMoodStyle(mood: string) {
  return moodColors[mood] || defaultMoodStyle;
}

const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<{ history: HistoryEntry[] }>('/api/history');
        setHistory(res.data.history || []);
      } catch {
        // fallback to localStorage
        const saved = localStorage.getItem('moodify_history');
        if (saved) setHistory(JSON.parse(saved));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('moodify_history');
    setHistory([]);
  };

  const totalSessions = history.length;
  const totalTracks = history.reduce((sum, session) => sum + (session.tracks || 0), 0);
  const moodCounts = history.reduce<Record<string, number>>((acc, session) => {
    acc[session.mood] = (acc[session.mood] || 0) + 1;
    return acc;
  }, {});
  const sortedMoodCounts = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]);
  const topMood = sortedMoodCounts[0]?.[0] || 'Your most common mood will appear here';
  const recentMood = history[0]?.mood || 'No recent mood yet';

  return (
    <div className="flex h-screen overflow-hidden bg-[#050505] text-white">
      <Sidebar />
      <main className="min-h-0 flex-1 p-8 overflow-y-auto custom-scrollbar">

        {/* Header */}
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start justify-between mb-10">
            <div>
              <p className="text-xs font-bold tracking-[0.25em] text-indigo-400 uppercase mb-2">Your Journey</p>
              <h1 className="text-4xl font-black tracking-tighter mb-2">Mood History</h1>
              <p className="text-neutral-500 text-base">Every emotional session, every playlist — saved for you.</p>
            </div>
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-all"
              >
                <Trash2 size={14} />
                Clear All
              </button>
            )}
          </div>

          {!loading && history.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-8">
              <div className="rounded-3xl border border-white/[0.08] bg-neutral-950 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Recent mood</p>
                <p className="mt-3 text-2xl font-bold text-white">{recentMood}</p>
                <p className="mt-2 text-sm text-neutral-400">What you felt in your latest saved session.</p>
              </div>
              <div className="rounded-3xl border border-white/[0.08] bg-neutral-950 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Most played mood</p>
                <p className="mt-3 text-2xl font-bold text-white">{topMood}</p>
                <p className="mt-2 text-sm text-neutral-400">The mood you choose most often.</p>
              </div>
              <div className="rounded-3xl border border-white/[0.08] bg-neutral-950 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Sessions</p>
                <p className="mt-3 text-2xl font-bold text-white">{totalSessions}</p>
                <p className="mt-2 text-sm text-neutral-400">Total mood sessions tracked.</p>
              </div>
              <div className="rounded-3xl border border-white/[0.08] bg-neutral-950 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Total tracks</p>
                <p className="mt-3 text-2xl font-bold text-white">{totalTracks}</p>
                <p className="mt-2 text-sm text-neutral-400">Songs saved across all sessions.</p>
              </div>
            </div>
          )}

          {!loading && history.length > 0 && (
            <div className="rounded-3xl border border-white/[0.08] bg-neutral-950 p-5 mb-10">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Mood distribution</p>
                  <h2 className="text-lg font-semibold text-white">Track how your moods change over time</h2>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {sortedMoodCounts.map(([mood, count]) => {
                  const width = totalSessions ? Math.max(10, Math.min(100, (count / totalSessions) * 100)) : 0;
                  return (
                    <div key={mood} className="space-y-2">
                      <div className="flex items-center justify-between text-sm text-neutral-300">
                        <span>{mood}</span>
                        <span>{count} session{count === 1 ? '' : 's'}</span>
                      </div>
                      <div className="h-3 rounded-full bg-white/[0.05] overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-400" style={{ width: `${width}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-24">
              <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
          )}

          {/* Empty state */}
          {!loading && history.length === 0 && (
            <div className="text-center py-24 rounded-3xl border border-white/[0.06] bg-white/[0.02]">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-5">
                <Inbox size={28} className="text-neutral-600" />
              </div>
              <h2 className="text-xl font-bold mb-2">No sessions yet</h2>
              <p className="text-neutral-500 text-sm max-w-xs mx-auto">Go to your Dashboard, detect your mood, and your first session will appear here.</p>
            </div>
          )}

          {/* Timeline */}
          {!loading && history.length > 0 && (
            <div className="space-y-3">
              {history.map((session, idx) => {
                const style = getMoodStyle(session.mood);
                const isOpen = expandedId === session.id;
                return (
                  <div
                    key={session.id}
                    className="rounded-2xl border overflow-hidden transition-all duration-300"
                    style={{
                      borderColor: isOpen ? style.border : 'rgba(255,255,255,0.06)',
                      background: isOpen ? style.bg : 'rgba(255,255,255,0.02)',
                      boxShadow: isOpen ? `0 0 30px ${style.glow}` : 'none',
                      animationDelay: `${idx * 0.05}s`,
                    }}
                  >
                    {/* Row */}
                    <button
                      className="w-full flex items-center gap-4 px-6 py-5 text-left hover:bg-white/[0.02] transition-colors"
                      onClick={() => setExpandedId(isOpen ? null : session.id)}
                    >
                      {/* Index */}
                      <span className="text-2xl font-black text-white/10 w-8 shrink-0 tabular-nums">{String(idx + 1).padStart(2, '0')}</span>

                      {/* Mood badge */}
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: style.bg, border: `1px solid ${style.border}` }}>
                        <Smile size={18} style={{ color: style.text }} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white truncate">{session.mood}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="flex items-center gap-1 text-xs text-neutral-600">
                            <Clock size={11} />{session.date}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-neutral-600">
                            <Music2 size={11} />{session.tracks} tracks
                          </span>
                        </div>
                      </div>

                      {/* Mood pill */}
                      <span className="hidden md:inline-flex px-3 py-1 rounded-full text-xs font-bold shrink-0"
                        style={{ background: style.bg, border: `1px solid ${style.border}`, color: style.text }}>
                        {session.mood}
                      </span>

                      {/* Chevron */}
                      <div className="text-neutral-600 shrink-0">
                        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </button>

                    {/* Expanded player */}
                    {isOpen && session.songs && session.songs.length > 0 && (
                      <div className="px-6 pb-6 border-t border-white/[0.06]">
                        <div className="pt-5">
                          <MusicPlayer songs={session.songs} videoIds={session.videoIds || []} />
                        </div>
                      </div>
                    )}
                    {isOpen && (!session.songs || session.songs.length === 0) && (
                      <div className="px-6 pb-5 border-t border-white/[0.06] pt-4 text-neutral-600 text-sm text-center">
                        No song data saved for this session.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HistoryPage;
