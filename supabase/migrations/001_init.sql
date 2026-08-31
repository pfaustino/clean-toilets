-- Lurker's Clean Toilets v1 schema
create type fee_status as enum ('free', 'paid', 'unknown');
create type toilet_source as enum ('osm', 'user');

create table toilets (
  id uuid primary key default gen_random_uuid(),
  osm_id text unique,
  source toilet_source not null,
  name text not null,
  lat double precision not null,
  lng double precision not null,
  address text,
  fee fee_status not null default 'unknown',
  cleanliness_avg numeric(3, 2),
  rating_count integer not null default 0,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

create table ratings (
  id uuid primary key default gen_random_uuid(),
  toilet_id uuid not null references toilets (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  cleanliness integer not null check (cleanliness between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (toilet_id, user_id)
);

create index toilets_lat_lng_idx on toilets (lat, lng);
create index ratings_toilet_id_idx on ratings (toilet_id);

create or replace function refresh_toilet_rating_stats()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  tid uuid;
begin
  tid := coalesce(new.toilet_id, old.toilet_id);
  update toilets
  set
    cleanliness_avg = (
      select round(avg(cleanliness)::numeric, 2)
      from ratings
      where toilet_id = tid
    ),
    rating_count = (
      select count(*)::integer
      from ratings
      where toilet_id = tid
    )
  where id = tid;
  return null;
end;
$$;

create trigger ratings_stats
after insert or update or delete on ratings
for each row execute function refresh_toilet_rating_stats();

alter table toilets enable row level security;
alter table ratings enable row level security;

create policy "toilets_select_public"
  on toilets for select
  using (true);

create policy "toilets_insert_own"
  on toilets for insert
  to authenticated
  with check (auth.uid() = created_by);

create policy "ratings_select_public"
  on ratings for select
  using (true);

create policy "ratings_insert_own"
  on ratings for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "ratings_update_own"
  on ratings for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "ratings_delete_own"
  on ratings for delete
  to authenticated
  using (auth.uid() = user_id);
