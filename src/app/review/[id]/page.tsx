"use client";

import Link from "next/link";
import { assets, reviewComments, projects } from "@/data/mock";
import { useState } from "react";

const authorColors: Record<string, { bg: string; text: string; ring: string }> = {
  producer: { bg: "bg-brand-100", text: "text-brand-700", ring: "border-brand-300" },
  client: { bg: "bg-emerald-100", text: "text-emerald-700", ring: "border-emerald-300" },
  editor: { bg: "bg-violet-100", text: "text-violet-700", ring: "border-violet-300" },
};

export default function ReviewPage({ params }: { params: { id: string } }) {
  const asset = assets.find((a) => a.id === params.id);
  const comments = reviewComments.filter((c) => c.assetId === params.id);
  const project = asset ? projects.find((p) => p.id === asset.projectId) : null;

  const [selectedComment, setSelectedComment] = useState<string | null>(null);
  const [playheadSec, setPlayheadSec] = useState(0);
  const [newComment, setNewComment] = useState("");

  if (!asset) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl font-bold text-slate-900">Asset not found</h1>
        <Link href="/assets" className="text-brand-600 mt-2 inline-block">Back to Assets</Link>
      </div>
    );
  }

  const totalDuration = 180; // 3 min mock
  const unresolvedCount = comments.filter((c) => !c.resolved).length;

  return (
    <div className="h-screen flex flex-col">
      {/* Review Header */}
      <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link href={project ? `/projects/${project.id}` : "/assets"} className="text-slate-400 hover:text-slate-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <div>
            <span className="font-semibold text-sm text-slate-900">{asset.name}</span>
            <span className="text-xs text-slate-500 ml-2">v{asset.version}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">{unresolvedCount} unresolved comments</span>
          <div className="flex gap-1.5">
            {[1, 2].map((v) => (
              <button
                key={v}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  v === asset.version
                    ? "bg-brand-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                v{v}
              </button>
            ))}
          </div>
          <button className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
            Approve
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Video Player Area */}
        <div className="flex-1 flex flex-col bg-slate-950">
          {/* Mock Player */}
          <div className="flex-1 flex items-center justify-center relative">
            <div className="text-center">
              <div className="w-96 h-56 bg-slate-800 rounded-xl mb-4 flex items-center justify-center border border-slate-700">
                <div className="text-center">
                  <svg className="w-16 h-16 text-slate-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
                  </svg>
                  <div className="text-slate-500 text-sm">Video Preview</div>
                  <div className="text-slate-600 text-xs mt-1">{asset.name}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline with markers */}
          <div className="px-6 pb-4">
            <div
              className="review-timeline"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = (e.clientX - rect.left) / rect.width;
                setPlayheadSec(Math.round(pct * totalDuration));
              }}
            >
              {/* Playhead */}
              <div
                className="absolute top-0 w-0.5 h-full bg-white z-10"
                style={{ left: `${(playheadSec / totalDuration) * 100}%` }}
              />
              {/* Progress fill */}
              <div
                className="absolute top-0 left-0 h-full bg-brand-600/30"
                style={{ width: `${(playheadSec / totalDuration) * 100}%` }}
              />
              {/* Comment markers */}
              {comments.map((comment) => {
                const pct = (comment.timecodeSec / totalDuration) * 100;
                const colors = authorColors[comment.authorRole];
                return (
                  <div
                    key={comment.id}
                    className={`review-marker ${comment.resolved ? "bg-slate-500/40" : "bg-amber-400"}`}
                    style={{ left: `${pct}%` }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedComment(comment.id);
                      setPlayheadSec(comment.timecodeSec);
                    }}
                    title={`${comment.timecode} — ${comment.author}`}
                  />
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
              <span>{formatTimecode(playheadSec)}</span>
              <span>{formatTimecode(totalDuration)}</span>
            </div>
          </div>
        </div>

        {/* Comments Panel */}
        <div className="w-96 bg-white border-l border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-semibold text-sm text-slate-900">Comments</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {comments.length} comments &middot; {unresolvedCount} unresolved
            </p>
          </div>

          {/* Comment List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {comments.map((comment) => {
              const colors = authorColors[comment.authorRole];
              const isSelected = selectedComment === comment.id;
              return (
                <div
                  key={comment.id}
                  onClick={() => {
                    setSelectedComment(comment.id);
                    setPlayheadSec(comment.timecodeSec);
                  }}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? `${colors.ring} border-2 shadow-sm`
                      : "border-slate-100 hover:border-slate-200"
                  } ${comment.resolved ? "opacity-60" : ""}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full ${colors.bg} ${colors.text} flex items-center justify-center text-[10px] font-bold`}>
                        {comment.author.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <span className="text-xs font-medium text-slate-900">{comment.author}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${colors.bg} ${colors.text}`}>
                        {comment.authorRole}
                      </span>
                    </div>
                    <button
                      className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-emerald-500"
                      title={comment.resolved ? "Resolved" : "Mark resolved"}
                    >
                      {comment.resolved ? (
                        <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                      {comment.timecode}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{comment.text}</p>
                </div>
              );
            })}
          </div>

          {/* New Comment */}
          <div className="p-4 border-t border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                {formatTimecode(playheadSec)}
              </span>
              <span className="text-xs text-slate-500">Adding comment at current timecode</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Leave a timecoded comment..."
                className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
              />
              <button className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors">
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTimecode(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
