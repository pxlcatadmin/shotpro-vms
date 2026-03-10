"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import TeamMemberPicker from "./TeamMemberPicker";

interface Profile {
  id: string;
  full_name: string;
  role: string;
  avatar_url: string | null;
}

interface Project {
  id: string;
  name: string;
}

interface TaskData {
  id: string;
  title: string;
  description: string | null;
  project_id: string;
  assignee_id: string | null;
  status: string;
  phase: string;
  due_date: string;
  priority: string;
}

interface TaskModalProps {
  mode: "create" | "edit";
  task?: TaskData;
  projects: Project[];
  teamMembers: Profile[];
  defaultDate?: string;
  defaultProjectId?: string;
  onClose: () => void;
  onSaved?: () => void;
}

const phases = ["Pre-Production", "Production", "Post-Production", "Delivery"];
const statusOptions = [
  { value: "todo", label: "To Do" },
  { value: "in-progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "done", label: "Done" },
];
const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export default function TaskModal({
  mode,
  task,
  projects,
  teamMembers,
  defaultDate,
  defaultProjectId,
  onClose,
  onSaved,
}: TaskModalProps) {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];

  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [projectId, setProjectId] = useState(task?.project_id || defaultProjectId || (projects[0]?.id || ""));
  const [assigneeId, setAssigneeId] = useState<string | null>(task?.assignee_id || null);
  const [phase, setPhase] = useState(task?.phase || "Pre-Production");
  const [status, setStatus] = useState(task?.status || "todo");
  const [dueDate, setDueDate] = useState(task?.due_date || defaultDate || today);
  const [priority, setPriority] = useState(task?.priority || "medium");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Task title is required");
      return;
    }
    if (!projectId) {
      setError("Please select a project");
      return;
    }
    if (!dueDate) {
      setError("Due date is required");
      return;
    }

    setSaving(true);
    setError(null);
    const supabase = createClient();

    if (mode === "create") {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("You must be logged in"); setSaving(false); return; }

      const { error: insertError } = await supabase.from("tasks").insert({
        project_id: projectId,
        title: title.trim(),
        description: description.trim() || null,
        phase,
        status,
        due_date: dueDate,
        priority,
        assignee_id: assigneeId || user.id,
      });

      if (insertError) { setError(insertError.message); setSaving(false); return; }
    } else {
      const { error: updateError } = await supabase
        .from("tasks")
        .update({
          title: title.trim(),
          description: description.trim() || null,
          project_id: projectId,
          phase,
          status,
          due_date: dueDate,
          priority,
          assignee_id: assigneeId,
        })
        .eq("id", task!.id);

      if (updateError) { setError(updateError.message); setSaving(false); return; }
    }

    router.refresh();
    onSaved?.();
    onClose();
  };

  const handleMarkDone = async () => {
    if (mode !== "edit" || !task) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("tasks").update({ status: "done" }).eq("id", task.id);
    router.refresh();
    onSaved?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            {mode === "create" ? "Add Task" : "Edit Task"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Task Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Script first draft"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Description <span className="text-slate-400">(optional)</span></label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Any additional details..."
              rows={2}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 resize-none"
            />
          </div>

          {/* Project + Assignee */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Project</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <TeamMemberPicker
              members={teamMembers}
              value={assigneeId}
              onChange={(id) => setAssigneeId(id || null)}
            />
          </div>

          {/* Phase + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Phase</label>
              <select
                value={phase}
                onChange={(e) => setPhase(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
              >
                {phases.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
              >
                {statusOptions.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date + Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
              >
                {priorityOptions.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-200">
          <div>
            {mode === "edit" && task?.status !== "done" && (
              <button
                onClick={handleMarkDone}
                disabled={saving}
                className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium hover:text-emerald-700 disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Mark Done
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-brand-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : mode === "create" ? "Add Task" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
