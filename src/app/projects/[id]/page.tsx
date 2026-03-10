import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProjectHeaderActions from "@/components/ProjectHeaderActions";
import TaskListClient from "@/components/TaskListClient";

const statusColor: Record<string, string> = {
  "pre-production": "bg-sky-100 text-sky-700",
  production: "bg-amber-100 text-amber-700",
  "post-production": "bg-violet-100 text-violet-700",
  delivery: "bg-emerald-100 text-emerald-700",
  complete: "bg-slate-100 text-slate-600",
};

const assetStatusStyle: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  "in-review": "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  final: "bg-brand-100 text-brand-700",
};

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: dbProject } = await supabase
    .from("projects")
    .select("*, producer:profiles!producer_id(full_name), editor:profiles!editor_id(full_name)")
    .eq("id", params.id)
    .single();

  if (!dbProject) return notFound();

  const project = {
    id: dbProject.id,
    name: dbProject.name,
    client: dbProject.client,
    status: dbProject.status,
    dueDate: dbProject.due_date,
    progress: dbProject.progress,
    producer: dbProject.producer?.full_name || "Unassigned",
    editor: dbProject.editor?.full_name || "Unassigned",
    deliverableType: dbProject.deliverable_type,
  };

  const { data: dbTasks } = await supabase
    .from("tasks")
    .select("*, assignee:profiles!assignee_id(full_name)")
    .eq("project_id", params.id)
    .order("due_date");

  const projectTasks = (dbTasks || []).map((t: any) => ({
    id: t.id,
    title: t.title,
    description: t.description || null,
    project_id: t.project_id,
    assignee_id: t.assignee_id,
    assignee_name: t.assignee?.full_name || "Unassigned",
    status: t.status,
    due_date: t.due_date,
    phase: t.phase,
    priority: t.priority || "medium",
  }));

  const { data: allProjects } = await supabase
    .from("projects")
    .select("id, name")
    .order("name");

  const { data: allProfiles } = await supabase
    .from("profiles")
    .select("id, full_name, role, avatar_url")
    .order("full_name");

  const { data: dbAssets } = await supabase
    .from("assets")
    .select("*")
    .eq("project_id", params.id)
    .order("created_at", { ascending: false });

  const projectAssets = (dbAssets || []).map((a: any) => ({
    id: a.id,
    name: a.name,
    type: a.type,
    size: formatBytes(a.size_bytes),
    version: a.version,
    status: a.status,
  }));

  const phases = ["Pre-Production", "Production", "Post-Production", "Delivery"];
  const currentPhaseIndex = phases.findIndex(
    (p) => p.toLowerCase().replace("-", "") === project.status.replace("-", "")
  );

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/projects" className="hover:text-brand-600">Projects</Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">{project.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
            <span className={`status-badge ${statusColor[project.status] || ""}`}>
              {project.status.replace("-", " ")}
            </span>
          </div>
          <p className="text-slate-500">
            {project.client} &middot; {project.deliverableType} &middot; Due {project.dueDate}
          </p>
        </div>
        <ProjectHeaderActions project={project} />
      </div>

      {/* Phase Timeline */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h2 className="font-semibold text-slate-900 mb-4">Project Timeline</h2>
        <div className="flex items-center gap-0">
          {phases.map((phase, i) => (
            <div key={phase} className="flex-1 flex items-center">
              <div className="flex items-center gap-2 flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    i <= currentPhaseIndex
                      ? "bg-brand-600 text-white"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {i < currentPhaseIndex ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span className={`text-sm ${i <= currentPhaseIndex ? "text-slate-900 font-medium" : "text-slate-400"}`}>
                  {phase}
                </span>
              </div>
              {i < phases.length - 1 && (
                <div className={`flex-shrink-0 w-12 h-0.5 mx-2 ${i < currentPhaseIndex ? "bg-brand-500" : "bg-slate-200"}`} />
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-brand-500 rounded-full" style={{ width: `${project.progress}%` }} />
          </div>
          <span className="text-sm font-medium text-slate-600">{project.progress}%</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Tasks */}
        <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-6">
          <TaskListClient
            tasks={projectTasks}
            projectId={project.id}
            projects={allProjects || []}
            teamMembers={allProfiles || []}
          />
        </div>

        {/* Team & Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Team</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-xs font-medium text-brand-700">
                  {project.producer.split(" ").map((n: string) => n[0]).join("")}
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900">{project.producer}</div>
                  <div className="text-xs text-slate-500">Producer</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-xs font-medium text-violet-700">
                  {project.editor !== "Unassigned"
                    ? project.editor.split(" ").map((n: string) => n[0]).join("")
                    : "?"}
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900">{project.editor}</div>
                  <div className="text-xs text-slate-500">Editor</div>
                </div>
              </div>
            </div>
          </div>

          {/* Assets */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900">Assets</h2>
              <span className="text-xs text-slate-400">{projectAssets.length} files</span>
            </div>
            {projectAssets.length > 0 ? (
              <div className="space-y-2">
                {projectAssets.map((asset: any) => (
                  <Link
                    key={asset.id}
                    href={asset.type === "video" ? `/review/${asset.id}` : "#"}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-xs text-slate-400 font-medium">
                      {asset.type === "video" ? "MP4" : asset.type === "document" ? "PDF" : (asset.type || "").toUpperCase().slice(0, 3)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-slate-900 truncate">{asset.name}</div>
                      <div className="text-[10px] text-slate-500">v{asset.version} &middot; {asset.size}</div>
                    </div>
                    <span className={`status-badge text-[10px] ${assetStatusStyle[asset.status] || ""}`}>
                      {asset.status}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-4">No assets uploaded yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
