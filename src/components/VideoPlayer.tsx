"use client";

import { useRef, useState, useEffect, useCallback } from "react";

interface Comment {
  id: string;
  timecode_seconds: number;
  resolved: boolean;
}

interface VideoPlayerProps {
  src: string;
  duration: number;
  comments: Comment[];
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  onCommentClick: (id: string, time: number) => void;
}

export default function VideoPlayer({
  src,
  duration,
  comments,
  currentTime,
  onTimeUpdate,
  onCommentClick,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Sync external currentTime with video (when user clicks a comment)
  useEffect(() => {
    const video = videoRef.current;
    if (video && Math.abs(video.currentTime - currentTime) > 1) {
      video.currentTime = currentTime;
    }
  }, [currentTime]);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      onTimeUpdate(video.currentTime);
    }
  }, [onTimeUpdate]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const val = parseFloat(e.target.value);
    video.volume = val;
    setVolume(val);
    if (val === 0) {
      video.muted = true;
      setIsMuted(true);
    } else if (isMuted) {
      video.muted = false;
      setIsMuted(false);
    }
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    const time = pct * (duration || 1);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
    onTimeUpdate(time);
  };

  const actualDuration = duration || 1;

  return (
    <div className="flex-1 flex flex-col bg-slate-950">
      {/* Video Area */}
      <div className="flex-1 flex items-center justify-center relative cursor-pointer" onClick={togglePlay}>
        {src ? (
          <video
            ref={videoRef}
            src={src}
            className="max-w-full max-h-full"
            onTimeUpdate={handleTimeUpdate}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
          />
        ) : (
          <div className="text-center">
            <div className="w-96 h-56 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700">
              <div className="text-center">
                <svg className="w-16 h-16 text-slate-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
                </svg>
                <div className="text-slate-500 text-sm">No video file uploaded</div>
              </div>
            </div>
          </div>
        )}
        {/* Play/Pause overlay */}
        {src && !isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
              <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="px-6 pb-4">
        {/* Timeline */}
        <div
          className="review-timeline cursor-pointer"
          onClick={handleTimelineClick}
        >
          {/* Playhead */}
          <div
            className="absolute top-0 w-0.5 h-full bg-white z-10"
            style={{ left: `${(currentTime / actualDuration) * 100}%` }}
          />
          {/* Progress fill */}
          <div
            className="absolute top-0 left-0 h-full bg-brand-600/30"
            style={{ width: `${(currentTime / actualDuration) * 100}%` }}
          />
          {/* Comment markers */}
          {comments.map((comment) => {
            const pct = (comment.timecode_seconds / actualDuration) * 100;
            return (
              <div
                key={comment.id}
                className={`review-marker ${comment.resolved ? "bg-slate-500/40" : "bg-amber-400"}`}
                style={{ left: `${pct}%` }}
                onClick={(e) => {
                  e.stopPropagation();
                  onCommentClick(comment.id, comment.timecode_seconds);
                }}
              />
            );
          })}
        </div>
        {/* Time + volume */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-3">
            <button onClick={togglePlay} className="text-slate-400 hover:text-white">
              {isPlaying ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            <span className="text-xs text-slate-500 font-mono">
              {formatTime(currentTime)} / {formatTime(actualDuration)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleMute} className="text-slate-400 hover:text-white">
              {isMuted || volume === 0 ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-3.15a.75.75 0 011.28.53v13.74a.75.75 0 01-1.28.53L6.75 14.25H3.75a.75.75 0 01-.75-.75v-3a.75.75 0 01.75-.75h3z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-3.15a.75.75 0 011.28.53v12.74a.75.75 0 01-1.28.53l-4.72-3.15H3.75a.75.75 0 01-.75-.75v-3a.75.75 0 01.75-.75h3z" />
                </svg>
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 h-1 accent-brand-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
