import { useEffect, useRef, useState, useCallback } from "react";
import {
  Play, Pause, Volume2, VolumeX, Volume1,
  Maximize, Minimize, SkipBack, SkipForward,
  Settings, Subtitles, ChevronRight, Check,
} from "lucide-react";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  subtitleUrl?: string;
  subtitleLabel?: string;
  onEnded?: () => void;
}

type SettingsMenu = "main" | "speed" | "subtitle" | null;

const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
const SPEED_LABELS: Record<number, string> = {
  0.25: "0.25×", 0.5: "0.5×", 0.75: "0.75×", 1: "Bình thường",
  1.25: "1.25×", 1.5: "1.5×", 1.75: "1.75×", 2: "2×",
};

function formatTime(s: number) {
  if (isNaN(s) || s < 0) return "0:00";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export default function VideoPlayer({
  src, poster, subtitleUrl, subtitleLabel = "Tiếng Việt", onEnded,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const hideControlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speedToastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [settingsMenu, setSettingsMenu] = useState<SettingsMenu>(null);
  const [subtitleOn, setSubtitleOn] = useState(false);
  const [showSpeedToast, setShowSpeedToast] = useState(false);
  const [showPlayFlash, setShowPlayFlash] = useState(false);
  const playFlashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Video events ──
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTimeUpdate = () => {
      setCurrentTime(v.currentTime);
      if (v.buffered.length > 0) setBuffered(v.buffered.end(v.buffered.length - 1));
    };
    const onLoaded = () => setDuration(v.duration);
    const handleEnded = () => { setPlaying(false); onEnded?.(); };
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("timeupdate", onTimeUpdate);
    v.addEventListener("loadedmetadata", onLoaded);
    v.addEventListener("ended", handleEnded);
    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("timeupdate", onTimeUpdate);
      v.removeEventListener("loadedmetadata", onLoaded);
      v.removeEventListener("ended", handleEnded);
    };
  }, [onEnded]);

  // ── Fullscreen listener ──
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // ── Auto-hide controls ──
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused && !settingsMenu) {
        setShowControls(false);
      }
    }, 3000);
  }, [settingsMenu]);

  useEffect(() => {
    if (!playing) { setShowControls(true); }
    else resetHideTimer();
  }, [playing, resetHideTimer]);

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const v = videoRef.current;
      if (!v) return;
      if (e.key === " " || e.key === "k") { e.preventDefault(); if (v.paused) { void v.play(); } else { v.pause(); } }
      if (e.key === "ArrowRight") { e.preventDefault(); v.currentTime = Math.min(v.duration, v.currentTime + 5); }
      if (e.key === "ArrowLeft") { e.preventDefault(); v.currentTime = Math.max(0, v.currentTime - 5); }
      if (e.key === "m") { v.muted = !v.muted; setMuted(v.muted); }
      if (e.key === "f") { toggleFullscreen(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // ── Close settings on outside click ──
  useEffect(() => {
    if (!settingsMenu) return;
    const handler = (e: MouseEvent) => {
      const panel = containerRef.current?.querySelector("[data-settings-panel]");
      const btn = containerRef.current?.querySelector("[data-settings-btn]");
      if (panel && !panel.contains(e.target as Node) && btn && !btn.contains(e.target as Node)) {
        setSettingsMenu(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [settingsMenu]);

  // ── Actions ──
  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { void v.play(); } else { v.pause(); }
    // Flash icon
    if (playFlashTimer.current) clearTimeout(playFlashTimer.current);
    setShowPlayFlash(true);
    playFlashTimer.current = setTimeout(() => setShowPlayFlash(false), 500);
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const handleVolumeChange = (val: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = val;
    v.muted = val === 0;
    setVolume(val);
    setMuted(val === 0);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = progressRef.current?.getBoundingClientRect();
    if (!rect || !videoRef.current || !duration) return;
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    videoRef.current.currentTime = ratio * duration;
  };

  const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = progressRef.current?.getBoundingClientRect();
    if (!rect || !duration) return;
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverTime(ratio * duration);
    setHoverX(e.clientX - rect.left);
  };

  const changeSpeed = (s: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = s;
    setSpeed(s);
    setSettingsMenu(null);
    if (speedToastTimer.current) clearTimeout(speedToastTimer.current);
    setShowSpeedToast(true);
    speedToastTimer.current = setTimeout(() => setShowSpeedToast(false), 1500);
  };

  const setSubtitle = (on: boolean) => {
    const v = videoRef.current;
    if (!v) return;
    for (let i = 0; i < v.textTracks.length; i++) {
      v.textTracks[i].mode = on ? "showing" : "disabled";
    }
    setSubtitleOn(on);
    setSettingsMenu(null);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) containerRef.current?.requestFullscreen();
    else document.exitFullscreen();
  };

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPct = duration > 0 ? (buffered / duration) * 100 : 0;
  const hoverPct = hoverTime !== null && duration > 0 ? (hoverTime / duration) * 100 : 0;

  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black select-none overflow-hidden"
      style={{ aspectRatio: "16/9" }}
      onMouseMove={resetHideTimer}
      onMouseLeave={() => { if (playing && !settingsMenu) setShowControls(false); else if (!playing) setShowControls(false); }}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain cursor-pointer"
        crossOrigin="anonymous"
        onClick={togglePlay}
      >
        {subtitleUrl && (
          <track kind="subtitles" src={subtitleUrl} srcLang="vi" label={subtitleLabel} />
        )}
      </video>

      {/* ── Idle overlay: chỉ hiện khi chưa play, không block click khi đang play ── */}
      {!playing && (
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer z-10 pointer-events-none"
        >
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative w-20 h-20 rounded-full bg-black/50 border-2 border-white/80 flex items-center justify-center backdrop-blur-sm shadow-2xl">
            <Play className="w-8 h-8 text-white fill-white ml-1" />
          </div>
        </div>
      )}

      {/* ── Play/Pause flash khi click giữa màn hình ── */}
      {showPlayFlash && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center animate-ping-once">
            {playing
              ? <Pause className="w-7 h-7 text-white fill-white" />
              : <Play className="w-7 h-7 text-white fill-white ml-1" />}
          </div>
        </div>
      )}

      {/* Speed toast */}
      {showSpeedToast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/80 text-white text-sm font-semibold px-4 py-1.5 rounded-full pointer-events-none z-50 flex items-center gap-2 backdrop-blur-sm">
          <Settings className="w-3.5 h-3.5" />
          {SPEED_LABELS[speed]}
        </div>
      )}

      {/* Controls overlay — ẩn khi idle, hiện khi hover hoặc đang play */}
      <div
        className={`absolute inset-0 flex flex-col justify-end transition-opacity duration-200 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={togglePlay}
      >
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 px-3 pb-2.5 space-y-0.5" onClick={(e) => e.stopPropagation()}>

          {/* ── PROGRESS BAR ── */}
          <div
            ref={progressRef}
            className="relative flex items-center h-5 cursor-pointer group/bar"
            onClick={handleProgressClick}
            onMouseMove={handleProgressHover}
            onMouseLeave={() => setHoverTime(null)}
          >
            <div className="absolute w-full h-1 group-hover/bar:h-1.5 bg-white/25 rounded-full transition-all duration-150 overflow-visible">
              {/* Buffered */}
              <div className="absolute left-0 top-0 h-full bg-white/30 rounded-full" style={{ width: `${bufferedPct}%` }} />
              {/* Played */}
              <div className="absolute left-0 top-0 h-full bg-violet-500 rounded-full transition-none" style={{ width: `${progressPct}%` }}>
                {/* Thumb dot */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-md scale-0 group-hover/bar:scale-100 transition-transform" />
              </div>
              {/* Hover ghost */}
              {hoverTime !== null && (
                <div className="absolute left-0 top-0 h-full bg-white/15 rounded-full pointer-events-none" style={{ width: `${hoverPct}%` }} />
              )}
            </div>
            {/* Time tooltip */}
            {hoverTime !== null && (
              <div
                className="absolute bottom-6 bg-black/90 text-white text-xs font-semibold px-2 py-1 rounded-md pointer-events-none -translate-x-1/2 shadow-lg"
                style={{ left: Math.max(20, Math.min(hoverX, (progressRef.current?.clientWidth ?? 0) - 20)) }}
              >
                {formatTime(hoverTime)}
              </div>
            )}
          </div>

          {/* ── BOTTOM BUTTONS ── */}
          <div className="flex items-center gap-0.5">

            {/* Play/Pause */}
            <button onClick={togglePlay} className="p-1.5 text-white hover:text-violet-300 transition-colors rounded-lg hover:bg-white/10">
              {playing
                ? <Pause className="w-5 h-5 fill-current" />
                : <Play className="w-5 h-5 fill-current ml-px" />}
            </button>

            {/* Skip back */}
            <button
              onClick={() => { if (videoRef.current) videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10); }}
              className="p-1.5 text-white hover:text-violet-300 transition-colors rounded-lg hover:bg-white/10"
              title="Lùi 10s (←)"
            >
              <SkipBack className="w-4.5 h-4.5" />
            </button>

            {/* Skip forward */}
            <button
              onClick={() => { if (videoRef.current) videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 10); }}
              className="p-1.5 text-white hover:text-violet-300 transition-colors rounded-lg hover:bg-white/10"
              title="Tới 10s (→)"
            >
              <SkipForward className="w-4.5 h-4.5" />
            </button>

            {/* Volume */}
            <div
              className="flex items-center gap-1"
              onMouseEnter={() => setShowVolume(true)}
              onMouseLeave={() => setShowVolume(false)}
            >
              <button onClick={toggleMute} className="p-1.5 text-white hover:text-violet-300 transition-colors rounded-lg hover:bg-white/10">
                <VolumeIcon className="w-5 h-5" />
              </button>
              <div className={`flex items-center overflow-hidden transition-all duration-200 ${showVolume ? "w-20 opacity-100" : "w-0 opacity-0"}`}>
                <input
                  type="range" min={0} max={1} step={0.02}
                  value={muted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="w-full cursor-pointer appearance-none rounded-full"
                  style={{
                    height: 4,
                    background: `linear-gradient(to right, #a78bfa ${(muted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) ${(muted ? 0 : volume) * 100}%)`,
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>

            {/* Time */}
            <span className="text-white/90 text-xs font-medium tabular-nums ml-1 mr-auto">
              {formatTime(currentTime)}<span className="text-white/40 mx-1">/</span>{formatTime(duration)}
            </span>

            {/* Subtitle + Settings group */}
            <div className="relative flex items-center">
            {/* Subtitle button — luôn hiện, disabled nếu không có file */}
            <button
              onClick={() => subtitleUrl && setSettingsMenu(settingsMenu === "subtitle" ? null : "subtitle")}
              className={`p-1.5 transition-colors rounded-lg ${
                !subtitleUrl
                  ? "text-white/20 cursor-not-allowed"
                  : subtitleOn
                  ? "text-violet-400 hover:bg-white/10"
                  : "text-white hover:text-violet-300 hover:bg-white/10"
              }`}
              title={subtitleUrl ? "Phụ đề" : "Không có phụ đề"}
            >
              <Subtitles className="w-5 h-5" />
            </button>

            {/* Settings */}
            <div className="relative">
              <button
                data-settings-btn
                onClick={() => setSettingsMenu(settingsMenu === "main" ? null : "main")}
                className={`p-1.5 transition-colors rounded-lg hover:bg-white/10 ${settingsMenu === "main" || settingsMenu === "speed" ? "text-violet-400" : "text-white hover:text-violet-300"}`}
                title="Cài đặt"
              >
                <Settings className={`w-5 h-5 transition-transform duration-300 ${settingsMenu ? "rotate-45" : ""}`} />
              </button>
            </div>

              {/* ── Settings Panel ── */}
              {settingsMenu && (
                <div
                  data-settings-panel
                  className="absolute bottom-11 right-0 bg-[#111116]/96 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl z-50 overflow-hidden"
                  style={{ minWidth: 240 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Main menu */}
                  {settingsMenu === "main" && (
                    <div className="py-2 px-2">
                      <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-2 pt-1 pb-2">
                        Cài đặt
                      </p>
                      {/* Speed row */}
                      <button
                        onClick={() => setSettingsMenu("speed")}
                        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/10 rounded-lg transition-all group"
                      >
                        <span className="flex items-center gap-3 text-sm text-white/90 font-medium whitespace-nowrap">
                          <Settings className="w-4 h-4 text-white/40 flex-shrink-0" />
                          Tốc độ phát
                        </span>
                        <span className="flex items-center gap-1.5 text-white/45 text-xs whitespace-nowrap ml-8">
                          {SPEED_LABELS[speed]}
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </button>
                      {/* Subtitle row */}
                      <button
                        onClick={() => setSettingsMenu("subtitle")}
                        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/10 rounded-lg transition-all"
                      >
                        <span className="flex items-center gap-3 text-sm text-white/90 font-medium whitespace-nowrap">
                          <Subtitles className="w-4 h-4 text-white/40 flex-shrink-0" />
                          Phụ đề
                        </span>
                        <span className="flex items-center gap-1.5 text-white/45 text-xs whitespace-nowrap ml-8">
                          {subtitleUrl ? (subtitleOn ? subtitleLabel : "Tắt") : "Không có"}
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </button>
                    </div>
                  )}

                  {/* Speed submenu */}
                  {settingsMenu === "speed" && (
                    <div className="py-2">
                      <button
                        onClick={() => setSettingsMenu("main")}
                        className="flex items-center gap-2 px-4 py-2.5 text-white/50 hover:text-white/90 text-xs font-bold uppercase tracking-widest transition-colors w-full whitespace-nowrap"
                      >
                        <ChevronRight className="w-3.5 h-3.5 rotate-180 flex-shrink-0" />
                        Tốc độ phát
                      </button>
                      <div className="h-px bg-white/8 mx-3 mb-1.5" />
                      <div className="px-2 space-y-0.5">
                        {SPEEDS.map((s) => (
                          <button
                            key={s}
                            onClick={() => changeSpeed(s)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                              s === speed
                                ? "text-violet-400 bg-violet-500/15"
                                : "text-white/75 hover:text-white hover:bg-white/10"
                            }`}
                          >
                            {SPEED_LABELS[s]}
                            {s === speed && <Check className="w-4 h-4 text-violet-400 flex-shrink-0" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Subtitle submenu */}
                  {settingsMenu === "subtitle" && (
                    <div className="py-2">
                      <button
                        onClick={() => setSettingsMenu("main")}
                        className="flex items-center gap-2 px-4 py-2.5 text-white/50 hover:text-white/90 text-xs font-bold uppercase tracking-widest transition-colors w-full whitespace-nowrap"
                      >
                        <ChevronRight className="w-3.5 h-3.5 rotate-180 flex-shrink-0" />
                        Phụ đề
                      </button>
                      <div className="h-px bg-white/8 mx-3 mb-1.5" />
                      {!subtitleUrl && (
                        <p className="px-4 py-3 text-sm text-white/30 italic">Bài học này không có phụ đề</p>
                      )}
                      {subtitleUrl && (
                        <div className="px-2 space-y-0.5">
                          <button
                            onClick={() => setSubtitle(false)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                              !subtitleOn ? "text-violet-400 bg-violet-500/15" : "text-white/75 hover:text-white hover:bg-white/10"
                            }`}
                          >
                            Tắt
                            {!subtitleOn && <Check className="w-4 h-4 text-violet-400 flex-shrink-0" />}
                          </button>
                          <button
                            onClick={() => setSubtitle(true)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                              subtitleOn ? "text-violet-400 bg-violet-500/15" : "text-white/75 hover:text-white hover:bg-white/10"
                            }`}
                          >
                            {subtitleLabel}
                            {subtitleOn && <Check className="w-4 h-4 text-violet-400 flex-shrink-0" />}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>{/* end settings+subtitle group */}

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 text-white hover:text-violet-300 transition-colors rounded-lg hover:bg-white/10"
              title="Toàn màn hình (F)"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Subtitle CSS */}
      <style>{`
        @keyframes ping-once {
          0%   { transform: scale(1);   opacity: 1; }
          50%  { transform: scale(1.3); opacity: 0.7; }
          100% { transform: scale(1);   opacity: 0; }
        }
        .animate-ping-once { animation: ping-once 0.4s ease-out forwards; }
        video::cue {
          background: rgba(0, 0, 0, 0.78);
          color: #ffffff;
          font-size: 15px;
          font-weight: 500;
          border-radius: 3px;
          line-height: 1.6;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #fff;
          cursor: pointer;
        }
        input[type=range]::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #fff;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}