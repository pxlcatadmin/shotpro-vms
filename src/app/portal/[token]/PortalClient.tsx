"use client";

import { useState, useCallback, useEffect } from "react";
import VideoPlayer from "@/components/VideoPlayer";
import { createClient } from "@/lib/supabase/client";

interface PortalComment {
  id: string;
  timecode_seconds: number;
  text: string;
  resolved: boolean;
  created_at: string;
  author?: {
    full_name: string;
    role: string;
  };
}

interface PortalClientProps {
  asset: {
    id: string;
    name: string;
    version: number;
    status: string;
    duration_seconds: number | null;
  };
  projectName: string;
  clientName: string;
  videoUrl: string | null;
  token: string;
}

export default function PortalClient({ asset, projectName, clientName, videoUrl, token }: PortalClientProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [comments, setComments] = useState<PortalComment[]>([]);
  const [loading, setLoading] = useState(true);

  const duration = asset.duration_seconds || 180;

  // Fetch comments (anonymous read)
  useEffect(() => {
    async function fetchComments() {
      const supabase = createClient();
      const { data } = await supabase
        .from("review_comments")
        .select(`
          id, timecode_seconds, text, resolved, created_at,
          author:profiles!author_id (full_name, role)
        `)
        .eq("asset_id", asset.id)
        .order("created_at", { ascending: true });

      if (data) setComments(data as PortalComment[]);
      setLoading(false);
    }
    fetchComments();
  }, [asset.id]);

  const handleCommentClick = useCallback((_id: string, time: number) => {
    setCurrentTime(time);
  }, []);

  const unresolvedCount = comments.filter((c) => !c.resolved).length;

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Branded header */}
      <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center font-bold text-[10px] text-white">
              SP
            </div>
            <span className="text-xs text-slate-400 uppercase tracking-widest">ShotPro Review</span>
          </div>
          <div className="h-5 w-px bg-slate-200" />
          <div>
            <span className="font-semibold text-sm text-slate-900">{asset.name}</span>
            <span className="text-xs text-slate-500 ml-2">v{asset.version}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">{projectName} — {clientName}</span>
          {asset.status === "approved" ? (
            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-xs font-medium">
              Approved
            </span>
          ) : (
            <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-lg text-xs font-medium">
              In Review
            </span>
          )}
        </div>
      </div>

      <div className="flex" style={{ height: "calc(100vh - 56px)" }}>
        {/* Video Player */}
        <VideoPlayer
          src={videoUrl || ""}
          duration={duration}
          comments={comments.map((c) => ({
            id: c.id,
            timecode_seconds: c.timecode_seconds,
            resolved: c.resolved,
          }))}
          currentTime={currentTime}
          onTimeUpdate={setCurrentTime}
          onCommentClick={handleCommentClick}
        />

        {/* Read-only Comments */}
        <div className="w-80 bg-white border-l border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-semibold text-sm text-slate-900">Comments</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {comments.length} comments &middot; {unresolvedCount} unresolved
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                No comments yet.
              </div>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  onClick={() => setCurrentTime(comment.timecode_seconds)}
                  className={`p-3 rounded-lg border border-slate-100 hover:border-slate-200 cursor-pointer transition-all ${
                    comment.resolved ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-medium text-slate-900">
                      {comment.author?.full_name || "Team"}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {comment.author?.role || ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                      {formatTime(comment.timecode_seconds)}
                    </span>
                    {comment.resolved && (
                      <span className="text-[10px] text-emerald-600 font-medium">Resolved</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{comment.text}</p>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-slate-200 bg-slate-50">
            <p className="text-xs text-slate-500 text-center">
              Read-only view. Contact the production team to leave feedback.
            </p>
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
