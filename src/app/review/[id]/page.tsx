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
    // Fallback: check if the ID is a mock ID (a1, a2, etc.) and show a placeholder
    if (params.id.match(/^a\d+$/)) {
      return <MockReviewFallback id={params.id} />;
    }
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

// Temporary fallback for mock asset IDs while DB isn't set up yet
function MockReviewFallback({ id }: { id: string }) {
  const mockAssets: Record<string, { name: string; version: number }> = {
    a1: { name: "CBA_Hero_Edit_v2.mp4", version: 2 },
    a2: { name: "CBA_Hero_Edit_v1.mp4", version: 1 },
    a5: { name: "Atlassian_AR_Interview1.mp4", version: 1 },
    a6: { name: "Nike_Ep3_RoughCut.mp4", version: 1 },
    a7: { name: "RedBull_Highlights_FINAL.mp4", version: 3 },
  };

  const mock = mockAssets[id] || { name: "Unknown Asset", version: 1 };

  return (
    <ReviewClient
      asset={{
        id,
        name: mock.name,
        version: mock.version,
        status: "in-review",
        storage_path: null,
        duration_seconds: 180,
        project_id: "",
      }}
      videoUrl={null}
      projectName={null}
    />
  );
}
