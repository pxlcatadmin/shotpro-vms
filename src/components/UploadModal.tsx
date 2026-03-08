"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface UploadModalProps {
  projectId: string;
  onClose: () => void;
}

export default function UploadModal({ projectId, onClose }: UploadModalProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setName(f.name);
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) {
      setFile(f);
      setName(f.name);
      setError(null);
    }
  };

  const getFileType = (fileName: string): "video" | "image" | "audio" | "document" => {
    const ext = fileName.split(".").pop()?.toLowerCase() || "";
    if (["mp4", "mov", "avi", "webm", "mkv", "m4v"].includes(ext)) return "video";
    if (["jpg", "jpeg", "png", "gif", "webp", "bmp", "tiff"].includes(ext)) return "image";
    if (["mp3", "wav", "aac", "flac", "ogg", "m4a"].includes(ext)) return "audio";
    return "document";
  };

  const handleUpload = async () => {
    if (!file) return;

    const supabase = createClient();
    setUploading(true);
    setError(null);
    setProgress(10);

    let storagePath = "";

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("You need to be logged in to upload files");
      }

      setProgress(20);

      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      storagePath = `${projectId}/${Date.now()}_${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("assets")
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || undefined,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      setProgress(75);

      const { data: asset, error: dbError } = await supabase
        .from("assets")
        .insert({
          project_id: projectId,
          name: name || file.name,
          type: getFileType(file.name),
          size_bytes: file.size,
          storage_path: storagePath,
          uploaded_by: user.id,
          version: 1,
          status: "draft",
        })
        .select("id")
        .single();

      if (dbError || !asset) {
        await supabase.storage.from("assets").remove([storagePath]);
        throw new Error(dbError?.message || "Failed to create asset record");
      }

      setProgress(100);

      setTimeout(() => {
        router.push(`/review/${asset.id}`);
        router.refresh();
        onClose();
      }, 400);
    } catch (err: any) {
      setError(err?.message || "Upload failed");
      setUploading(false);
      setProgress(0);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Upload Asset</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {!file ? (
            <div
              className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50/30 transition-colors"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <svg className="w-12 h-12 text-slate-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <p className="text-sm font-medium text-slate-700">Drop a file here or click to browse</p>
              <p className="text-xs text-slate-500 mt-1">Video, image, audio, or document</p>
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                accept="video/*,image/*,audio/*,.pdf,.doc,.docx"
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                  <p className="text-xs text-slate-500">{formatSize(file.size)}</p>
                </div>
                {!uploading && (
                  <button
                    onClick={() => {
                      setFile(null);
                      setName("");
                    }}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Display name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
                  disabled={uploading}
                />
              </div>

              {uploading && (
                <div className="space-y-1">
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-600 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 text-center">
                    {progress < 100 ? "Uploading..." : "Complete!"}
                  </p>
                </div>
              )}

              {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="bg-brand-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? "Uploading..." : "Upload & Review"}
          </button>
        </div>
      </div>
    </div>
  );
}
