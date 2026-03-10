"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import TaskModal from "@/components/TaskModal";
import { useRealtimeTasks, type TaskWithRelations } from "@/hooks/useRealtimeTasks";

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

interface ScheduleClientProps {
  tasks: TaskWithRelations[];
  profiles: Profile[];
  projects: Project[];
  currentUserId: string;
}

const statusColors: Record<string, string> = {
  todo: "border-l-slate-300",
  "in-progress": "border-l-blue-500",
  review: "border-l-amber-500",
  done: "border-l-emerald-500",
};

const statusDot: Record<string, string> = {
  todo: "bg-slate-300",
  "in-progress": "bg-blue-500",
  review: "bg-amber-500",
  done: "bg-emerald-500",
};

const priorityBadge: Record<string, string> = {
  urgent: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-slate-100 text-slate-600",
  low: "bg-slate-50 text-slate-400",
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getCalendarDays(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1; // Monday-start
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function ScheduleClient({ tasks: initialTasks, profiles, projects, currentUserId }: ScheduleClientProps) {
  const router = useRouter();
  const tasks = useRealtimeTasks(initialTasks, profiles, projects);

  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [filterAssignee, setFilterAssignee] = useState<string>("all");
  const [showCreate, setShowCreate] = useState(false);
  const [createDate, setCreateDate] = useState<string | undefined>();
  const [editTask, setEditTask] = useState<TaskWithRelations | null>(null);

  // Keyboard shortcut: N to create
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "n" && !e.metaKey && !e.ctrlKey && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement) && !(e.target instanceof HTMLSelectElement)) {
        e.preventDefault();
        setCreateDate(new Date().toISOString().split("T")[0]);
        setShowCreate(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (filterAssignee === "mine") return t.assignee_id === currentUserId;
      if (filterAssignee !== "all") return t.assignee_id === filterAssignee;
      return true;
    });
  }, [tasks, filterAssignee, currentUserId]);

  // Group tasks by date for calendar
  const tasksByDate = useMemo(() => {
    const map = new Map<string, TaskWithRelations[]>();
    filteredTasks.forEach((t) => {
      const key = t.due_date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    });
    return map;
  }, [filteredTasks]);

  // Calendar data
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const days = getCalendarDays(year, month);
  const today = new Date().toISOString().split("T")[0];
  const monthLabel = currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));
  const goToday = () => setCurrentMonth(new Date());

  // Quick status cycle
  const cycleStatus = async (taskId: string, currentStatus: string) => {
    const order = ["todo", "in-progress", "review", "done"];
    const idx = order.indexOf(currentStatus);
    const next = order[(idx + 1) % order.length];
    const supabase = createClient();
    await supabase.from("tasks").update({ status: next }).eq("id", taskId);
    router.refresh();
  };

  // List view: group by date, sorted
  const listGroups = useMemo(() => {
    const nonDone = filteredTasks.filter((t) => t.status !== "done");
    const sorted = [...nonDone].sort((a, b) => a.due_date.localeCompare(b.due_date));
    const groups: { date: string; label: string; tasks: TaskWithRelations[] }[] = [];
    let currentKey = "";

    sorted.forEach((t) => {
      if (t.due_date !== currentKey) {
        currentKey = t.due_date;
        const d = new Date(t.due_date + "T12:00:00");
        const isToday = t.due_date === today;
        const isTomorrow = t.due_date === new Date(Date.now() + 86400000).toISOString().split("T")[0];
        let label = d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
        if (isToday) label = "Today \u2014 " + label;
        else if (isTomorrow) label = "Tomorrow \u2014 " + label;
        groups.push({ date: t.due_date, label, tasks: [] });
      }
      groups[groups.length - 1].tasks.push(t);
    });
    return groups;
  }, [filteredTasks, today]);

  const handleDayClick = (day: number) => {
    const dateKey = formatDateKey(year, month, day);
    setCreateDate(dateKey);
    setShowCreate(true);
  };

  const handleTaskClick = (task: TaskWithRelations) => {
    setEditTask(task);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Schedule</h1>
          <p className="text-slate-500 mt-1">Your team&apos;s tasks at a glance</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex bg-slate-100 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === "calendar" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === "list" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              List
            </button>
          </div>

          {/* Team Filter */}
          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
          >
            <option value="all">Everyone</option>
            <option value="mine">My Tasks</option>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>{p.full_name}</option>
            ))}
          </select>

          {/* Add Task */}
          <button
            onClick={() => { setCreateDate(today); setShowCreate(true); }}
            className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Task
          </button>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {/* Month Navigation */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <button onClick={prevMonth} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
              <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-slate-900">{monthLabel}</h2>
              <button onClick={goToday} className="text-xs text-brand-600 font-medium hover:text-brand-700 px-2 py-1 rounded bg-brand-50">
                Today
              </button>
            </div>
            <button onClick={nextMonth} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
              <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 border-b border-slate-200">
            {WEEKDAYS.map((d) => (
              <div key={d} className="px-2 py-2 text-xs font-medium text-slate-500 text-center">
                {d}
              </div>
            ))}
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-7">
            {days.map((day, i) => {
              if (day === null) {
                return <div key={`empty-${i}`} className="min-h-[100px] bg-slate-50/50 border-b border-r border-slate-100" />;
              }

              const dateKey = formatDateKey(year, month, day);
              const isToday = dateKey === today;
              const dayTasks = tasksByDate.get(dateKey) || [];
              const isOverdue = dateKey < today;

              return (
                <div
                  key={dateKey}
                  className={`min-h-[100px] border-b border-r border-slate-100 p-1.5 cursor-pointer hover:bg-slate-50/50 transition-colors ${
                    isToday ? "bg-brand-50/40" : ""
                  }`}
                  onClick={() => handleDayClick(day)}
                >
                  {/* Day Number */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                        isToday
                          ? "bg-brand-600 text-white"
                          : "text-slate-600"
                      }`}
                    >
                      {day}
                    </span>
                    {dayTasks.length > 3 && (
                      <span className="text-[10px] text-slate-400">+{dayTasks.length - 3}</span>
                    )}
                  </div>

                  {/* Task Pills */}
                  <div className="space-y-0.5">
                    {dayTasks.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        onClick={(e) => { e.stopPropagation(); handleTaskClick(task); }}
                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] border-l-2 bg-white hover:bg-slate-50 cursor-pointer truncate ${
                          isOverdue && task.status !== "done"
                            ? "border-l-red-500"
                            : statusColors[task.status] || "border-l-slate-300"
                        }`}
                      >
                        {task.assignee && (
                          <span className="w-4 h-4 rounded-full bg-brand-100 flex items-center justify-center text-[8px] font-medium text-brand-700 flex-shrink-0">
                            {getInitials(task.assignee.full_name)}
                          </span>
                        )}
                        <span className={`truncate ${task.status === "done" ? "line-through text-slate-400" : "text-slate-700"}`}>
                          {task.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="space-y-6">
          {listGroups.length > 0 ? (
            listGroups.map((group) => (
              <div key={group.date}>
                <h3 className={`text-sm font-semibold mb-3 ${
                  group.date === today ? "text-brand-600" : group.date < today ? "text-red-600" : "text-slate-700"
                }`}>
                  {group.label}
                  {group.date < today && <span className="ml-2 text-xs font-normal text-red-400">overdue</span>}
                </h3>
                <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
                  {group.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => handleTaskClick(task)}
                    >
                      {/* Status dot (clickable to cycle) */}
                      <button
                        onClick={(e) => { e.stopPropagation(); cycleStatus(task.id, task.status); }}
                        className={`w-3 h-3 rounded-full flex-shrink-0 hover:ring-2 hover:ring-offset-1 hover:ring-brand-300 transition-all ${statusDot[task.status] || "bg-slate-300"}`}
                        title={`Status: ${task.status} (click to advance)`}
                      />

                      {/* Title */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-900 truncate">{task.title}</div>
                        {task.description && (
                          <div className="text-xs text-slate-400 truncate">{task.description}</div>
                        )}
                      </div>

                      {/* Assignee */}
                      {task.assignee && (
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center text-[10px] font-medium text-brand-700">
                            {getInitials(task.assignee.full_name)}
                          </span>
                          <span className="text-xs text-slate-500 hidden sm:inline">{task.assignee.full_name.split(" ")[0]}</span>
                        </div>
                      )}

                      {/* Project */}
                      {task.project && (
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full truncate max-w-[120px] flex-shrink-0">
                          {task.project.name}
                        </span>
                      )}

                      {/* Priority */}
                      {task.priority !== "medium" && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${priorityBadge[task.priority] || ""}`}>
                          {task.priority}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
              <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              <p className="text-sm text-slate-400 mb-2">No upcoming tasks</p>
              <button
                onClick={() => { setCreateDate(today); setShowCreate(true); }}
                className="text-sm text-brand-600 font-medium hover:text-brand-700"
              >
                Create your first task &rarr;
              </button>
            </div>
          )}
        </div>
      )}

      {/* Task Modals */}
      {showCreate && (
        <TaskModal
          mode="create"
          projects={projects}
          teamMembers={profiles}
          defaultDate={createDate}
          onClose={() => { setShowCreate(false); setCreateDate(undefined); }}
        />
      )}
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
          teamMembers={profiles}
          onClose={() => setEditTask(null)}
        />
      )}
    </div>
  );
}
