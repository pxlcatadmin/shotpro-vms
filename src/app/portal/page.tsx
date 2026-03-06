import Link from "next/link";
import { projects, assets, reviewComments } from "@/data/mock";

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

export default function ClientPortalPage() {
  // Simulating the CBA client view
  const clientProjects = projects.filter((p) => p.client === "Commonwealth Bank");
  const project = clientProjects[0];
  const projectAssets = assets.filter((a) => a.projectId === project?.id);
  const latestVideo = projectAssets.find((a) => a.type === "video" && a.version === 2);
  const comments = latestVideo ? reviewComments.filter((c) => c.assetId === latestVideo.id) : [];
  const unresolvedCount = comments.filter((c) => !c.resolved).length;

  return (
    <div className="p-8">
      {/* Portal Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center font-bold text-sm">
                SP
              </div>
              <span className="text-xs text-white/50 tracking-widest uppercase">Client Portal</span>
            </div>
            <h1 className="text-2xl font-bold mb-1">Welcome, Lisa</h1>
            <p className="text-white/60 text-sm">
              Commonwealth Bank &middot; {clientProjects.length} active project{clientProjects.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-white/40 mb-1">Produced by</div>
            <div className="text-sm font-medium">ShotPro Productions</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Project Overview */}
          {project && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-semibold text-lg text-slate-900">{project.name}</h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {project.deliverableType} &middot; Due {project.dueDate}
                  </p>
                </div>
                <span className={`status-badge text-xs ${statusColor[project.status]}`}>
                  {project.status.replace("-", " ")}
                </span>
              </div>

              {/* Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">Overall Progress</span>
                  <span className="text-sm font-semibold text-slate-900">{project.progress}%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${project.progress}%` }} />
                </div>
              </div>

              {/* Phase Visual */}
              <div className="flex gap-2">
                {["Pre-Production", "Production", "Post-Production", "Delivery"].map((phase, i) => {
                  const phases = ["pre-production", "production", "post-production", "delivery"];
                  const currentIdx = phases.indexOf(project.status);
                  const isComplete = i < currentIdx;
                  const isCurrent = i === currentIdx;
                  return (
                    <div
                      key={phase}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium text-center ${
                        isComplete
                          ? "bg-emerald-100 text-emerald-700"
                          : isCurrent
                          ? "bg-brand-100 text-brand-700 ring-1 ring-brand-300"
                          : "bg-slate-50 text-slate-400"
                      }`}
                    >
                      {phase}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pending Review */}
          {latestVideo && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-900">Awaiting Your Review</h2>
                <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium">
                  {unresolvedCount} comments need attention
                </span>
              </div>

              <Link
                href={`/review/${latestVideo.id}`}
                className="block bg-slate-950 rounded-xl p-8 text-center hover:ring-2 hover:ring-brand-500 transition-all group"
              >
                <svg className="w-16 h-16 text-slate-600 mx-auto mb-3 group-hover:text-brand-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
                </svg>
                <div className="text-white font-medium mb-1">{latestVideo.name}</div>
                <div className="text-slate-500 text-sm">
                  Version {latestVideo.version} &middot; Click to review and leave timecoded feedback
                </div>
              </Link>
            </div>
          )}

          {/* Deliverables */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">All Deliverables</h2>
            <div className="space-y-2">
              {projectAssets.map((asset) => (
                <div key={asset.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-xs text-slate-400 font-medium">
                    {asset.type === "video" ? "MP4" : "PDF"}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-900">{asset.name}</div>
                    <div className="text-xs text-slate-500">v{asset.version} &middot; {asset.size} &middot; {asset.uploadedAt}</div>
                  </div>
                  <span className={`status-badge ${assetStatusStyle[asset.status]}`}>{asset.status}</span>
                  {asset.type === "video" && (
                    <Link
                      href={`/review/${asset.id}`}
                      className="text-xs text-brand-600 font-medium hover:text-brand-700 px-3 py-1.5 bg-brand-50 rounded-lg"
                    >
                      Review
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {latestVideo && (
                <Link
                  href={`/review/${latestVideo.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm font-medium">Review Latest Cut</span>
                </Link>
              )}
              <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">Approve Deliverable</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                <span className="text-sm font-medium">Download Finals</span>
              </button>
            </div>
          </div>

          {/* Key Dates */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Key Dates</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Edit v2 Feedback Due</span>
                <span className="text-sm font-medium text-amber-600">Mar 10</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Sound Design Complete</span>
                <span className="text-sm font-medium text-slate-600">Mar 14</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Final Delivery</span>
                <span className="text-sm font-medium text-slate-600">Mar 20</span>
              </div>
            </div>
          </div>

          {/* Your Team */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Your Production Team</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-xs font-medium text-brand-700">AR</div>
                <div>
                  <div className="text-sm font-medium text-slate-900">Alex Rivera</div>
                  <div className="text-xs text-slate-500">Producer</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-xs font-medium text-violet-700">JL</div>
                <div>
                  <div className="text-sm font-medium text-slate-900">Jordan Lee</div>
                  <div className="text-xs text-slate-500">Editor</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
