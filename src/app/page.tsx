import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const statusColor: Record<string, string> = {
  "pre-production": "bg-sky-100 text-sky-700",
  production: "bg-amber-100 text-amber-700",
  "post-production": "bg-violet-100 text-violet-700",
  delivery: "bg-emerald-100 text-emerald-700",
  complete: "bg-slate-100 text-slate-600",
};

const taskStatusIcon: Record<string, string> = {
  todo: "bg-slate-200",
  "in-progress": "bg-blue-500",
  review: "bg-amber-500",
  done: "bg-emerald-500",
};

export default async function Dashboard() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: dbProjects } = await supabase
    .from("projects")
    .select("*, producer:profiles!producer_id(full_name), editor:profiles!editor_id(full_name)")
    .neq("status", "complete")
    .order("due_date");

  const projects = (dbProjects || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    client: p.client,
    status: p.status,
    dueDate: p.due_date,
    progress: p.progress,
    producer: p.producer?.full_name || "Unassigned",
    editor: p.editor?.full_name || "Unassigned",
    deliverableType: p.deliverable_type,
  }));

  const today = new Date().toISOString().split("T")[0];

  const { data: dbTasks } = await supabase
    .from("tasks")
    .select("*, assignee:profiles!assignee_id(full_name)")
    .eq("assignee_id", user?.id ?? "")
    .eq("due_date", today)
    .neq("status", "done")
    .order("due_date");

  const tasks = (dbTasks || []).map((t: any) => ({
    id: t.id,
    projectId: t.project_id,
    title: t.title,
    assignee: t.assignee?.full_name || "Unassigned",
    status: t.status,
    dueDate: t.due_date,
    phase: t.phase,
    priority: t.priority || "medium",
  }));

  const { data: pendingAssets } = await supabase.from("assets").select("id").eq("status", "in-review");
  const { data: allActiveProjects } = await supabase.from("projects").select("id").neq("status", "complete");

  const stats = {
    activeProjects: allActiveProjects?.length || 0,
    pendingReviews: pendingAssets?.length || 0,
  };

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "there";

  const statCards = [
    { label: "Active Projects", value: stats.activeProjects, color: "bg-brand-600", href: "/projects" },
    { label: "Tasks Today", value: tasks.length, color: "bg-violet-500", href: "/schedule" },
    { label: "Pending Reviews", value: stats.pendingReviews, color: "bg-amber-500", href: "/assets" },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">
          Welcome back, {userName}. Here&apos;s what&apos;s happening today.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-5 mb-8">
        {statCards.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-500">{s.label}</span>
              <div className={`w-2 h-2 rounded-full ${s.color}`} />
            </div>
            <div className="text-3xl font-bold text-slate-900">{s.value}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Active Projects */}
        <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-slate-900">Active Projects</h2>
            <Link href="/projects" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
              View all
            </Link>
          </div>
          {projects.length > 0 ? (
            <div className="space-y-3">
              {projects.map((project: any) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-slate-900 truncate">{project.name}</span>
                      <span className={`status-badge ${statusColor[project.status] || ""}`}>
                        {project.status.replace("-", " ")}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{project.client} &middot; Due {project.dueDate}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full transition-all"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500 w-8 text-right">{project.progress}%</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
              </svg>
              <p className="text-sm text-slate-400 mb-3">No projects yet</p>
              <Link href="/projects/new" className="text-sm text-brand-600 font-medium hover:text-brand-700">
                Create your first project &rarr;
              </Link>
            </div>
          )}
        </div>

        {/* My Tasks Today */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-slate-900">My Tasks Today</h2>
            <Link href="/schedule" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
              View Schedule &rarr;
            </Link>
          </div>
          {tasks.length > 0 ? (
            <div className="space-y-3">
              {tasks.map((task: any) => (
                <div key={task.id} className="flex items-start gap-3 p-2">
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${taskStatusIcon[task.status] || "bg-slate-200"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">{task.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {task.phase}
                      {task.priority === "urgent" && (
                        <span className="ml-1 text-red-500 font-medium">&middot; Urgent</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="w-10 h-10 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-slate-400">All clear for today!</p>
              <Link href="/schedule" className="text-sm text-brand-600 font-medium hover:text-brand-700 mt-1 inline-block">
                Open Schedule &rarr;
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        {[
          { label: "New Project", href: "/projects/new", icon: "+" },
          { label: "Upload Asset", href: "/assets", icon: "^" },
          { label: "Start Review", href: "/assets", icon: ">" },
        ].map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-4 hover:border-brand-300 hover:shadow-sm transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 font-bold text-lg">
              {action.icon}
            </div>
            <span className="text-sm font-medium text-slate-700">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
