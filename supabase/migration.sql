-- ============================================
-- ShotPro VMS Database Schema
-- Run this in the Supabase SQL Editor
-- ============================================

-- 1. PROFILES (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null default 'producer' check (role in ('producer', 'editor', 'client', 'admin')),
  avatar_url text,
  company text,
  created_at timestamptz default now() not null
);

-- 2. PROJECTS
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  client text not null,
  status text not null default 'pre-production' check (status in ('pre-production', 'production', 'post-production', 'delivery', 'complete')),
  due_date date not null,
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  producer_id uuid references public.profiles(id),
  editor_id uuid references public.profiles(id),
  deliverable_type text not null default 'Brand Film',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 3. TASKS
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  assignee_id uuid references public.profiles(id),
  status text not null default 'todo' check (status in ('todo', 'in-progress', 'review', 'done')),
  due_date date not null,
  phase text not null,
  created_at timestamptz default now() not null
);

-- 4. ASSETS
create table public.assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  type text not null check (type in ('video', 'image', 'audio', 'document')),
  size_bytes bigint not null default 0,
  storage_path text,
  uploaded_by uuid references public.profiles(id),
  version integer not null default 1,
  status text not null default 'draft' check (status in ('draft', 'in-review', 'approved', 'final')),
  parent_asset_id uuid references public.assets(id),
  duration_seconds real,
  created_at timestamptz default now() not null
);

-- 5. REVIEW COMMENTS
create table public.review_comments (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets(id) on delete cascade,
  author_id uuid not null references public.profiles(id),
  timecode_seconds real not null,
  text text not null,
  resolved boolean not null default false,
  resolved_by uuid references public.profiles(id),
  resolved_at timestamptz,
  created_at timestamptz default now() not null
);

-- 6. APPROVALS
create table public.approvals (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets(id) on delete cascade,
  approved_by uuid not null references public.profiles(id),
  decision text not null check (decision in ('approved', 'rejected', 'revision-requested')),
  notes text,
  created_at timestamptz default now() not null
);

-- 7. REVIEW LINKS (for client portal without login)
create table public.review_links (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  token text not null unique default encode(gen_random_bytes(32), 'hex'),
  expires_at timestamptz not null,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz default now() not null
);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at on projects
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger projects_updated_at
  before update on public.projects
  for each row execute function update_updated_at();

-- Auto-create profile when a user signs up
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'producer')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.assets enable row level security;
alter table public.review_comments enable row level security;
alter table public.approvals enable row level security;
alter table public.review_links enable row level security;

-- Profiles: anyone authenticated can read; users update their own
create policy "profiles_select" on public.profiles for select to authenticated using (true);
create policy "profiles_update" on public.profiles for update to authenticated using (id = auth.uid());

-- Projects: all authenticated can read; producers/admins can insert/update
create policy "projects_select" on public.projects for select to authenticated using (true);
create policy "projects_insert" on public.projects for insert to authenticated with check (true);
create policy "projects_update" on public.projects for update to authenticated using (true);

-- Tasks: all authenticated can read/write
create policy "tasks_select" on public.tasks for select to authenticated using (true);
create policy "tasks_insert" on public.tasks for insert to authenticated with check (true);
create policy "tasks_update" on public.tasks for update to authenticated using (true);

-- Assets: all authenticated can read/write
create policy "assets_select" on public.assets for select to authenticated using (true);
create policy "assets_insert" on public.assets for insert to authenticated with check (true);
create policy "assets_update" on public.assets for update to authenticated using (true);

-- Review comments: all authenticated can read/write
create policy "comments_select" on public.review_comments for select to authenticated using (true);
create policy "comments_insert" on public.review_comments for insert to authenticated with check (author_id = auth.uid());
create policy "comments_update" on public.review_comments for update to authenticated using (true);

-- Approvals: all authenticated can read/write
create policy "approvals_select" on public.approvals for select to authenticated using (true);
create policy "approvals_insert" on public.approvals for insert to authenticated with check (approved_by = auth.uid());

-- Review links: authenticated can read/write; anon can read valid tokens
create policy "review_links_select" on public.review_links for select to authenticated using (true);
create policy "review_links_insert" on public.review_links for insert to authenticated with check (true);
create policy "review_links_anon_select" on public.review_links for select to anon using (expires_at > now());

-- Anonymous access via review links
create policy "assets_anon_review" on public.assets for select to anon
  using (exists (select 1 from public.review_links where review_links.asset_id = assets.id and review_links.expires_at > now()));

create policy "comments_anon_review" on public.review_comments for select to anon
  using (exists (select 1 from public.review_links rl where rl.asset_id = review_comments.asset_id and rl.expires_at > now()));

-- ============================================
-- STORAGE BUCKETS
-- ============================================

insert into storage.buckets (id, name, public) values ('assets', 'assets', false);
insert into storage.buckets (id, name, public) values ('thumbnails', 'thumbnails', true);

-- Storage policies
create policy "assets_upload" on storage.objects for insert to authenticated with check (bucket_id = 'assets');
create policy "assets_read" on storage.objects for select to authenticated using (bucket_id = 'assets');
create policy "assets_delete" on storage.objects for delete to authenticated using (bucket_id = 'assets');
create policy "thumbnails_read" on storage.objects for select using (bucket_id = 'thumbnails');
create policy "thumbnails_upload" on storage.objects for insert to authenticated with check (bucket_id = 'thumbnails');

-- ============================================
-- ENABLE REALTIME on review_comments
-- ============================================
alter publication supabase_realtime add table public.review_comments;
