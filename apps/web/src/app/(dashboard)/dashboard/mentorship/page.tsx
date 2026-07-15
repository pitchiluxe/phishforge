"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Play,
  X,
  RotateCcw,
  Loader2,
  Shield,
  Target,
  Bug,
  Eye,
  GraduationCap,
  ChevronRight,
  Key,
  ExternalLink,
  BookOpen,
  Award,
  Swords,
  Globe,
  Users,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

type Level = "Beginner" | "Intermediate" | "Advanced";

type CourseCategory =
  | "Fundamentals"
  | "Penetration Testing"
  | "Bug Bounty"
  | "CTF Training"
  | "Blue Team"
  | "Malware Analysis"
  | "Certifications"
  | "Web Hacking";

interface CyberCourse {
  id: string;
  title: string;
  channel: string;
  category: CourseCategory;
  description: string;
  level: Level;
  thumbnail: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<CourseCategory, { icon: React.ElementType; color: string }> = {
  "Fundamentals":        { icon: BookOpen,    color: "text-green-400 bg-green-500/15 border-green-500/30" },
  "Penetration Testing": { icon: Swords,      color: "text-red-400 bg-red-500/15 border-red-500/30" },
  "Bug Bounty":          { icon: Target,      color: "text-orange-400 bg-orange-500/15 border-orange-500/30" },
  "CTF Training":        { icon: Award,       color: "text-blue-400 bg-blue-500/15 border-blue-500/30" },
  "Blue Team":           { icon: Shield,      color: "text-cyan-400 bg-cyan-500/15 border-cyan-500/30" },
  "Malware Analysis":    { icon: Bug,         color: "text-purple-400 bg-purple-500/15 border-purple-500/30" },
  "Certifications":      { icon: GraduationCap, color: "text-yellow-400 bg-yellow-500/15 border-yellow-500/30" },
  "Web Hacking":         { icon: Globe,       color: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30" },
};

const LEVEL_CONFIG: Record<Level, { color: string; badge: string; desc: string }> = {
  Beginner:     { color: "text-green-400 bg-green-500/10 border-green-500/25",   badge: "bg-green-500",  desc: "No prior experience required" },
  Intermediate: { color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/25", badge: "bg-yellow-500", desc: "Some security knowledge assumed" },
  Advanced:     { color: "text-red-400 bg-red-500/10 border-red-500/25",         badge: "bg-red-500",    desc: "Expert-level deep dives" },
};

const ALL_CATEGORIES: (CourseCategory | "All")[] = [
  "All", "Fundamentals", "Penetration Testing", "Bug Bounty",
  "CTF Training", "Blue Team", "Malware Analysis", "Certifications", "Web Hacking",
];

const ALL_LEVELS: (Level | "All")[] = ["All", "Beginner", "Intermediate", "Advanced"];

// ─── Course Card ──────────────────────────────────────────────────────────────

function CourseCard({
  course,
  isSelected,
  onClick,
  index,
}: {
  course: CyberCourse;
  isSelected: boolean;
  onClick: () => void;
  index: number;
}) {
  const cat = CATEGORY_CONFIG[course.category] ?? CATEGORY_CONFIG["Fundamentals"];
  const CatIcon = cat.icon;
  const lvl = LEVEL_CONFIG[course.level];

  return (
    <motion.div
      role="button"
      tabIndex={0}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.025, duration: 0.2 }}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
      aria-label={`${isSelected ? "Close" : "Play"} ${course.title}`}
      aria-pressed={isSelected}
      className={cn(
        "group cursor-pointer rounded-2xl border overflow-hidden transition-all duration-200",
        isSelected
          ? "border-emerald-500/60 ring-1 ring-emerald-500/30 bg-[#031a0e]"
          : "border-white/6 bg-[#0a0f1e] hover:border-white/15 hover:bg-[#0d1425]"
      )}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-[#060c1a] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            if (!img.src.includes("mqdefault")) {
              img.src = `https://i.ytimg.com/vi/${course.id}/mqdefault.jpg`;
            }
          }}
        />

        {/* Level ribbon */}
        <div className={cn(
          "absolute top-2 right-2 w-2.5 h-2.5 rounded-full shadow-lg",
          lvl.badge
        )} />

        {/* Play overlay */}
        <div className={cn(
          "absolute inset-0 flex items-center justify-center transition-opacity duration-200",
          isSelected ? "opacity-100 bg-emerald-500/20" : "opacity-0 group-hover:opacity-100 bg-black/40"
        )}>
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center shadow-xl",
            isSelected ? "bg-emerald-500" : "bg-white/90"
          )}>
            <Play className={cn("w-5 h-5 ml-0.5", isSelected ? "text-white" : "text-gray-900")} fill="currentColor" />
          </div>
        </div>

        {/* Playing indicator */}
        {isSelected && (
          <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            LEARNING
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-xs font-semibold text-white leading-snug line-clamp-2 mb-1.5">
          {course.title}
        </h3>
        <p className="text-[10px] text-slate-500 mb-2">{course.channel}</p>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={cn(
            "inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full border",
            cat.color
          )}>
            <CatIcon className="w-2.5 h-2.5" />
            {course.category}
          </span>
          <span className={cn(
            "text-[9px] font-bold px-1.5 py-0.5 rounded-full border",
            lvl.color
          )}>
            {course.level}
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
        Mentorship uses the free YouTube Data API to fetch real cybersecurity courses.
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
            <span className="flex-shrink-0 w-5 h-5 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-[10px] font-black text-emerald-400 flex items-center justify-center">
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
        className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
      >
        <GraduationCap className="w-4 h-4" />
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

export default function MentorshipPage() {
  const [courses, setCourses] = useState<CyberCourse[]>([]);
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<CourseCategory | "All">("All");
  const [activeLevel, setActiveLevel] = useState<Level | "All">("All");
  const [selectedCourse, setSelectedCourse] = useState<CyberCourse | null>(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setSelectedCourse(null);
    setNeedsSetup(false);
    try {
      const res = await fetch("/api/brain/mentorship");
      const data = await res.json();
      if (data.setup) {
        setNeedsSetup(true);
        return;
      }
      if (!res.ok) throw new Error(data.error || "Failed to fetch courses");
      setCourses(data.courses ?? []);
      setTopic(data.topic ?? "");
      toast.success(`Loaded ${data.courses?.length ?? 0} courses`, {
        style: { background: "#0a0a0a", color: "#34d399", border: "1px solid rgba(52,211,153,0.2)" },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to fetch courses";
      toast.error(msg, { style: { background: "#0a0a0a", color: "#f87171" } });
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-load courses on first mount so the tab fills without an extra click.
  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const matchCat = activeCategory === "All" || c.category === activeCategory;
      const matchLvl = activeLevel === "All" || c.level === activeLevel;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.channel.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q);
      return matchCat && matchLvl && matchSearch;
    });
  }, [courses, search, activeCategory, activeLevel]);

  const handleSelect = (course: CyberCourse) => {
    setSelectedCourse((prev) => (prev?.id === course.id ? null : course));
  };

  const levelCounts = useMemo(
    () => ({
      Beginner:     courses.filter((c) => c.level === "Beginner").length,
      Intermediate: courses.filter((c) => c.level === "Intermediate").length,
      Advanced:     courses.filter((c) => c.level === "Advanced").length,
    }),
    [courses],
  );

  const categoryCounts = useMemo(
    () => Object.fromEntries(
      (Object.keys(CATEGORY_CONFIG) as CourseCategory[]).map((cat) => [
        cat,
        courses.filter((c) => c.category === cat).length,
      ]),
    ) as Record<CourseCategory, number>,
    [courses],
  );

  return (
    <div className="flex-1 overflow-auto bg-[#080f1e]">

      {/* ── Header ── */}
      <div className="sticky top-0 z-20 bg-[#080f1e]/95 backdrop-blur-xl border-b border-white/5">
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white">Mentorship</h1>
              <p className="text-xs text-slate-500">
                {topic ? `Topic: ${topic}` : "Real cybersecurity courses — beginner to expert, curated by AI"}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {courses.length > 0 && (
                <span className="text-xs text-slate-500 bg-white/5 border border-white/8 rounded-full px-3 py-1">
                  {filtered.length} / {courses.length} courses
                </span>
              )}
              <button
                onClick={fetchCourses}
                disabled={loading}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all",
                  loading
                    ? "bg-white/5 border-white/10 text-slate-500 cursor-not-allowed"
                    : "bg-emerald-500/15 border-emerald-500/35 text-emerald-300 hover:bg-emerald-500/25 hover:border-emerald-500/50"
                )}
              >
                {loading ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" />Loading…</>
                ) : (
                  <><RotateCcw className="w-3.5 h-3.5" />Fetch Courses</>
                )}
              </button>
            </div>
          </div>

          {/* Filters — only when courses loaded */}
          {courses.length > 0 && (
            <>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search courses by title, channel, or topic…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white/5 border border-white/8 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                />
                {search && (
                  <button onClick={() => setSearch("")} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X className="w-4 h-4 text-slate-500 hover:text-white transition-colors" />
                  </button>
                )}
              </div>

              {/* Level tabs */}
              <div className="flex gap-1.5 mb-2 flex-wrap">
                {ALL_LEVELS.map((lvl) => {
                  const count = lvl === "All" ? courses.length : levelCounts[lvl as Level];
                  const dotColor = lvl === "Beginner" ? "bg-green-500" : lvl === "Intermediate" ? "bg-yellow-500" : lvl === "Advanced" ? "bg-red-500" : "bg-slate-500";
                  return (
                    <button
                      key={lvl}
                      onClick={() => setActiveLevel(lvl as Level | "All")}
                      className={cn(
                        "flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                        activeLevel === lvl
                          ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                          : "bg-transparent border-white/8 text-slate-500 hover:border-white/15 hover:text-slate-300"
                      )}
                    >
                      {lvl !== "All" && <span className={cn("w-2 h-2 rounded-full", dotColor)} />}
                      {lvl} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Category tabs */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                {ALL_CATEGORIES.map((cat) => {
                  const config = cat === "All" ? null : CATEGORY_CONFIG[cat as CourseCategory];
                  const Icon = config?.icon;
                  const count = cat === "All"
                    ? courses.length
                    : categoryCounts[cat as CourseCategory];
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat as CourseCategory | "All")}
                      className={cn(
                        "flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                        activeCategory === cat
                          ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
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

        {/* Setup screen */}
        {needsSetup && !loading && <SetupScreen />}

        {/* Embedded Player */}
        <AnimatePresence>
          {selectedCourse && (
            <motion.div
              key={selectedCourse.id}
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="bg-[#0a0a0a] border border-emerald-500/25 rounded-2xl overflow-hidden shadow-2xl shadow-emerald-500/10">
                {/* Player header */}
                <div className="flex items-start gap-3 p-4 border-b border-white/5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse flex-shrink-0" />
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Now Learning</span>
                    </div>
                    <h2 className="text-sm font-bold text-white leading-snug">{selectedCourse.title}</h2>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-xs text-slate-500">{selectedCourse.channel}</span>
                      <span className={cn(
                        "text-[9px] font-bold px-1.5 py-0.5 rounded-full border",
                        LEVEL_CONFIG[selectedCourse.level].color
                      )}>
                        {selectedCourse.level}
                      </span>
                      {CATEGORY_CONFIG[selectedCourse.category] && (() => {
                        const activeCat = CATEGORY_CONFIG[selectedCourse.category];
                        const ActiveCatIcon = activeCat.icon;
                        return (
                          <span className={cn(
                            "inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full border",
                            activeCat.color
                          )}>
                            <ActiveCatIcon className="w-2.5 h-2.5" />
                            {selectedCourse.category}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCourse(null)}
                    aria-label="Close player"
                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 border border-white/8 transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>

                {/* Iframe player */}
                <div className="relative aspect-video w-full bg-black">
                  <iframe
                    key={selectedCourse.id}
                    src={`https://www.youtube-nocookie.com/embed/${selectedCourse.id}?autoplay=1&rel=0&modestbranding=1&color=white`}
                    title={selectedCourse.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>

                {/* Description */}
                <div className="p-4">
                  <p className="text-xs text-slate-400 leading-relaxed">{selectedCourse.description}</p>
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <a
                      href={`https://www.youtube.com/watch?v=${selectedCourse.id}`}
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

        {/* Empty state */}
        {!loading && !needsSetup && courses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            {/* Level pills preview */}
            <div className="flex gap-2 mb-6">
              {(["Beginner", "Intermediate", "Advanced"] as Level[]).map((lvl) => (
                <span key={lvl} className={cn(
                  "text-xs font-bold px-3 py-1 rounded-full border",
                  LEVEL_CONFIG[lvl].color
                )}>
                  {lvl}
                </span>
              ))}
            </div>
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mb-4">
              <GraduationCap className="w-8 h-8 text-emerald-400/60" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">No courses loaded yet</h2>
            <p className="text-sm text-slate-500 mb-2 max-w-sm">
              Click &ldquo;Fetch Courses&rdquo; to load real-world cybersecurity courses — handpicked from top YouTube educators.
            </p>
            <p className="text-xs text-slate-600 mb-6 max-w-sm">
              Covers beginner fundamentals all the way to advanced penetration testing, bug bounty, CTF, and certifications.
            </p>
            <button
              onClick={fetchCourses}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl transition-colors"
            >
              <GraduationCap className="w-4 h-4" />
              Fetch Courses
            </button>

            {/* Feature preview cards */}
            <div className="mt-12 grid grid-cols-3 gap-4 max-w-xl w-full">
              {[
                { icon: Users, label: "Beginner Path", desc: "Zero to security fundamentals", color: "text-green-400 bg-green-500/10 border-green-500/20" },
                { icon: Zap, label: "Intermediate", desc: "Pentest, bug bounty & CTFs", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
                { icon: Eye, label: "Advanced", desc: "Red team ops & research", color: "text-red-400 bg-red-500/10 border-red-500/20" },
              ].map(({ icon: Icon, label, desc, color }) => (
                <div key={label} className={cn("rounded-xl border p-4 text-center", color)}>
                  <Icon className="w-5 h-5 mx-auto mb-2" />
                  <div className="text-xs font-bold text-white mb-1">{label}</div>
                  <div className="text-[10px] text-slate-500">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-white/6 bg-[#0a0f1e] overflow-hidden animate-pulse">
                <div className="aspect-video bg-white/5" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-white/8 rounded w-4/5" />
                  <div className="h-3 bg-white/5 rounded w-3/5" />
                  <div className="flex gap-2">
                    <div className="h-4 w-20 bg-white/5 rounded-full" />
                    <div className="h-4 w-16 bg-white/5 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats row */}
        {!loading && courses.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Total Courses",  value: courses.length,              color: "text-white" },
              { label: "Beginner",       value: levelCounts.Beginner,        color: "text-green-400" },
              { label: "Intermediate",   value: levelCounts.Intermediate,    color: "text-yellow-400" },
              { label: "Advanced",       value: levelCounts.Advanced,        color: "text-red-400" },
            ].map((s) => (
              <div key={s.label} className="bg-white/3 border border-white/6 rounded-xl p-3 text-center">
                <div className={cn("text-2xl font-black", s.color)}>{s.value}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Category stats row */}
        {!loading && courses.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-6">
            {(Object.keys(CATEGORY_CONFIG) as CourseCategory[]).map((cat) => {
              const count = categoryCounts[cat];
              if (count === 0) return null;
              const { icon: Icon, color } = CATEGORY_CONFIG[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(activeCategory === cat ? "All" : cat)}
                  className={cn(
                    "inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all",
                    activeCategory === cat
                      ? color + " ring-1 ring-white/20"
                      : color.replace(/bg-\S+/, "bg-transparent")
                  )}
                >
                  <Icon className="w-3 h-3" />
                  {cat} · {count}
                </button>
              );
            })}
          </div>
        )}

        {/* No results */}
        {!loading && filtered.length === 0 && courses.length > 0 && (
          <div className="text-center py-16 text-slate-500">
            <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No courses match your filters.</p>
            <button
              onClick={() => { setSearch(""); setActiveCategory("All"); setActiveLevel("All"); }}
              className="mt-3 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Course Grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((course, i) => (
              <CourseCard
                key={course.id}
                course={course}
                isSelected={selectedCourse?.id === course.id}
                onClick={() => handleSelect(course)}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
