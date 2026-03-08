import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import PortalClient from "./PortalClient";

export default async function PortalPage({ params }: { params: { token: string } }) {
  const supabase = createClient();

  // Look up review link by token
  const { data: link, error: linkError } = await supabase
    .from("review_links")
    .select("*, project:projects(name, client)")
    .eq("token", params.token)
    .single();

  if (linkError || !link) {
    notFound();
  }

  // Check expiry
  if (new Date(link.expires_at) < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Link Expired</h1>
          <p className="text-slate-500 text-sm">This review link has expired. Please contact the producer for a new link.</p>
        </div>
      </div>
    );
  }

  // Fetch asset
  const { data: asset, error: assetError } = await supabase
    .from("assets")
    .select("*")
    .eq("id", link.asset_id)
    .single();

  if (assetError || !asset) {
    notFound();
  }

  // Get signed video URL
  let videoUrl: string | null = null;
  if (asset.storage_path) {
    const { data: signedData } = await supabase.storage
      .from("assets")
      .createSignedUrl(asset.storage_path, 3600);
    videoUrl = signedData?.signedUrl || null;
  }

  return (
    <PortalClient
      asset={{
        id: asset.id,
        name: asset.name,
        version: asset.version,
        status: asset.status,
        duration_seconds: asset.duration_seconds,
      }}
      projectName={link.project?.name || "Project"}
      clientName={link.project?.client || "Client"}
      videoUrl={videoUrl}
      token={params.token}
    />
  );
}
