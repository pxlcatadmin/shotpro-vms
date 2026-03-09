"use client";

import { useState } from "react";
import EditProjectModal from "./EditProjectModal";
import UploadModal from "./UploadModal";

interface ProjectData {
  id: string;
  name: string;
  client: string;
  status: string;
  dueDate: string;
  deliverableType: string;
  progress: number;
}

interface ProjectHeaderActionsProps {
  project: ProjectData;
}

export default function ProjectHeaderActions({ project }: ProjectHeaderActionsProps) {
  const [showEdit, setShowEdit] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={() => setShowEdit(true)}
          className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Edit Project
        </button>
        <button
          onClick={() => setShowUpload(true)}
          className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          Upload Asset
        </button>
      </div>

      {showEdit && (
        <EditProjectModal project={project} onClose={() => setShowEdit(false)} />
      )}
      {showUpload && (
        <UploadModal projectId={project.id} onClose={() => setShowUpload(false)} />
      )}
    </>
  );
}
