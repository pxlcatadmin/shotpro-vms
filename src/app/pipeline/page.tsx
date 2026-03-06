"use client";

import { leads } from "@/data/mock";
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
  const [selectedLead, setSelectedLead] = useState<string | null>(null);

  const totalPipeline = leads
    .filter((l) => !["won", "lost"].includes(l.stage))
    .reduce((sum, l) => sum + l.value, 0);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sales Pipeline</h1>
          <p className="text-slate-500 mt-1">
            {leads.filter((l) => !["won", "lost"].includes(l.stage)).length} active opportunities &middot; ${(totalPipeline / 1000).toFixed(0)}k pipeline value
          </p>
        </div>
        <button className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors">
          + New Lead
        </button>
      </div>

      {/* Pipeline Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const stageLeads = leads.filter((l) => l.stage === stage.key);
          const stageValue = stageLeads.reduce((sum, l) => sum + l.value, 0);

          return (
            <div key={stage.key} className="flex-shrink-0 w-64">
              {/* Column Header */}
              <div className={`bg-white rounded-t-xl border border-slate-200 border-t-4 ${stage.color} p-4`}>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm text-slate-700">{stage.label}</span>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                    {stageLeads.length}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  ${(stageValue / 1000).toFixed(0)}k
                </div>
              </div>

              {/* Cards */}
              <div className="space-y-2 mt-2 pipeline-col">
                {stageLeads.map((lead) => (
                  <div
                    key={lead.id}
                    onClick={() => setSelectedLead(selectedLead === lead.id ? null : lead.id)}
                    className={`bg-white rounded-lg border p-3.5 cursor-pointer transition-all hover:shadow-md ${
                      selectedLead === lead.id ? "border-brand-400 shadow-md ring-1 ring-brand-100" : "border-slate-200"
                    }`}
                  >
                    <div className="font-medium text-sm text-slate-900 mb-1">{lead.company}</div>
                    <div className="text-xs text-slate-500">{lead.contact}</div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm font-semibold text-slate-900">
                        ${(lead.value / 1000).toFixed(0)}k
                      </span>
                      <span className="text-xs text-slate-400">{lead.source}</span>
                    </div>
                    {selectedLead === lead.id && (
                      <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 animate-fade-in">
                        <div className="text-xs text-slate-500">
                          <span className="font-medium text-slate-600">Email:</span> {lead.email}
                        </div>
                        <div className="text-xs text-slate-500">
                          <span className="font-medium text-slate-600">Added:</span> {lead.createdAt}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <button className="flex-1 text-xs bg-brand-50 text-brand-600 px-2 py-1.5 rounded font-medium hover:bg-brand-100 transition-colors">
                            Convert to Project
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
