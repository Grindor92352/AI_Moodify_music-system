import React, { useRef, useState } from 'react';
import axios from 'axios';
import MusicPlayer from './MusicPlayer';

interface Song {
  videoId: string;
  title: string;
  artist: string;
}

interface MusicResponse {
  mood?: string | null;
  videoIds?: string[];
  songs?: Song[];
}

const API = 'http://localhost:5000/api/music';

const moodColors: Record<string, string> = {
  happiness: 'from-yellow-400 to-orange-400',
  fatigue:   'from-indigo-400 to-blue-400',
  sadness:   'from-blue-400 to-cyan-500',
  stress:    'from-teal-400 to-green-400',
  anxiety:   'from-teal-400 to-green-400',
  anger:     'from-red-400 to-rose-500',
};

const TherapyDashboard: React.FC = () => {
  const videoRef   = useRef<HTMLVideoElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const streamRef  = useRef<MediaStream | null>(null);

  const [emotion,      setEmotion]      = useState<string>('');
  const [songs,        setSongs]        = useState<Song[]>([]);
  const [videoIds,     setVideoIds]     = useState<string[]>([]);
  const [isAnalyzing,  setIsAnalyzing]  = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [statusMsg,    setStatusMsg]    = useState<string>('');
  const [error,        setError]        = useState<string>('');

  // ── Helpers ─────────────────────────────────────────────────────────────

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
  };

  const applyMusicResponse = (data: MusicResponse, detectedMood?: string) => {
    const mood = data.mood ?? detectedMood ?? null;
    if (mood) setEmotion(mood);

    const newSongs = data.songs ?? [];
    const newIds   = data.videoIds ?? newSongs.map(s => s.videoId);

    if (newSongs.length > 0) {
      setSongs(newSongs);
      setVideoIds(newIds);
    } else if (newIds.length > 0) {
      setVideoIds(newIds);
    }
    return { mood, count: newSongs.length || newIds.length };
  };

  // ── Handler 1: Detect My Mood (camera → AI → songs) ─────────────────────

  const handleDetectMood = async () => {
    setError('');
    setStatusMsg('');
    setIsAnalyzing(true);

    // Step A: Activate webcam
    let stream: MediaStream;
    try {
      setStatusMsg('Activating camera…');
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await new Promise<void>(resolve => {
          if (videoRef.current) videoRef.current.onloadeddata = () => resolve();
        });
      }
      setCameraActive(true);
    } catch {
      setError('Camera access denied or unavailable. Please allow camera permissions.');
      setIsAnalyzing(false);
      return;
    }

    // Step B: Wait 2 seconds for auto-exposure/focus to stabilise
    setStatusMsg('Hold still… adjusting exposure (2s)…');
    await new Promise(r => setTimeout(r, 2000));

    // Step C: Capture single frame
    try {
      const video   = videoRef.current!;
      const canvas  = canvasRef.current!;
      const context = canvas.getContext('2d');

      if (!context || video.readyState < video.HAVE_CURRENT_DATA) {
        throw new Error('Video stream not ready for capture.');
      }

      canvas.width  = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64Image = canvas.toDataURL('image/jpeg', 0.85);

      // Step D: Kill camera immediately — no longer needed
      stopCamera();
      setStatusMsg('Analyzing your mood with AI…');

      // Step E: Send to Node backend
      const res = await axios.post<MusicResponse>(`${API}/analyze`, { image: base64Image });
      const { mood, count } = applyMusicResponse(res.data);

      setStatusMsg(
        count > 0
          ? `Detected: ${mood} ✓ — Playlist loaded!`
          : mood
            ? `Detected: ${mood}. No tracks returned — keeping current playlist.`
            : 'No face detected. Try again in better lighting.'
      );
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.error ?? err.message
        : 'Unexpected analysis error.';
      setError(`Analysis failed: ${msg}`);
      stopCamera();
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ── Handler 2: Refresh Songs (no camera — re-uses saved mood) ───────────

  const handleRefreshSongs = async () => {
    if (!emotion) return;
    setIsRefreshing(true);
    setError('');

    try {
      const res = await axios.post<MusicResponse>(`${API}/refresh`, { mood: emotion });
      const { count } = applyMusicResponse(res.data, emotion);
      setStatusMsg(`Refreshed! ${count} new tracks for "${emotion}".`);
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.error ?? err.message
        : 'Refresh failed.';
      setError(`Refresh error: ${msg}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  // ── Derived UI state ─────────────────────────────────────────────────────

  const moodKey       = emotion.toLowerCase();
  const gradientClass = moodColors[moodKey] ?? 'from-indigo-400 via-purple-400 to-pink-500';
  const trackCount    = songs.length || videoIds.length;

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-10 flex flex-col items-center justify-start font-sans selection:bg-purple-500/30">

      {/* Header */}
      <header className="mb-10 lg:mb-16 text-center w-full max-w-4xl mt-4">
        <div className="inline-block mb-3 px-3 py-1 rounded-full border border-neutral-800 bg-neutral-900/50 backdrop-blur-sm text-xs font-medium text-neutral-400 tracking-widest uppercase">
          AI-Powered Session
        </div>
        <h1 className={`text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-br ${gradientClass} text-transparent bg-clip-text drop-shadow-sm mb-4 transition-all duration-700`}>
          Moodify Therapy
        </h1>
        <p className="text-neutral-400 text-lg md:text-xl font-light max-w-2xl mx-auto">
          Real-time emotional analysis and adaptive Bollywood music curation.
        </p>
      </header>

      <main className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 relative items-start">

        {/* ── Left Column: Camera & Emotion ────────────────────────────── */}
        <div className="lg:col-span-5 flex flex-col gap-6 sticky top-8">

          {/* Camera Frame */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-[2rem] p-1.5 shadow-[0_0_50px_-12px_rgba(168,85,247,0.15)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 opacity-50 pointer-events-none" />

            <div className="relative rounded-[1.75rem] overflow-hidden bg-black aspect-[4/3] flex items-center justify-center border border-neutral-800/50 shadow-inner">
              <video
                ref={videoRef}
                autoPlay playsInline muted
                className={`w-full h-full object-cover transform -scale-x-100 transition-opacity duration-700 ${cameraActive ? 'opacity-100' : 'opacity-0'}`}
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Camera idle placeholder */}
              {!cameraActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-600 space-y-3">
                  <svg className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                  </svg>
                  <p className="text-sm text-neutral-500">Camera idle</p>
                </div>
              )}

              {/* LIVE indicator */}
              {cameraActive && (
                <div className="absolute top-4 left-4 flex items-center space-x-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                  </span>
                  <span className="text-[10px] font-bold text-red-400 tracking-widest uppercase">Capturing</span>
                </div>
              )}
            </div>
          </div>

          {/* Detect My Mood button */}
          <button
            id="detect-mood-btn"
            onClick={handleDetectMood}
            disabled={isAnalyzing || isRefreshing}
            className={`
              w-full py-4 px-6 rounded-2xl font-bold text-base tracking-wide
              transition-all duration-300 relative overflow-hidden
              ${(isAnalyzing || isRefreshing)
                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
                : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-400 hover:to-purple-500 shadow-[0_0_30px_-5px_rgba(139,92,246,0.5)] hover:shadow-[0_0_40px_-5px_rgba(139,92,246,0.7)] hover:scale-[1.02] active:scale-[0.98] border border-purple-500/30'
              }
            `}
          >
            {isAnalyzing ? (
              <span className="flex items-center justify-center gap-3">
                <span className="w-4 h-4 border-2 border-neutral-500 border-t-neutral-300 rounded-full animate-spin" />
                {statusMsg || 'Analyzing…'}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Detect My Mood
              </span>
            )}
          </button>

          {/* Status message (non-error) */}
          {statusMsg && !isAnalyzing && !error && (
            <p className="text-center text-neutral-400 text-sm px-2">{statusMsg}</p>
          )}

          {/* Error message */}
          {error && (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* Emotion Card + Refresh button */}
          {emotion && (
            <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 rounded-[2rem] p-8 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300 hover:border-neutral-700">
              <h2 className="text-xs uppercase tracking-[0.2em] text-neutral-500 font-semibold mb-4 z-10">
                Current Emotional State
              </h2>

              <div className={`text-4xl md:text-5xl font-extrabold tracking-tight capitalize drop-shadow-lg z-10 transition-all duration-500 bg-gradient-to-r ${gradientClass} text-transparent bg-clip-text mb-6`}>
                {emotion}
              </div>

              {/* Refresh Songs button — no camera, instant */}
              <button
                id="refresh-songs-btn"
                onClick={handleRefreshSongs}
                disabled={isAnalyzing || isRefreshing}
                className={`
                  z-10 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                  transition-all duration-200
                  ${isRefreshing
                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
                    : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-neutral-300 hover:text-white hover:scale-[1.02] active:scale-[0.98]'
                  }
                `}
              >
                {isRefreshing ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-neutral-500 border-t-neutral-300 rounded-full animate-spin" />
                    Refreshing…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh Songs
                  </>
                )}
              </button>

              <div className="mt-4 px-4 py-1.5 bg-white/5 rounded-full border border-white/10 text-xs text-neutral-400 z-10 flex items-center space-x-2">
                <svg className="w-3.5 h-3.5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>AI Detected · Re-scan or refresh playlist</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Right Column: Music Player ───────────────────────────────── */}
        <div className="lg:col-span-7 flex flex-col h-full mt-8 lg:mt-0">
          <div className="bg-neutral-900/40 border border-neutral-800/60 rounded-[2rem] p-6 md:p-8 shadow-2xl backdrop-blur-xl flex flex-col flex-grow min-h-[600px]">

            {/* Player header */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-800/50">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <svg className="w-6 h-6 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
                Bollywood Therapy Tracks
              </h2>
              {trackCount > 0 && (
                <span className="text-xs font-semibold px-3 py-1 bg-red-500/10 text-red-300 rounded-lg border border-red-500/20">
                  {trackCount} Videos
                </span>
              )}
            </div>

            <div className="custom-scrollbar overflow-y-auto flex-grow pr-2 h-full">
              <MusicPlayer videoIds={videoIds} songs={songs} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TherapyDashboard;
