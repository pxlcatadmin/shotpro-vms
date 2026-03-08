"use client";

import Link from "next/link";
import { assets as mockAssets, projects as mockProjects } from "@/data/mock";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import UploadModal from "@/components/UploadModal";

const assetStatusStyle: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  "in-review": "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  final: "bg-brand-100 text-brand-700",
};

const typeIcons: Record<string, JSX.Element> = {
  video: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
    </svg>
  ),
  image: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M2.25 18.75h18a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H2.25A2.25 2.25 0 000 6.75v9.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  ),
  audio: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
    </svg>
  ),
  document: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
};

interface DBAsset {
  id: string;
  name: string;
  type: string;
  size_bytes: number;
  version: number;
  status: string;
  created_at: string;
  project_id: string;
  uploaded_by: string;
  uploader?: { full_name: string } | null;
  project?: { id: string; name: string } | null;
}

export default function AssetsPage() {
  const [filter, setFilter] = useState<"all" | "video" | "image" | "audio" | "document">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showUpload, setShowUpload] = useState(false);
  const [dbAssets, setDbAssets] = useState<DBAsset[]>([]);
  const [dbProjects, setDbProjects] = useState<{ id: string; name: string }[]>([]);
  const [usingDb, setUsingDb] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>("");

  // Try to load from Supabase; fallback to mock
  useEffect(() => {
    async function loadFromDb() {
      const supabase = createClient();
      const { data: assets, error } = await supabase
        .from("assets")
        .select(`
          *,
          uploader:profiles!uploaded_by (full_name),
          project:projects!project_id (id, name)
        `)
        .order("created_at", { ascending: false });

      if (!error && assets && assets.length > 0) {
        setDbAssets(assets as unknown as DBAsset[]);
        setUsingDb(true);
      }

      // Load projects for the upload modal
      const { data: projects } = await supabase
        .from("projects")
        .select("id, name")
        .order("name");
      if (projects) setDbProjects(projects);
    }
    loadFromDb();
  }, []);

  // If using mock data
  const filtered = usingDb
    ? dbAssets.filter((a) => {
        if (filter !== "all" && a.type !== filter) return false;
        if (statusFilter !== "all" && a.status !== statusFilter) return false;
        return true;
      })
    : mockAssets.filter((a) => {
        if (filter !== "all" && a.type !== filter) return false;
        if (statusFilter !== "all" && a.status !== statusFilter) return false;
        return true;
      });

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Asset Library</h1>
          <p className="text-slate-500 mt-1">
            {usingDb ? dbAssets.length : mockAssets.length} files
            {!usingDb && " (demo data)"}
          </p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          Upload Files
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex bg-slate-100 rounded-lg p-0.5">
          {(["all", "video", "image", "audio", "document"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filter === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex bg-slate-100 rounded-lg p-0.5">
          {["all", "draft", "in-review", "approved", "final"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                statusFilter === s ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {s === "all" ? "All Status" : s.charAt(0).toUpperCase() + s.slice(1).replace("-", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Asset Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Name</th>
              <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Project</th>
              <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Version</th>
              <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Size</th>
              <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Status</th>
              <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Uploaded</th>
              <th className="text-left text-xs font-medium text-slate-500 px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {usingDb
              ? (filtered as DBAsset[]).map((asset) => (
                  <tr key={asset.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-400">
                          {typeIcons[asset.type] || typeIcons.document}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900">{asset.name}</div>
                          <div className="text-xs text-slate-500">{asset.uploader?.full_name || "—"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-600">{asset.project?.name || "—"}</td>
                    <td className="px-5 py-3 text-sm text-slate-600">v{asset.version}</td>
                    <td className="px-5 py-3 text-sm text-slate-600">{formatSize(asset.size_bytes)}</td>
                    <td className="px-5 py-3">
                      <span className={`status-badge ${assetStatusStyle[asset.status] || ""}`}>{asset.status}</span>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-500">
                      {new Date(asset.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      {asset.type === "video" && (
                        <Link href={`/review/${asset.id}`} className="text-xs text-brand-600 font-medium hover:text-brand-700">
                          Review
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              : (filtered as typeof mockAssets).map((asset) => {
                  const project = mockProjects.find((p) => p.id === asset.projectId);
                  return (
                    <tr key={asset.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-400">
                            {typeIcons[asset.type]}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900">{asset.name}</div>
                            <div className="text-xs text-slate-500">{asset.uploadedBy}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-600">{project?.name || "—"}</td>
                      <td className="px-5 py-3 text-sm text-slate-600">v{asset.version}</td>
                      <td className="px-5 py-3 text-sm text-slate-600">{asset.size}</td>
                      <td className="px-5 py-3">
                        <span className={`status-badge ${assetStatusStyle[asset.status]}`}>{asset.status}</span>
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-500">{asset.uploadedAt}</td>
                      <td className="px-5 py-3">
                        {asset.type === "video" && (
                          <Link href={`/review/${asset.id}`} className="text-xs text-brand-600 font-medium hover:text-brand-700">
                            Review
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <>
          {dbProjects.length > 0 ? (
            <>
              {!selectedProject ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowUpload(false)}>
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Select Project</h2>
                    <div className="space-y-2">
                      {dbProjects.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedProject(p.id)}
                          className="w-full text-left px-4 py-3 rounded-lg border border-slate-200 hover:border-brand-400 hover:bg-brand-50/30 transition-colors text-sm"
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setShowUpload(false)}
                      className="mt-4 text-sm text-slate-500 hover:text-slate-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <UploadModal
                  projectId={selectedProject}
                  onClose={() => {
                    setShowUpload(false);
                    setSelectedProject("");
                  }}
                />
              )}
            </>
          ) : (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowUpload(false)}>
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 text-center" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-lg font-semibold text-slate-900 mb-2">No Projects Yet</h2>
                <p className="text-sm text-slate-500 mb-4">
                  Create a project first before uploading assets. Make sure the database migration has been run.
                </p>
                <div className="flex items-center justify-center gap-3 mt-4">
                  <Link
                    href="/projects/new"
                    className="bg-brand-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
                  >
                    Create Project
                  </Link>
                  <button
                    onClick={() => setShowUpload(false)}
                    className="text-sm text-slate-500 hover:text-slate-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
