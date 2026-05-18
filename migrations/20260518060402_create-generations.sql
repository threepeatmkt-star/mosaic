-- generations: records of AI image/video generation jobs per user
create table public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  style text not null check (style in ('baseball', 'idol', 'showme', 'street')),
  prompt text not null,
  source_filename text,
  generated_image_url text,
  generated_image_key text,
  generated_video_url text,
  generated_video_key text,
  status text not null default 'pending' check (status in ('pending', 'generating_image', 'image_ready', 'generating_video', 'completed', 'failed')),
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index generations_user_id_created_at_idx on public.generations (user_id, created_at desc);

alter table public.generations enable row level security;

create policy "Users can read their own generations"
on public.generations for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own generations"
on public.generations for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own generations"
on public.generations for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create trigger generations_set_updated_at
  before update on public.generations
  for each row execute function public.set_updated_at();
