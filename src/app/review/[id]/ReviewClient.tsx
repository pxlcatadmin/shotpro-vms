"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import VideoPlayer from "@/components/VideoPlayer";
import CommentPanel from "@/components/CommentPanel";
import ShareLinkButton from "@/components/ShareLinkButton";
import { useRealtimeComments } from "@/hooks/useRealtimeComments";
import { createClient } from "@/lib/supabase/client";

interface Asset {
  id: string;
  name: string;
  version: number;
  status: string;
  storage_path: string | null;
  duration_seconds: number | null;
  project_id: string;
}

interface ReviewClientProps {
  asset: Asset;
  videoUrl: string | null;
  projectName: string | null;
}

export default function ReviewClient({ asset, videoUrl, projectName }: ReviewClientProps) {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);

  const { comments, loading, addComment, toggleResolved } = useRealtimeComments(asset.id);

  const unresolvedCount = comments.filter((c) => !c.resolved).length;
  const duration = asset.duration_seconds || 180;

  const handleCommentClick = useCallback((id: string, time: number) => {
    setSelectedCommentId(id);
    setCurrentTime(time);
  }, []);

  const handleApprove = async (decision: "approved" | "revision-requested") => {
    setApproving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Insert approval record
    await supabase.from("approvals").insert({
      asset_id: asset.id,
      approved_by: user.id,
      decision,
    });

    // Update asset status
    const newStatus = decision === "approved" ? "approved" : "in-review";
    await supabase.from("assets").update({ status: newStatus }).eq("id", asset.id);

    setApproving(false);
    router.refresh();
  };

  const statusColor = {
    draft: "bg-slate-100 text-slate-600",
    "in-review": "bg-amber-100 text-amber-700",
    approved: "bg-emerald-100 text-emerald-700",
    final: "bg-brand-100 text-brand-700",
  }[asset.status] || "bg-slate-100 text-slate-600";

  return (
    <div className="h-screen flex flex-col">
      {/* Review Header */}
      <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href={`/projects/${asset.project_id}`}
            className="text-slate-400 hover:text-slate-600"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <div className="flex items-center gap-3">
            <div>
              <span className="font-semibold text-sm text-slate-900">{asset.name}</span>
              <span className="text-xs text-slate-500 ml-2">v{asset.version}</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor}`}>
              {asset.status}
            </span>
          </div>
          {projectName && (
            <span className="text-xs text-slate-400">
              {projectName}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">{unresolvedCount} unresolved</span>
          <ShareLinkButton
            assetId={asset.id}
            projectId={asset.project_id}
            label="Share"
            className="border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          />
          {asset.status !== "approved" && (
            <div className="flex gap-2">
              <button
                onClick={() => handleApprove("revision-requested")}
                disabled={approving}
                className="border border-amber-300 text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors disabled:opacity-50"
              >
                Request Revision
              </button>
              <button
                onClick={() => handleApprove("approved")}
                disabled={approving}
                className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {approving ? "..." : "Approve"}
              </button>
            </div>
          )}
          {asset.status === "approved" && (
            <span className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-sm font-medium">
              ✓ Approved
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
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

        {/* Comments Panel */}
        <CommentPanel
          comments={comments}
          loading={loading}
          currentTime={currentTime}
          selectedCommentId={selectedCommentId}
          onCommentClick={handleCommentClick}
          onAddComment={addComment}
          onToggleResolved={toggleResolved}
        />
      </div>
    </div>
  );
}
