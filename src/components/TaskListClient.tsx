"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import TaskModal from "./TaskModal";

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

interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  project_id: string;
  assignee_id: string | null;
  assignee_name: string;
  status: string;
  phase: string;
  due_date: string;
  priority: string;
}

const taskStatusStyle: Record<string, string> = {
  todo: "bg-slate-100 text-slate-600",
  "in-progress": "bg-blue-100 text-blue-700",
  review: "bg-amber-100 text-amber-700",
  done: "bg-emerald-100 text-emerald-700",
};

const statusDot: Record<string, string> = {
  todo: "bg-slate-300",
  "in-progress": "bg-blue-500",
  review: "bg-amber-500",
  done: "bg-emerald-500",
};

interface TaskListClientProps {
  tasks: TaskRow[];
  projectId: string;
  projects: Project[];
  teamMembers: Profile[];
}

export default function TaskListClient({
  tasks,
  projectId,
  projects,
  teamMembers,
}: TaskListClientProps) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [editTask, setEditTask] = useState<TaskRow | null>(null);

  const handleQuickStatus = async (taskId: string, currentStatus: string) => {
    const order = ["todo", "in-progress", "review", "done"];
    const next = order[(order.indexOf(currentStatus) + 1) % order.length];
    const supabase = createClient();
    await supabase.from("tasks").update({ status: next }).eq("id", taskId);
    router.refresh();
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-slate-900">Tasks</h2>
        <button
          onClick={() => setShowCreate(true)}
          className="text-sm text-brand-600 font-medium hover:text-brand-700"
        >
          + Add Task
        </button>
      </div>
      <div className="space-y-2">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group"
              onClick={() => setEditTask(task)}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickStatus(task.id, task.status);
                }}
                className={`w-2.5 h-2.5 rounded-full ${statusDot[task.status] || "bg-slate-300"} hover:ring-2 hover:ring-offset-1 hover:ring-brand-400 transition-all`}
                title={`Status: ${task.status} — click to cycle`}
              />
              <div className="flex-1 min-w-0">
                <div
                  className={`text-sm font-medium ${
                    task.status === "done"
                      ? "text-slate-400 line-through"
                      : "text-slate-900"
                  }`}
                >
                  {task.title}
                </div>
                <div className="text-xs text-slate-500">
                  {task.assignee_name} &middot; {task.phase}
                  {task.priority === "urgent" && (
                    <span className="ml-1 text-red-500 font-medium">
                      &middot; Urgent
                    </span>
                  )}
                </div>
              </div>
              <span
                className={`status-badge text-[10px] ${
                  taskStatusStyle[task.status] || ""
                }`}
              >
                {task.status}
              </span>
              <span className="text-xs text-slate-400">{task.due_date}</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-400 py-8 text-center">
            No tasks yet. Click &quot;+ Add Task&quot; to get started.
          </p>
        )}
      </div>

      {/* Create modal */}
      {showCreate && (
        <TaskModal
          mode="create"
          projects={projects}
          teamMembers={teamMembers}
          defaultProjectId={projectId}
          onClose={() => setShowCreate(false)}
          onSaved={() => {
            setShowCreate(false);
            router.refresh();
          }}
        />
      )}

      {/* Edit modal */}
      {editTask && (
        <TaskModal
          mode="edit"
          task={{
            id: editTask.id,
            title: editTask.title,
            description: editTask.description,
            project_id: editTask.project_id,
            assignee_id: editTask.assignee_id,
            status: editTask.status,
            phase: editTask.phase,
            due_date: editTask.due_date,
            priority: editTask.priority,
          }}
          projects={projects}
          teamMembers={teamMembers}
          onClose={() => setEditTask(null)}
          onSaved={() => {
            setEditTask(null);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
