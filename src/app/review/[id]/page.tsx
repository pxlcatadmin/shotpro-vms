import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ReviewClient from "./ReviewClient";

export default async function ReviewPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  // Fetch asset
  const { data: asset, error } = await supabase
    .from("assets")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !asset) {
    notFound();
  }

  // Get project name
  let projectName: string | null = null;
  if (asset.project_id) {
    const { data: project } = await supabase
      .from("projects")
      .select("name")
      .eq("id", asset.project_id)
      .single();
    projectName = project?.name || null;
  }

  // Generate signed URL for video
  let videoUrl: string | null = null;
  if (asset.storage_path) {
    const { data: signedData } = await supabase.storage
      .from("assets")
      .createSignedUrl(asset.storage_path, 3600); // 1 hour
    videoUrl = signedData?.signedUrl || null;
  }

  return (
    <ReviewClient
      asset={{
        id: asset.id,
        name: asset.name,
        version: asset.version,
        status: asset.status,
        storage_path: asset.storage_path,
        duration_seconds: asset.duration_seconds,
        project_id: asset.project_id,
      }}
      videoUrl={videoUrl}
      projectName={projectName}
    />
  );
}
