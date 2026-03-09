"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface ShareLinkButtonProps {
  assetId: string;
  projectId: string;
  className?: string;
  label?: string;
}

export default function ShareLinkButton({ assetId, projectId, className, label = "Share Link" }: ShareLinkButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [reviewUrl, setReviewUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/review-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ asset_id: assetId, project_id: projectId, expires_hours: 72 }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create review link");
      }

      setReviewUrl(data.reviewUrl);
    } catch (err: any) {
      setError(err.message || "Failed to generate link");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!reviewUrl) return;
    await navigator.clipboard.writeText(reviewUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        onClick={() => {
          setShowModal(true);
          handleGenerate();
        }}
        className={className || "bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"}
      >
        {label}
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Share Review Link</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {generating ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full mx-auto mb-3" />
                  <p className="text-sm text-slate-500">Generating review link...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-sm text-red-600 mb-3">{error}</p>
                  <button
                    onClick={handleGenerate}
                    className="text-sm text-brand-600 font-medium hover:text-brand-700"
                  >
                    Try Again
                  </button>
                </div>
              ) : reviewUrl ? (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600">
                    Share this link with your client. It expires in 72 hours.
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={reviewUrl}
                      readOnly
                      className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-700"
                    />
                    <button
                      onClick={handleCopy}
                      className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors whitespace-nowrap"
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <p className="text-xs text-slate-400">
                    Clients can view the video and leave timecoded comments without needing an account.
                  </p>
                </div>
              ) : null}
            </div>

            <div className="flex items-center justify-end p-6 border-t border-slate-200">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
