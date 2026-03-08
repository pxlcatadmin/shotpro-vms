"use client";

import { useState } from "react";
import type { ReviewComment } from "@/hooks/useRealtimeComments";

const roleColors: Record<string, { bg: string; text: string; ring: string }> = {
  producer: { bg: "bg-brand-100", text: "text-brand-700", ring: "border-brand-300" },
  client: { bg: "bg-emerald-100", text: "text-emerald-700", ring: "border-emerald-300" },
  editor: { bg: "bg-violet-100", text: "text-violet-700", ring: "border-violet-300" },
  admin: { bg: "bg-amber-100", text: "text-amber-700", ring: "border-amber-300" },
};

interface CommentPanelProps {
  comments: ReviewComment[];
  loading: boolean;
  currentTime: number;
  selectedCommentId: string | null;
  onCommentClick: (id: string, time: number) => void;
  onAddComment: (timecodeSec: number, text: string) => void;
  onToggleResolved: (commentId: string, resolved: boolean) => void;
}

export default function CommentPanel({
  comments,
  loading,
  currentTime,
  selectedCommentId,
  onCommentClick,
  onAddComment,
  onToggleResolved,
}: CommentPanelProps) {
  const [newComment, setNewComment] = useState("");
  const unresolvedCount = comments.filter((c) => !c.resolved).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    onAddComment(currentTime, newComment.trim());
    setNewComment("");
  };

  return (
    <div className="w-96 bg-white border-l border-slate-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <h3 className="font-semibold text-sm text-slate-900">Comments</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          {comments.length} comments &middot; {unresolvedCount} unresolved
        </p>
      </div>

      {/* Comment List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            No comments yet. Add the first one!
          </div>
        ) : (
          comments.map((comment) => {
            const role = comment.author?.role || "producer";
            const colors = roleColors[role] || roleColors.producer;
            const isSelected = selectedCommentId === comment.id;
            const authorName = comment.author?.full_name || "Unknown";
            const initials = authorName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <div
                key={comment.id}
                onClick={() => onCommentClick(comment.id, comment.timecode_seconds)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? `${colors.ring} border-2 shadow-sm`
                    : "border-slate-100 hover:border-slate-200"
                } ${comment.resolved ? "opacity-60" : ""}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-full ${colors.bg} ${colors.text} flex items-center justify-center text-[10px] font-bold`}
                    >
                      {initials}
                    </div>
                    <span className="text-xs font-medium text-slate-900">{authorName}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${colors.bg} ${colors.text}`}>
                      {role}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleResolved(comment.id, !comment.resolved);
                    }}
                    className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-emerald-500"
                    title={comment.resolved ? "Unresolve" : "Mark resolved"}
                  >
                    {comment.resolved ? (
                      <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                          clipRule="evenodd"
                        />
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
                    {formatTime(comment.timecode_seconds)}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {timeAgo(comment.created_at)}
                  </span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{comment.text}</p>
              </div>
            );
          })
        )}
      </div>

      {/* New Comment Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
            {formatTime(currentTime)}
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
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Post
          </button>
        </div>
      </form>
    </div>
  );
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays}d ago`;
}
