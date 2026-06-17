"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Youtube,
  Search,
  Play,
  X,
  RotateCcw,
  Loader2,
  Shield,
  Target,
  Bug,
  Wifi,
  Eye,
  AlertTriangle,
  GraduationCap,
  Wrench,
  ChevronRight,
  Key,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

type VideoCategory =
  | "Hacking"
  | "CTF"
  | "Malware"
  | "Network Security"
  | "OSINT"
  | "Incident Response"
  | "Certifications"
  | "Tools";

type Difficulty = "Beginner" | "Intermediate" | "Advanced";

interface CyberVideo {
  id: string;
  title: string;
  channel: string;
  category: VideoCategory;
  description: string;
  difficulty: Difficulty;
  thumbnail: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<VideoCategory, { icon: React.ElementType; color: string }> = {
  "Hacking":           { icon: Shield,        color: "text-green-400 bg-green-500/15 border-green-500/30" },
  "CTF":               { icon: Target,        color: "text-blue-400 bg-blue-500/15 border-blue-500/30" },
  "Malware":           { icon: Bug,           color: "text-red-400 bg-red-500/15 border-red-500/30" },
  "Network Security":  { icon: Wifi,          color: "text-cyan-400 bg-cyan-500/15 border-cyan-500/30" },
  "OSINT":             { icon: Eye,           color: "text-purple-400 bg-purple-500/15 border-purple-500/30" },
  "Incident Response": { icon: AlertTriangle, color: "text-orange-400 bg-orange-500/15 border-orange-500/30" },
  "Certifications":    { icon: GraduationCap, color: "text-yellow-400 bg-yellow-500/15 border-yellow-500/30" },
  "Tools":             { icon: Wrench,        color: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30" },
};

const LEVEL_COLOR: Record<Difficulty, string> = {
  Beginner:     "text-green-400 bg-green-500/10 border-green-500/25",
  Intermediate: "text-yellow-400 bg-yellow-500/10 border-yellow-500/25",
  Advanced:     "text-red-400 bg-red-500/10 border-red-500/25",
};

const ALL_CATEGORIES: (VideoCategory | "All")[] = [
  "All", "Hacking", "CTF", "Malware", "Network Security",
  "OSINT", "Incident Response", "Certifications", "Tools",
];

// ─── Video Card ───────────────────────────────────────────────────────────────

function VideoCard({
  video,
  isSelected,
  onClick,
  index,
}: {
  video: CyberVideo;
  isSelected: boolean;
  onClick: () => void;
  index: number;
}) {
  const cat = CATEGORY_CONFIG[video.category] ?? CATEGORY_CONFIG["Hacking"];
  const CatIcon = cat.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.025, duration: 0.2 }}
      onClick={onClick}
      className={cn(
        "group cursor-pointer rounded-2xl border overflow-hidden transition-all duration-200",
        isSelected
          ? "border-red-500/60 ring-1 ring-red-500/30 bg-[#180a0a]"
          : "border-white/6 bg-[#0a0f1e] hover:border-white/15 hover:bg-[#0d1425]"
      )}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-[#060c1a] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            if (!img.src.includes("mqdefault")) {
              img.src = `https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`;
            }
          }}
        />
        {/* Play overlay */}
        <div className={cn(
          "absolute inset-0 flex items-center justify-center transition-opacity duration-200",
          isSelected ? "opacity-100 bg-red-500/20" : "opacity-0 group-hover:opacity-100 bg-black/40"
        )}>
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center shadow-xl",
            isSelected ? "bg-red-500" : "bg-white/90"
          )}>
            <Play className={cn("w-5 h-5 ml-0.5", isSelected ? "text-white" : "text-gray-900")} fill="currentColor" />
          </div>
        </div>
        {/* Playing indicator */}
        {isSelected && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            PLAYING
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-xs font-semibold text-white leading-snug line-clamp-2 mb-1.5">
          {video.title}
        </h3>
        <p className="text-[10px] text-slate-500 mb-2">{video.channel}</p>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={cn(
            "inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full border",
            cat.color
          )}>
            <CatIcon className="w-2.5 h-2.5" />
            {video.category}
          </span>
          <span className={cn(
            "text-[9px] font-bold px-1.5 py-0.5 rounded-full border",
            LEVEL_COLOR[video.difficulty]
          )}>
            {video.difficulty}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Setup Screen ─────────────────────────────────────────────────────────────

function SetupScreen() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-8 max-w-lg mx-auto">
      <div className="w-16 h-16 bg-yellow-500/10 border border-yellow-500/25 rounded-2xl flex items-center justify-center mb-5">
        <Key className="w-8 h-8 text-yellow-400" />
      </div>
      <h2 className="text-lg font-black text-white mb-2">YouTube API Key Required</h2>
      <p className="text-sm text-slate-400 mb-6 leading-relaxed">
        CyberTube uses the free YouTube Data API to fetch real, playable videos.
        You need to add a <code className="text-yellow-400 bg-yellow-500/10 px-1 rounded">YOUTUBE_API_KEY</code> to get started.
      </p>

      <div className="w-full bg-white/3 border border-white/8 rounded-xl p-5 text-left mb-5 space-y-3">
        <p className="text-xs font-bold text-white uppercase tracking-wider">Setup — 3 steps</p>
        {[
          { step: "1", text: "Go to Google Cloud Console → APIs & Services → YouTube Data API v3 → Enable it" },
          { step: "2", text: "Create credentials → API Key → copy the key" },
          { step: "3", text: "Add YOUTUBE_API_KEY=your_key to your .env.local and to Vercel project settings" },
        ].map(({ step, text }) => (
          <div key={step} className="flex gap-3 items-start">
            <span className="flex-shrink-0 w-5 h-5 bg-red-500/20 border border-red-500/30 rounded-full text-[10px] font-black text-red-400 flex items-center justify-center">
              {step}
            </span>
            <p className="text-xs text-slate-400 leading-relaxed">{text}</p>
          </div>
        ))}
      </div>

      <a
        href="https://console.cloud.google.com/apis/library/youtube.googleapis.com"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
      >
        <Youtube className="w-4 h-4" />
        Open Google Cloud Console
        <ExternalLink className="w-3.5 h-3.5" />
      </a>

      <p className="text-[11px] text-slate-600 mt-4">
        The free tier gives 10,000 quota units/day — enough for ~100 fetches.
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TubePage() {
  const [videos, setVideos] = useState<CyberVideo[]>([]);
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<VideoCategory | "All">("All");
  const [selectedVideo, setSelectedVideo] = useState<CyberVideo | null>(null);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    setSelectedVideo(null);
    setNeedsSetup(false);
    try {
      const res = await fetch("/api/brain/tube");
      const data = await res.json();
      if (data.setup) {
        setNeedsSetup(true);
        return;
      }
      if (!res.ok) throw new Error(data.error || "Failed to fetch videos");
      setVideos(data.videos ?? []);
      setTopic(data.topic ?? "");
      toast.success(`Loaded ${data.videos?.length ?? 0} videos`, {
        style: { background: "#0a0a0a", color: "#00ff41", border: "1px solid rgba(0,255,65,0.2)" },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to fetch videos";
      toast.error(msg, { style: { background: "#0a0a0a", color: "#f87171" } });
    } finally {
      setLoading(false);
    }
  }, []);

  const filtered = useMemo(() => {
    return videos.filter((v) => {
      const matchCat = activeCategory === "All" || v.category === activeCategory;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        v.title.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.channel.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [videos, search, activeCategory]);

  const handleSelect = (video: CyberVideo) => {
    setSelectedVideo((prev) => (prev?.id === video.id ? null : video));
  };

  const countByLevel = (level: Difficulty) => videos.filter((v) => v.difficulty === level).length;

  return (
    <div className="flex-1 overflow-auto bg-[#080f1e]">
      {/* ── Header ── */}
      <div className="sticky top-0 z-20 bg-[#080f1e]/95 backdrop-blur-xl border-b border-white/5">
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
              <Youtube className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white">CyberTube</h1>
              <p className="text-xs text-slate-500">
                {topic ? `Topic: ${topic}` : "Real cybersecurity YouTube videos — powered by YouTube Data API"}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {videos.length > 0 && (
                <span className="text-xs text-slate-500 bg-white/5 border border-white/8 rounded-full px-3 py-1">
                  {filtered.length} / {videos.length} videos
                </span>
              )}
              <button
                onClick={fetchVideos}
                disabled={loading}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all",
                  loading
                    ? "bg-white/5 border-white/10 text-slate-500 cursor-not-allowed"
                    : "bg-red-500/15 border-red-500/35 text-red-300 hover:bg-red-500/25 hover:border-red-500/50"
                )}
              >
                {loading ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" />Fetching…</>
                ) : (
                  <><RotateCcw className="w-3.5 h-3.5" />Fetch 20</>
                )}
              </button>
            </div>
          </div>

          {/* Search — only when videos are loaded */}
          {videos.length > 0 && (
            <>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by title, channel, or topic…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white/5 border border-white/8 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X className="w-4 h-4 text-slate-500 hover:text-white transition-colors" />
                  </button>
                )}
              </div>

              {/* Category tabs */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                {ALL_CATEGORIES.map((cat) => {
                  const config = cat === "All" ? null : CATEGORY_CONFIG[cat as VideoCategory];
                  const Icon = config?.icon;
                  const count = cat === "All"
                    ? videos.length
                    : videos.filter((v) => v.category === cat).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat as VideoCategory | "All")}
                      className={cn(
                        "flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                        activeCategory === cat
                          ? "bg-red-500/20 border-red-500/40 text-red-300"
                          : "bg-transparent border-white/8 text-slate-500 hover:border-white/15 hover:text-slate-300"
                      )}
                    >
                      {Icon && <Icon className="w-3.5 h-3.5" />}
                      {cat} ({count})
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-6 py-6">

        {/* ── Setup screen ── */}
        {needsSetup && !loading && <SetupScreen />}

        {/* ── Embedded Player ── */}
        <AnimatePresence>
          {selectedVideo && (
            <motion.div
              key={selectedVideo.id}
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="bg-[#0a0a0a] border border-red-500/25 rounded-2xl overflow-hidden shadow-2xl shadow-red-500/10">
                {/* Player header */}
                <div className="flex items-start gap-3 p-4 border-b border-white/5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse flex-shrink-0" />
                      <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Now Playing</span>
                    </div>
                    <h2 className="text-sm font-bold text-white leading-snug">{selectedVideo.title}</h2>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-xs text-slate-500">{selectedVideo.channel}</span>
                      <span className={cn(
                        "text-[9px] font-bold px-1.5 py-0.5 rounded-full border",
                        LEVEL_COLOR[selectedVideo.difficulty]
                      )}>
                        {selectedVideo.difficulty}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedVideo(null)}
                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 border border-white/8 transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>

                {/* Iframe player */}
                <div className="relative aspect-video w-full bg-black">
                  <iframe
                    key={selectedVideo.id}
                    src={`https://www.youtube-nocookie.com/embed/${selectedVideo.id}?autoplay=1&rel=0&modestbranding=1&color=white`}
                    title={selectedVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>

                {/* Description */}
                <div className="p-4">
                  <p className="text-xs text-slate-400 leading-relaxed">{selectedVideo.description}</p>
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    {(() => {
                      const cat = CATEGORY_CONFIG[selectedVideo.category] ?? CATEGORY_CONFIG["Hacking"];
                      const CatIcon = cat.icon;
                      return (
                        <span className={cn(
                          "inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border",
                          cat.color
                        )}>
                          <CatIcon className="w-3 h-3" />
                          {selectedVideo.category}
                        </span>
                      );
                    })()}
                    <a
                      href={`https://www.youtube.com/watch?v=${selectedVideo.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      Open on YouTube <ChevronRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Empty state ── */}
        {!loading && !needsSetup && videos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mb-4">
              <Youtube className="w-8 h-8 text-red-400/60" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">No videos yet</h2>
            <p className="text-sm text-slate-500 mb-6 max-w-sm">
              Click &ldquo;Fetch 20&rdquo; to load real cybersecurity YouTube videos via the YouTube Data API.
            </p>
            <button
              onClick={fetchVideos}
              disabled={loading}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-3 rounded-xl transition-colors"
            >
              <Youtube className="w-4 h-4" />
              Fetch 20 Videos
            </button>
          </div>
        )}

        {/* ── Loading skeleton ── */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-white/6 bg-[#0a0f1e] overflow-hidden animate-pulse">
                <div className="aspect-video bg-white/5" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-white/8 rounded w-4/5" />
                  <div className="h-3 bg-white/5 rounded w-3/5" />
                  <div className="flex gap-2">
                    <div className="h-4 w-16 bg-white/5 rounded-full" />
                    <div className="h-4 w-14 bg-white/5 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Stats row ── */}
        {!loading && videos.length > 0 && (
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { label: "Total Videos", value: videos.length,             color: "text-white" },
              { label: "Beginner",     value: countByLevel("Beginner"),     color: "text-green-400" },
              { label: "Intermediate", value: countByLevel("Intermediate"), color: "text-yellow-400" },
              { label: "Advanced",     value: countByLevel("Advanced"),     color: "text-red-400" },
            ].map((s) => (
              <div key={s.label} className="bg-white/3 border border-white/6 rounded-xl p-3 text-center">
                <div className={cn("text-2xl font-black", s.color)}>{s.value}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── No search results ── */}
        {!loading && filtered.length === 0 && videos.length > 0 && (
          <div className="text-center py-16 text-slate-500">
            <Youtube className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No videos match your search.</p>
          </div>
        )}

        {/* ── Video Grid ── */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((video, i) => (
              <VideoCard
                key={video.id}
                video={video}
                isSelected={selectedVideo?.id === video.id}
                onClick={() => handleSelect(video)}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
