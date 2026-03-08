"use client";

import { useState } from "react";

const stages = [
  { key: "new", label: "New", color: "border-t-slate-400" },
  { key: "qualified", label: "Qualified", color: "border-t-sky-500" },
  { key: "proposal", label: "Proposal", color: "border-t-amber-500" },
  { key: "negotiation", label: "Negotiation", color: "border-t-violet-500" },
  { key: "won", label: "Won", color: "border-t-emerald-500" },
  { key: "lost", label: "Lost", color: "border-t-red-400" },
] as const;

export default function PipelinePage() {
  const [selectedLead] = useState<string | null>(null);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sales Pipeline</h1>
          <p className="text-slate-500 mt-1">
            Track and manage your sales opportunities
          </p>
        </div>
        <button className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors">
          + New Lead
        </button>
      </div>

      {/* Pipeline Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <div key={stage.key} className="flex-shrink-0 w-64">
            {/* Column Header */}
            <div className={`bg-white rounded-t-xl border border-slate-200 border-t-4 ${stage.color} p-4`}>
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-slate-700">{stage.label}</span>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  0
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1">$0k</div>
            </div>

            {/* Empty State */}
            <div className="mt-2 border-2 border-dashed border-slate-200 rounded-lg p-6 text-center">
              <p className="text-xs text-slate-400">No leads in this stage</p>
            </div>
          </div>
        ))}
      </div>

      {/* Coming Soon Note */}
      <div className="mt-8 bg-slate-50 rounded-xl border border-slate-200 p-6 text-center">
        <p className="text-sm text-slate-500">
          Pipeline management is coming soon. Leads and opportunities will be tracked here.
        </p>
      </div>
    </div>
  );
}
