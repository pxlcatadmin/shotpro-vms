import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function ClientPortalPage() {
  const supabase = createClient();

  // Fetch active review links
  const { data: reviewLinks } = await supabase
    .from("review_links")
    .select("*, asset:assets!asset_id(name, status), project:projects!project_id(name, client)")
    .order("created_at", { ascending: false })
    .limit(10);

  const links = reviewLinks || [];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Client Portal</h1>
          <p className="text-slate-500 mt-1">
            Manage review links shared with clients
          </p>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 mb-8 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center font-bold text-sm">
            SP
          </div>
          <span className="text-xs text-white/50 tracking-widest uppercase">Client Portal</span>
        </div>
        <h2 className="text-xl font-bold mb-2">Share videos for client review</h2>
        <p className="text-white/60 text-sm max-w-2xl">
          Generate secure, time-limited review links from any asset&apos;s review page. Clients can view videos and leave timecoded comments without needing an account.
        </p>
      </div>

      {/* Active Review Links */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Review Links</h2>
        {links.length > 0 ? (
          <div className="space-y-3">
            {links.map((link: any) => {
              const isExpired = new Date(link.expires_at) < new Date();
              return (
                <div key={link.id} className="flex items-center gap-4 p-4 rounded-lg border border-slate-100 hover:bg-slate-50">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-900">{link.asset?.name || "Unknown Asset"}</div>
                    <div className="text-xs text-slate-500">
                      {link.project?.client || "—"} &middot; {link.project?.name || "—"}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    isExpired ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-700"
                  }`}>
                    {isExpired ? "Expired" : "Active"}
                  </span>
                  <span className="text-xs text-slate-400">
                    Expires {new Date(link.expires_at).toLocaleDateString()}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
            </svg>
            <p className="text-sm text-slate-400 mb-2">No review links created yet</p>
            <p className="text-xs text-slate-400">
              Upload a video, then use &quot;Share Portal Link&quot; from the review page to generate a client link.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
