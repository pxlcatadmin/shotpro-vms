import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const projectId = formData.get("project_id") as string | null;
  const name = formData.get("name") as string | null;

  if (!file || !projectId) {
    return NextResponse.json({ error: "Missing file or project_id" }, { status: 400 });
  }

  // Determine file type
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  let fileType: "video" | "image" | "audio" | "document" = "document";
  if (["mp4", "mov", "avi", "webm", "mkv", "m4v"].includes(ext)) fileType = "video";
  else if (["jpg", "jpeg", "png", "gif", "webp", "bmp", "tiff"].includes(ext)) fileType = "image";
  else if (["mp3", "wav", "aac", "flac", "ogg", "m4a"].includes(ext)) fileType = "audio";

  // Upload to Supabase Storage
  const storagePath = `${projectId}/${Date.now()}_${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("assets")
    .upload(storagePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  // Create asset record in DB
  const { data: asset, error: dbError } = await supabase
    .from("assets")
    .insert({
      project_id: projectId,
      name: name || file.name,
      type: fileType,
      size_bytes: file.size,
      storage_path: storagePath,
      uploaded_by: user.id,
      version: 1,
      status: "draft",
    })
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ asset }, { status: 201 });
}
