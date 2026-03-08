import Link from "next/link";
import { projects as mockProjects } from "@/data/mock";
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

  let projects: any[] = [];
  let usingDb = false;

  const { data: dbProjects } = await supabase
    .from("projects")
    .select("*, producer:profiles!producer_id(full_name), editor:profiles!editor_id(full_name)")
    .order("created_at", { ascending: false });

  if (dbProjects && dbProjects.length > 0) {
    projects = dbProjects.map((p: any) => ({
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
    usingDb = true;
  } else {
    projects = mockProjects;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="text-slate-500 mt-1">
            {projects.length} projects across all stages
            {!usingDb && <span className="text-xs ml-2 text-amber-500">(demo data)</span>}
          </p>
        </div>
        <Link
          href="/projects/new"
          className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors inline-flex items-center"
        >
          + New Project
        </Link>
      </div>

      {/* Project Grid */}
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
    </div>
  );
}
