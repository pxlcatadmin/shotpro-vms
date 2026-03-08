"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function NewProjectPage() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [client, setClient] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [deliverableType, setDeliverableType] = useState("Brand Film");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const { data, error } = await supabase
      .from("projects")
      .insert({
        name,
        client,
        due_date: dueDate,
        deliverable_type: deliverableType,
      })
      .select("id")
      .single();

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    router.push(`/projects/${data.id}`);
    router.refresh();
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">New Project</h1>
        <p className="text-slate-500 mt-1">
          Create a project so you can start uploading assets and reviews.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-xl p-6 space-y-5"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Project name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            placeholder="eg. Melbourne FC Membership Campaign"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Client
          </label>
          <input
            value={client}
            onChange={(e) => setClient(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            placeholder="eg. Melbourne FC"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Due date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Deliverable type
            </label>
            <select
              value={deliverableType}
              onChange={(e) => setDeliverableType(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              <option>Brand Film</option>
              <option>Social Cutdown</option>
              <option>Product Video</option>
              <option>Case Study</option>
              <option>Campaign Asset</option>
            </select>
          </div>
        </div>

        {error ? (
          <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Project"}
          </button>

          <Link
            href="/projects"
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
