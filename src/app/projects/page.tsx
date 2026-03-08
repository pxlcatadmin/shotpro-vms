import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const statusColor: Record<string, string> = {
  "pre-production": "bg-sky-100 text-sky-700",
  production: "bg-amber-100 text-amber-700",
  "post-production": "bg-violet-100 text-violet-700",
  delivery: "bg-emerald-100 text-emerald-700",
  complete: "bg-slate-100 text-slate-600",
};

export default async function ProjectsPage() {
  const supabase = createClient();

  const { data: dbProjects } = await supabase
    .from("projects")
    .select("*, producer:profiles!producer_id(full_name), editor:profiles!editor_id(full_name)")
    .order("created_at", { ascending: false });

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

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="text-slate-500 mt-1">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/projects/new"
          className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
        >
          + New Project
        </Link>
      </div>

      {projects.length > 0 ? (
        <div className="grid grid-cols-2 gap-5">
          {projects.map((project: any) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-slate-900">{project.name}</h3>
                  <p className="text-sm text-slate-500 mt-0.5">{project.client}</p>
                </div>
                <span className={`status-badge ${statusColor[project.status] || ""}`}>
                  {project.status.replace("-", " ")}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <div className="text-xs text-slate-500">Type</div>
                  <div className="text-sm font-medium text-slate-700">{project.deliverableType}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Due Date</div>
                  <div className="text-sm font-medium text-slate-700">{project.dueDate}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Producer</div>
                  <div className="text-sm font-medium text-slate-700">{project.producer}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-500 rounded-full transition-all"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-slate-600">{project.progress}%</span>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center text-[10px] font-medium text-brand-700">
                    {project.producer
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </div>
                  {project.editor !== "Unassigned" && (
                    <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center text-[10px] font-medium text-violet-700">
                      {project.editor
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </div>
                  )}
                </div>
                <span className="text-xs text-slate-400">View details &rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
          <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.75}>
            <path strokeLinecap="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
          </svg>
          <h2 className="text-lg font-semibold text-slate-700 mb-2">No projects yet</h2>
          <p className="text-sm text-slate-400 mb-6">Create your first project to start managing your video production workflow.</p>
          <Link
            href="/projects/new"
            className="inline-block bg-brand-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
          >
            Create First Project
          </Link>
        </div>
      )}
    </div>
  );
}
