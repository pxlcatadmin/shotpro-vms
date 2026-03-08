"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export interface ReviewComment {
  id: string;
  asset_id: string;
  author_id: string;
  timecode_seconds: number;
  text: string;
  resolved: boolean;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
  // Joined
  author?: {
    id: string;
    full_name: string;
    role: string;
    avatar_url: string | null;
  };
}

export function useRealtimeComments(assetId: string) {
  const [comments, setComments] = useState<ReviewComment[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Fetch initial comments
  useEffect(() => {
    async function fetchComments() {
      setLoading(true);
      const { data, error } = await supabase
        .from("review_comments")
        .select(`
          *,
          author:profiles!author_id (id, full_name, role, avatar_url)
        `)
        .eq("asset_id", assetId)
        .order("created_at", { ascending: true });

      if (!error && data) {
        setComments(data as unknown as ReviewComment[]);
      }
      setLoading(false);
    }

    fetchComments();
  }, [assetId]);

  // Subscribe to realtime changes
  useEffect(() => {
    const channel = supabase
      .channel(`comments:${assetId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "review_comments",
          filter: `asset_id=eq.${assetId}`,
        },
        async (payload: RealtimePostgresChangesPayload<ReviewComment>) => {
          if (payload.eventType === "INSERT") {
            // Fetch the full comment with author join
            const { data } = await supabase
              .from("review_comments")
              .select(`
                *,
                author:profiles!author_id (id, full_name, role, avatar_url)
              `)
              .eq("id", (payload.new as ReviewComment).id)
              .single();

            if (data) {
              setComments((prev) => [...prev, data as unknown as ReviewComment]);
            }
          } else if (payload.eventType === "UPDATE") {
            setComments((prev) =>
              prev.map((c) =>
                c.id === (payload.new as ReviewComment).id
                  ? { ...c, ...(payload.new as Partial<ReviewComment>) }
                  : c
              )
            );
          } else if (payload.eventType === "DELETE") {
            setComments((prev) =>
              prev.filter((c) => c.id !== (payload.old as ReviewComment).id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [assetId]);

  const addComment = useCallback(
    async (timecodeSec: number, text: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("review_comments").insert({
        asset_id: assetId,
        author_id: user.id,
        timecode_seconds: timecodeSec,
        text,
      });
      if (error) console.error("Failed to add comment:", error);
    },
    [assetId]
  );

  const toggleResolved = useCallback(
    async (commentId: string, resolved: boolean) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("review_comments")
        .update({
          resolved,
          resolved_by: resolved ? user?.id : null,
          resolved_at: resolved ? new Date().toISOString() : null,
        })
        .eq("id", commentId);
      if (error) console.error("Failed to toggle resolved:", error);
    },
    []
  );

  return { comments, loading, addComment, toggleResolved };
}
