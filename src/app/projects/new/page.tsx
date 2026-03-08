"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [client, setClient] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [deliverableType, setDeliverableType] = useState("Brand Film");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in to create a project.");
      setLoading(false);
      return;
    }

    const { data: project, error: insertError } = await supabase
      .from("projects")
      .insert({
        name,
        client,
        due_date: dueDate,
        deliverable_type: deliverableType,
        status: "pre-production",
        progress: 0,
        producer_id: user.id,
      })
      .select("id")
      .single();

    if (insertError || !project) {
      setError(insertError?.message || "Failed to create project");
      setLoading(false);
      return;
    }

    router.push(`/projects/${project.id}`);
    router.refresh();
  }

  return (
    <div className="p-8 max-w-2xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/projects" className="hover:text-brand-600">Projects</Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">New Project</span>
      </div>

      <h1 className="text-2xl font-bold text-slate-900 mb-2">Create New Project</h1>
      <p className="text-slate-500 mb-8">Set up a new video production project.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Project Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Brand Hero Film 2026"
              required
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Client</label>
            <input
              type="text"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="e.g. Acme Corporation"
              required
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Deliverable Type</label>
              <select
                value={deliverableType}
                onChange={(e) => setDeliverableType(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 bg-white"
              >
                <option>Brand Film</option>
                <option>Social Campaign</option>
                <option>Corporate</option>
                <option>Series</option>
                <option>Event</option>
                <option>Documentary</option>
                <option>Commercial</option>
                <option>Music Video</option>
                <option>Other</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-brand-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Project"}
          </button>
          <Link
            href="/projects"
            className="px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
