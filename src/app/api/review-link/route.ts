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

  const body = await request.json();
  const { asset_id, project_id, expires_hours = 72 } = body;

  if (!asset_id || !project_id) {
    return NextResponse.json({ error: "Missing asset_id or project_id" }, { status: 400 });
  }

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expires_hours);

  const { data: link, error } = await supabase
    .from("review_links")
    .insert({
      asset_id,
      project_id,
      expires_at: expiresAt.toISOString(),
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const reviewUrl = `${new URL(request.url).origin}/portal/${link.token}`;

  return NextResponse.json({ link, reviewUrl }, { status: 201 });
}
