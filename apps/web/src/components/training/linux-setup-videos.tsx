'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MonitorPlay, Play, X, RotateCcw, Loader2, Search, ChevronRight, Server, Box, Terminal, FlaskConical, Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

type Platform = 'VMware' | 'VirtualBox' | 'WSL' | 'Lab Build';
type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

interface SetupVideo {
  id: string;
  title: string;
  channel: string;
  description: string;
  thumbnail: string;
  platform: Platform;
  difficulty: Difficulty;
}

const PLATFORM_CONFIG: Record<Platform, { icon: React.ElementType; color: string }> = {
  'VMware':     { icon: Server,       color: 'text-blue-400 bg-blue-500/15 border-blue-500/30' },
  'VirtualBox': { icon: Box,          color: 'text-orange-400 bg-orange-500/15 border-orange-500/30' },
  'WSL':        { icon: Terminal,     color: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30' },
  'Lab Build':  { icon: FlaskConical, color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' },
};

const LEVEL_COLOR: Record<Difficulty, string> = {
  Beginner:     'text-green-400 bg-green-500/10 border-green-500/25',
  Intermediate: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/25',
  Advanced:     'text-red-400 bg-red-500/10 border-red-500/25',
};

const ALL_PLATFORMS: (Platform | 'All')[] = ['All', 'VMware', 'VirtualBox', 'WSL', 'Lab Build'];

// ─── Video Card ───────────────────────────────────────────────────────────────

function VideoCard({ video, isSelected, onClick, index }: {
  video: SetupVideo; isSelected: boolean; onClick: () => void; index: number;
}) {
  const cfg = PLATFORM_CONFIG[video.platform] ?? PLATFORM_CONFIG['VirtualBox'];
  const PIcon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.025, duration: 0.2 }}
      onClick={onClick}
      className={cn(
        'group cursor-pointer rounded-2xl border overflow-hidden transition-all duration-200',
        isSelected
          ? 'border-emerald-500/60 ring-1 ring-emerald-500/30 bg-[#031a0e]'
          : 'border-white/6 bg-[#0a0f1e] hover:border-white/15 hover:bg-[#0d1425]',
      )}
    >
      <div className="relative aspect-video bg-[#060c1a] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            if (!img.src.includes('mqdefault')) img.src = `https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`;
          }}
        />
        <div className={cn(
          'absolute inset-0 flex items-center justify-center transition-opacity duration-200',
          isSelected ? 'opacity-100 bg-emerald-500/20' : 'opacity-0 group-hover:opacity-100 bg-black/40',
        )}>
          <div className={cn('w-12 h-12 rounded-full flex items-center justify-center shadow-xl', isSelected ? 'bg-emerald-500' : 'bg-white/90')}>
            <Play className={cn('w-5 h-5 ml-0.5', isSelected ? 'text-white' : 'text-gray-900')} fill="currentColor" />
          </div>
        </div>
        {isSelected && (
          <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />PLAYING
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-xs font-semibold text-white leading-snug line-clamp-2 mb-1.5">{video.title}</h3>
        <p className="text-[10px] text-slate-500 mb-2">{video.channel}</p>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={cn('inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full border', cfg.color)}>
            <PIcon className="w-2.5 h-2.5" />{video.platform}
          </span>
          <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded-full border', LEVEL_COLOR[video.difficulty])}>
            {video.difficulty}
          </span>
          <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full border text-violet-300 bg-violet-500/15 border-violet-500/35" title="AI-curated pick">
            <Sparkles className="w-2.5 h-2.5" /> AI
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

export function LinuxSetupVideos() {
  const [videos, setVideos] = useState<SetupVideo[]>([]);
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [activePlatform, setActivePlatform] = useState<Platform | 'All'>('All');
  const [selected, setSelected] = useState<SetupVideo | null>(null);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    setSelected(null);
    try {
      const res = await fetch('/api/brain/linux-setup');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch videos');
      setVideos(data.videos ?? []);
      setTopic(data.topic ?? '');
      toast.success(`Loaded ${data.videos?.length ?? 0} setup videos`, {
        style: { background: '#0a0a0a', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch videos';
      toast.error(msg, { style: { background: '#0a0a0a', color: '#f87171' } });
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch, then auto-open a random video — the "random video with AI" pick.
  const surpriseMe = useCallback(async () => {
    setLoading(true);
    setSelected(null);
    try {
      const res = await fetch('/api/brain/linux-setup');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch videos');
      const list: SetupVideo[] = data.videos ?? [];
      setVideos(list);
      setTopic(data.topic ?? '');
      if (list.length) {
        const pick = list[Math.floor(Math.random() * list.length)];
        setSelected(pick);
        toast.success(`Playing: ${pick.title.slice(0, 40)}…`, {
          style: { background: '#0a0a0a', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.3)' },
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch videos';
      toast.error(msg, { style: { background: '#0a0a0a', color: '#f87171' } });
    } finally {
      setLoading(false);
    }
  }, []);

  const filtered = useMemo(() => {
    return videos.filter((v) => {
      const matchP = activePlatform === 'All' || v.platform === activePlatform;
      const q = search.toLowerCase();
      const matchS = !q || v.title.toLowerCase().includes(q) || v.channel.toLowerCase().includes(q);
      return matchP && matchS;
    });
  }, [videos, search, activePlatform]);

  const handleSelect = (v: SetupVideo) => setSelected((prev) => (prev?.id === v.id ? null : v));

  return (
    <div style={{ background: 'rgba(96,165,250,0.03)', border: '1px solid rgba(96,165,250,0.18)', borderRadius: 12, padding: 18 }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-1 flex-wrap">
        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
          <MonitorPlay className="w-4.5 h-4.5 text-white" />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            Linux Setup Videos
            <span className="text-[9px] font-bold text-blue-300 bg-blue-500/12 border border-blue-500/30 rounded px-1.5 py-0.5 tracking-wide">
              VMWARE · VIRTUALBOX
            </span>
          </h2>
          <p className="text-[11px] text-slate-500">
            {topic && videos.length > 0 ? `Topic: ${topic}` : 'Install Kali & Linux for cybersecurity — from the most-watched YouTubers'}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {videos.length > 0 && (
            <span className="text-[11px] text-slate-500 bg-white/5 border border-white/8 rounded-full px-3 py-1">
              {filtered.length} / {videos.length}
            </span>
          )}
          <button
            onClick={surpriseMe}
            disabled={loading}
            title="Fetch and auto-play a random setup video"
            className={cn(
              'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all',
              loading ? 'bg-white/5 border-white/10 text-slate-500 cursor-not-allowed'
                : 'bg-violet-500/15 border-violet-500/35 text-violet-300 hover:bg-violet-500/25 hover:border-violet-500/50',
            )}
          >
            <Play className="w-3.5 h-3.5" />Random with AI
          </button>
          <button
            onClick={fetchVideos}
            disabled={loading}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all',
              loading ? 'bg-white/5 border-white/10 text-slate-500 cursor-not-allowed'
                : 'bg-blue-500/15 border-blue-500/35 text-blue-300 hover:bg-blue-500/25 hover:border-blue-500/50',
            )}
          >
            {loading ? (<><Loader2 className="w-3.5 h-3.5 animate-spin" />Fetching…</>) : (<><RotateCcw className="w-3.5 h-3.5" />Fetch Videos</>)}
          </button>
        </div>
      </div>

      {/* Filters — only when loaded */}
      {videos.length > 0 && (
        <div className="mt-4">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search setup videos by title or channel…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/8 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-slate-500 hover:text-white transition-colors" />
              </button>
            )}
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {ALL_PLATFORMS.map((p) => {
              const cfg = p === 'All' ? null : PLATFORM_CONFIG[p as Platform];
              const Icon = cfg?.icon;
              const count = p === 'All' ? videos.length : videos.filter((v) => v.platform === p).length;
              return (
                <button
                  key={p}
                  onClick={() => setActivePlatform(p as Platform | 'All')}
                  className={cn(
                    'flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all',
                    activePlatform === p
                      ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                      : 'bg-transparent border-white/8 text-slate-500 hover:border-white/15 hover:text-slate-300',
                  )}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}{p} ({count})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Embedded Player */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-[#0a0a0a] border border-emerald-500/25 rounded-2xl overflow-hidden shadow-2xl shadow-emerald-500/10">
              <div className="flex items-start gap-3 p-4 border-b border-white/5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse flex-shrink-0" />
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Now Playing</span>
                  </div>
                  <h3 className="text-sm font-bold text-white leading-snug">{selected.title}</h3>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-xs text-slate-500">{selected.channel}</span>
                    <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded-full border', LEVEL_COLOR[selected.difficulty])}>{selected.difficulty}</span>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} aria-label="Close player" className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 border border-white/8 transition-colors">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
              <div className="relative aspect-video w-full bg-black">
                <iframe
                  key={selected.id}
                  src={`https://www.youtube-nocookie.com/embed/${selected.id}?autoplay=1&rel=0&modestbranding=1&color=white`}
                  title={selected.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
              <div className="p-4">
                <p className="text-xs text-slate-400 leading-relaxed">{selected.description}</p>
                <a
                  href={`https://www.youtube.com/watch?v=${selected.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Open on YouTube <ChevronRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!loading && videos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-3">
            <MonitorPlay className="w-7 h-7 text-blue-400/60" />
          </div>
          <p className="text-sm text-slate-300 font-semibold mb-1">Set up your hacking lab</p>
          <p className="text-xs text-slate-500 mb-4 max-w-sm">
            Click &ldquo;Fetch Videos&rdquo; to load real, playable tutorials on installing Kali &amp; Linux on VMware and VirtualBox for cybersecurity.
          </p>
          <button
            onClick={fetchVideos}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            <MonitorPlay className="w-4 h-4" />Fetch Setup Videos
          </button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && videos.length === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/6 bg-[#0a0f1e] overflow-hidden animate-pulse">
              <div className="aspect-video bg-white/5" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-white/8 rounded w-4/5" />
                <div className="h-3 bg-white/5 rounded w-3/5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results */}
      {!loading && filtered.length === 0 && videos.length > 0 && (
        <div className="text-center py-10 text-slate-500">
          <MonitorPlay className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No videos match your filters.</p>
        </div>
      )}

      {/* Grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
          {filtered.map((v, i) => (
            <VideoCard key={v.id} video={v} isSelected={selected?.id === v.id} onClick={() => handleSelect(v)} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
