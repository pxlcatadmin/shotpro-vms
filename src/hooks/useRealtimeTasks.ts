"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export interface TaskWithRelations {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  assignee_id: string | null;
  status: string;
  due_date: string;
  phase: string;
  priority: string;
  created_at: string;
  assignee?: { id: string; full_name: string; avatar_url: string | null } | null;
  project?: { name: string } | null;
}

interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

interface Project {
  id: string;
  name: string;
}

export function useRealtimeTasks(
  initialTasks: TaskWithRelations[],
  profiles: Profile[],
  projects: Project[]
) {
  const [tasks, setTasks] = useState<TaskWithRelations[]>(initialTasks);

  // Sync with server-rendered data on refresh
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("tasks-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        (payload: RealtimePostgresChangesPayload<any>) => {
          if (payload.eventType === "INSERT") {
            const raw = payload.new;
            // Enrich with profile/project data from local lookup
            const assignee = profiles.find((p) => p.id === raw.assignee_id) || null;
            const project = projects.find((p) => p.id === raw.project_id) || null;
            const enriched: TaskWithRelations = {
              ...raw,
              assignee: assignee ? { id: assignee.id, full_name: assignee.full_name, avatar_url: assignee.avatar_url } : null,
              project: project ? { name: project.name } : null,
            };
            setTasks((prev) => [...prev, enriched]);
          } else if (payload.eventType === "UPDATE") {
            const raw = payload.new;
            const assignee = profiles.find((p) => p.id === raw.assignee_id) || null;
            const project = projects.find((p) => p.id === raw.project_id) || null;
            setTasks((prev) =>
              prev.map((t) =>
                t.id === raw.id
                  ? {
                      ...t,
                      ...raw,
                      assignee: assignee ? { id: assignee.id, full_name: assignee.full_name, avatar_url: assignee.avatar_url } : null,
                      project: project ? { name: project.name } : null,
                    }
                  : t
              )
            );
          } else if (payload.eventType === "DELETE") {
            setTasks((prev) => prev.filter((t) => t.id !== (payload.old as any).id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profiles, projects]);

  return tasks;
}
