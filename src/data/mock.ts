export interface Lead {
  id: string;
  company: string;
  contact: string;
  email: string;
  stage: "new" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
  value: number;
  source: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  status: "pre-production" | "production" | "post-production" | "delivery" | "complete";
  dueDate: string;
  progress: number;
  producer: string;
  editor: string;
  thumbnail: string;
  deliverableType: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  assignee: string;
  status: "todo" | "in-progress" | "review" | "done";
  dueDate: string;
  phase: string;
}

export interface Asset {
  id: string;
  projectId: string;
  name: string;
  type: "video" | "image" | "audio" | "document";
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  version: number;
  status: "draft" | "in-review" | "approved" | "final";
}

export interface ReviewComment {
  id: string;
  assetId: string;
  author: string;
  authorRole: "producer" | "client" | "editor";
  timecode: string;
  timecodeSec: number;
  text: string;
  resolved: boolean;
  createdAt: string;
}

export const leads: Lead[] = [
  { id: "l1", company: "Nike Australia", contact: "Sarah Chen", email: "sarah@nike.com.au", stage: "negotiation", value: 85000, source: "Referral", createdAt: "2026-02-15" },
  { id: "l2", company: "Atlassian", contact: "James Wright", email: "james.w@atlassian.com", stage: "proposal", value: 120000, source: "Website", createdAt: "2026-02-20" },
  { id: "l3", company: "Canva", contact: "Priya Patel", email: "priya@canva.com", stage: "qualified", value: 45000, source: "LinkedIn", createdAt: "2026-02-28" },
  { id: "l4", company: "Tourism Tasmania", contact: "Mike Douglas", email: "mike@tourism.tas.gov.au", stage: "new", value: 200000, source: "RFP", createdAt: "2026-03-01" },
  { id: "l5", company: "Commonwealth Bank", contact: "Lisa Huang", email: "lisa.huang@cba.com.au", stage: "won", value: 65000, source: "Repeat", createdAt: "2026-01-10" },
  { id: "l6", company: "Spotify APAC", contact: "Tom Reed", email: "tom.reed@spotify.com", stage: "new", value: 90000, source: "Event", createdAt: "2026-03-03" },
  { id: "l7", company: "Red Bull Media", contact: "Anna Kowalski", email: "anna@redbull.com", stage: "qualified", value: 150000, source: "Referral", createdAt: "2026-02-22" },
  { id: "l8", company: "Afterpay", contact: "David Kim", email: "dkim@afterpay.com", stage: "lost", value: 35000, source: "Cold outreach", createdAt: "2026-01-05" },
];

export const projects: Project[] = [
  { id: "p1", name: "Brand Hero Film 2026", client: "Commonwealth Bank", status: "post-production", dueDate: "2026-03-20", progress: 72, producer: "Alex Rivera", editor: "Jordan Lee", thumbnail: "", deliverableType: "Brand Film" },
  { id: "p2", name: "Product Launch — Q2 Campaign", client: "Canva", status: "pre-production", dueDate: "2026-04-15", progress: 15, producer: "Sam Torres", editor: "Unassigned", thumbnail: "", deliverableType: "Social Campaign" },
  { id: "p3", name: "Annual Report Video", client: "Atlassian", status: "production", dueDate: "2026-03-30", progress: 45, producer: "Alex Rivera", editor: "Casey Brooks", thumbnail: "", deliverableType: "Corporate" },
  { id: "p4", name: "Recruitment Series (6 eps)", client: "Nike Australia", status: "post-production", dueDate: "2026-04-01", progress: 60, producer: "Sam Torres", editor: "Jordan Lee", thumbnail: "", deliverableType: "Series" },
  { id: "p5", name: "Event Highlight Reel", client: "Red Bull Media", status: "delivery", dueDate: "2026-03-10", progress: 95, producer: "Alex Rivera", editor: "Casey Brooks", thumbnail: "", deliverableType: "Event" },
];

export const tasks: Task[] = [
  { id: "t1", projectId: "p1", title: "Colour grade final cut", assignee: "Jordan Lee", status: "in-progress", dueDate: "2026-03-12", phase: "Post-Production" },
  { id: "t2", projectId: "p1", title: "Sound design & mix", assignee: "Casey Brooks", status: "todo", dueDate: "2026-03-14", phase: "Post-Production" },
  { id: "t3", projectId: "p1", title: "Client review — Edit v2", assignee: "Alex Rivera", status: "review", dueDate: "2026-03-10", phase: "Post-Production" },
  { id: "t4", projectId: "p1", title: "Motion graphics package", assignee: "Jordan Lee", status: "done", dueDate: "2026-03-05", phase: "Post-Production" },
  { id: "t5", projectId: "p3", title: "Interview shoot — Day 2", assignee: "Sam Torres", status: "in-progress", dueDate: "2026-03-08", phase: "Production" },
  { id: "t6", projectId: "p3", title: "Script review with stakeholders", assignee: "Alex Rivera", status: "done", dueDate: "2026-02-28", phase: "Pre-Production" },
  { id: "t7", projectId: "p4", title: "Edit Episode 3 rough cut", assignee: "Jordan Lee", status: "in-progress", dueDate: "2026-03-11", phase: "Post-Production" },
  { id: "t8", projectId: "p2", title: "Creative brief sign-off", assignee: "Sam Torres", status: "review", dueDate: "2026-03-07", phase: "Pre-Production" },
];

export const assets: Asset[] = [
  { id: "a1", projectId: "p1", name: "CBA_Hero_Edit_v2.mp4", type: "video", size: "1.2 GB", uploadedBy: "Jordan Lee", uploadedAt: "2026-03-06", version: 2, status: "in-review" },
  { id: "a2", projectId: "p1", name: "CBA_Hero_Edit_v1.mp4", type: "video", size: "1.1 GB", uploadedBy: "Jordan Lee", uploadedAt: "2026-03-02", version: 1, status: "approved" },
  { id: "a3", projectId: "p1", name: "Interview_RAW_CEO.mov", type: "video", size: "8.4 GB", uploadedBy: "Casey Brooks", uploadedAt: "2026-02-25", version: 1, status: "final" },
  { id: "a4", projectId: "p1", name: "Brand_Guidelines_2026.pdf", type: "document", size: "4.2 MB", uploadedBy: "Alex Rivera", uploadedAt: "2026-02-10", version: 1, status: "final" },
  { id: "a5", projectId: "p3", name: "Atlassian_AR_Interview1.mp4", type: "video", size: "2.3 GB", uploadedBy: "Casey Brooks", uploadedAt: "2026-03-05", version: 1, status: "draft" },
  { id: "a6", projectId: "p4", name: "Nike_Ep3_RoughCut.mp4", type: "video", size: "890 MB", uploadedBy: "Jordan Lee", uploadedAt: "2026-03-04", version: 1, status: "in-review" },
  { id: "a7", projectId: "p5", name: "RedBull_Highlights_FINAL.mp4", type: "video", size: "650 MB", uploadedBy: "Casey Brooks", uploadedAt: "2026-03-06", version: 3, status: "approved" },
  { id: "a8", projectId: "p1", name: "CBA_Music_License.pdf", type: "document", size: "1.1 MB", uploadedBy: "Alex Rivera", uploadedAt: "2026-02-20", version: 1, status: "final" },
];

export const reviewComments: ReviewComment[] = [
  { id: "rc1", assetId: "a1", author: "Lisa Huang", authorRole: "client", timecode: "00:12", timecodeSec: 12, text: "Love the opening shot — can we hold it 1 second longer before the cut?", resolved: false, createdAt: "2026-03-06T10:15:00" },
  { id: "rc2", assetId: "a1", author: "Alex Rivera", authorRole: "producer", timecode: "00:34", timecodeSec: 34, text: "The logo animation here feels slightly off-brand. Let's match the style guide v3.", resolved: false, createdAt: "2026-03-06T10:22:00" },
  { id: "rc3", assetId: "a1", author: "Lisa Huang", authorRole: "client", timecode: "01:05", timecodeSec: 65, text: "This interview clip is perfect. Great sound bite selection.", resolved: true, createdAt: "2026-03-06T10:30:00" },
  { id: "rc4", assetId: "a1", author: "Jordan Lee", authorRole: "editor", timecode: "00:12", timecodeSec: 12, text: "Noted — I'll extend the hold by 1.5s and add a subtle ease on the transition.", resolved: false, createdAt: "2026-03-06T11:00:00" },
  { id: "rc5", assetId: "a1", author: "Lisa Huang", authorRole: "client", timecode: "01:45", timecodeSec: 105, text: "Can we swap the background music here? Something more upbeat for the product reveal.", resolved: false, createdAt: "2026-03-06T11:15:00" },
  { id: "rc6", assetId: "a1", author: "Alex Rivera", authorRole: "producer", timecode: "02:10", timecodeSec: 130, text: "End card needs the updated CTA — 'Visit cba.com.au/future' instead of the old URL.", resolved: false, createdAt: "2026-03-06T11:20:00" },
  { id: "rc7", assetId: "a1", author: "Lisa Huang", authorRole: "client", timecode: "02:30", timecodeSec: 150, text: "Overall, this is a massive improvement over v1. Almost there!", resolved: true, createdAt: "2026-03-06T11:25:00" },
];

export const stats = {
  activeProjects: 5,
  pendingReviews: 3,
  overdueTask: 1,
  pipelineValue: 755000,
  avgCycleTime: 4.2,
  onTimeDelivery: 94,
  monthlyRevenue: 185000,
  reviewsThisWeek: 7,
};
