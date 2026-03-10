import { createClient } from "@/lib/supabase/server";
import ScheduleClient from "./ScheduleClient";

export default async function SchedulePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch all tasks (including done, for calendar history)
  const { data: dbTasks } = await supabase
    .from("tasks")
    .select(`
      *,
      assignee:profiles!assignee_id (id, full_name, avatar_url),
      project:projects!project_id (name)
    `)
    .order("due_date");

  // Fetch all team members
  const { data: dbProfiles } = await supabase
    .from("profiles")
    .select("id, full_name, role, avatar_url")
    .order("full_name");

  // Fetch all projects (for task creation)
  const { data: dbProjects } = await supabase
    .from("projects")
    .select("id, name")
    .neq("status", "complete")
    .order("name");

  return (
    <ScheduleClient
      tasks={(dbTasks as any[]) || []}
      profiles={(dbProfiles as any[]) || []}
      projects={(dbProjects as any[]) || []}
      currentUserId={user?.id || ""}
    />
  );
}
