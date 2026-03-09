"use client";

import { useState } from "react";
import AddTaskModal from "./AddTaskModal";

export default function AddTaskButton({ projectId }: { projectId: string }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-sm text-brand-600 font-medium hover:text-brand-700"
      >
        + Add Task
      </button>
      {showModal && (
        <AddTaskModal projectId={projectId} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
