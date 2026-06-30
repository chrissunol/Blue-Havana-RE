-- Blue Havana Real Estate - Backend V2
-- Ejecutar en Supabase SQL Editor antes de desplegar el backend V2.
-- La migración es idempotente: puede volver a ejecutarse si una parte falló.

begin;

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- =========================================================
-- PROPIEDADES / NEGOCIOS
-- =========================================================
alter table public.properties
  add column if not exists listing_type text not null default 'property';

update public.properties
set listing_type = 'property'
where listing_type is null or listing_type not in ('property', 'business');

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'properties_listing_type_check'
      and conrelid = 'public.properties'::regclass
  ) then
    alter table public.properties
      add constraint properties_listing_type_check
      check (listing_type in ('property', 'business'));
  end if;
end $$;

create index if not exists idx_properties_listing_type
  on public.properties (listing_type);

create index if not exists idx_properties_public_listing
  on public.properties (listing_type, is_published, status, created_at desc);

-- =========================================================
-- INFORMACIÓN DE EMPRESA
-- =========================================================
alter table public.company_information
  add column if not exists telegram text not null default '';

alter table public.company_information
  add column if not exists youtube text not null default '';

-- =========================================================
-- BLOG
-- =========================================================
create table if not exists public.blog_articles (
  id text primary key default gen_random_uuid()::text,
  slug text unique not null,
  title jsonb not null default '{"es":"","en":"","fr":""}'::jsonb,
  excerpt jsonb not null default '{"es":"","en":"","fr":""}'::jsonb,
  content jsonb not null default '{"es":"","en":"","fr":""}'::jsonb,
  category text not null,
  author text not null default '',
  cover_image text not null default 'assets/images/placeholder.svg',
  status text not null default 'draft',
  featured boolean not null default false,
  reading_time integer not null default 5,
  published_at timestamptz,
  created_by text references public.users(id) on delete set null,
  updated_by text references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint blog_articles_category_check
    check (category in ('market', 'renovation', 'investment', 'architecture', 'tips')),
  constraint blog_articles_status_check
    check (status in ('draft', 'published')),
  constraint blog_articles_reading_time_check
    check (reading_time between 1 and 120),
  constraint blog_articles_title_object_check
    check (jsonb_typeof(title) = 'object'),
  constraint blog_articles_excerpt_object_check
    check (jsonb_typeof(excerpt) = 'object'),
  constraint blog_articles_content_object_check
    check (jsonb_typeof(content) = 'object')
);

create index if not exists idx_blog_articles_public
  on public.blog_articles (status, published_at desc, created_at desc);
create index if not exists idx_blog_articles_category
  on public.blog_articles (category);
create index if not exists idx_blog_articles_slug
  on public.blog_articles (slug);
create unique index if not exists idx_blog_articles_single_featured
  on public.blog_articles ((featured)) where featured = true;

drop trigger if exists set_blog_articles_updated_at on public.blog_articles;
create trigger set_blog_articles_updated_at
before update on public.blog_articles
for each row execute function public.set_updated_at();

insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public read blog images" on storage.objects;
create policy "Public read blog images"
on storage.objects for select
to public
using (bucket_id = 'blog-images');

-- =========================================================
-- RESEÑAS
-- =========================================================
create table if not exists public.reviews (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  email text,
  rating smallint not null,
  comment text not null,
  status text not null default 'pending',
  reviewed_by text references public.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reviews_name_length_check
    check (char_length(btrim(name)) between 2 and 80),
  constraint reviews_email_length_check
    check (email is null or char_length(email) <= 120),
  constraint reviews_rating_check
    check (rating between 1 and 5),
  constraint reviews_comment_length_check
    check (char_length(btrim(comment)) between 10 and 600),
  constraint reviews_status_check
    check (status in ('pending', 'approved', 'rejected'))
);

create index if not exists idx_reviews_status_created
  on public.reviews (status, created_at desc);
create index if not exists idx_reviews_rating
  on public.reviews (rating);

drop trigger if exists set_reviews_updated_at on public.reviews;
create trigger set_reviews_updated_at
before update on public.reviews
for each row execute function public.set_updated_at();

-- =========================================================
-- TRANSACCIONES
-- =========================================================
alter table public.property_transactions
  add column if not exists status text not null default 'active';
alter table public.property_transactions
  add column if not exists closed_at timestamptz;
alter table public.property_transactions
  add column if not exists cancelled_at timestamptz;
alter table public.property_transactions
  add column if not exists cancelled_by text references public.users(id) on delete set null;
alter table public.property_transactions
  add column if not exists cancellation_reason text;
alter table public.property_transactions
  add column if not exists updated_at timestamptz not null default now();

update public.property_transactions
set closed_at = coalesce(closed_at, transaction_date, created_at)
where closed_at is null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'property_transactions_status_check'
      and conrelid = 'public.property_transactions'::regclass
  ) then
    alter table public.property_transactions
      add constraint property_transactions_status_check
      check (status in ('active', 'cancelled'));
  end if;
end $$;

create index if not exists idx_property_transactions_status_date
  on public.property_transactions (status, closed_at desc, transaction_date desc);
create index if not exists idx_property_transactions_creator
  on public.property_transactions (created_by);

-- Si la base antigua contiene varias operaciones del mismo inmueble, conserva
-- la más reciente como activa y marca las anteriores como canceladas antes de
-- crear la restricción de una sola operación activa por propiedad.
with ranked_transactions as (
  select
    id,
    row_number() over (
      partition by property_id
      order by coalesce(closed_at, transaction_date, created_at) desc, created_at desc
    ) as row_number
  from public.property_transactions
  where status = 'active' and property_id is not null
)
update public.property_transactions as transaction
set status = 'cancelled',
    cancelled_at = coalesce(transaction.cancelled_at, now()),
    cancellation_reason = coalesce(
      transaction.cancellation_reason,
      'Operación histórica cerrada automáticamente durante la migración V2'
    )
from ranked_transactions
where transaction.id = ranked_transactions.id
  and ranked_transactions.row_number > 1;

create unique index if not exists idx_property_transactions_one_active
  on public.property_transactions (property_id)
  where status = 'active' and property_id is not null;

drop trigger if exists set_property_transactions_updated_at on public.property_transactions;
create trigger set_property_transactions_updated_at
before update on public.property_transactions
for each row execute function public.set_updated_at();

-- Crea la operación y cambia el estado de la propiedad en una sola transacción SQL.
create or replace function public.complete_property_transaction(
  p_property_id text,
  p_transaction_type text,
  p_final_price numeric,
  p_client_name text,
  p_client_phone text,
  p_client_email text,
  p_closed_at timestamptz,
  p_created_by text,
  p_notes text
)
returns public.property_transactions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_property public.properties%rowtype;
  v_transaction public.property_transactions%rowtype;
  v_new_status text;
begin
  if p_transaction_type not in ('sale', 'rent') then
    raise exception 'Invalid transaction type';
  end if;

  select * into v_property
  from public.properties
  where id = p_property_id
  for update;

  if not found then
    raise exception 'Property not found';
  end if;

  if v_property.status <> 'available' then
    raise exception 'Property not available';
  end if;

  if (v_property.operation = 'venta' and p_transaction_type <> 'sale')
     or (v_property.operation = 'renta' and p_transaction_type <> 'rent') then
    raise exception 'Transaction type does not match property operation';
  end if;

  if exists (
    select 1 from public.property_transactions
    where property_id = p_property_id and status = 'active'
  ) then
    raise exception 'Property already has an active transaction';
  end if;

  v_new_status := case when p_transaction_type = 'sale' then 'sold' else 'rented' end;

  insert into public.property_transactions (
    id,
    property_id,
    property_snapshot,
    transaction_type,
    status,
    final_price,
    client_name,
    client_phone,
    client_email,
    transaction_date,
    closed_at,
    created_by,
    notes
  ) values (
    gen_random_uuid()::text,
    p_property_id,
    to_jsonb(v_property),
    p_transaction_type,
    'active',
    coalesce(p_final_price, v_property.price),
    nullif(btrim(p_client_name), ''),
    nullif(btrim(p_client_phone), ''),
    nullif(btrim(p_client_email), ''),
    coalesce(p_closed_at, now()),
    coalesce(p_closed_at, now()),
    p_created_by,
    nullif(btrim(p_notes), '')
  )
  returning * into v_transaction;

  update public.properties
  set status = v_new_status,
      is_published = false,
      updated_at = now()
  where id = p_property_id;

  return v_transaction;
end;
$$;

-- Cancela una operación y restaura la propiedad en una sola transacción SQL.
create or replace function public.cancel_property_transaction(
  p_transaction_id text,
  p_cancelled_by text,
  p_reason text
)
returns public.property_transactions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_transaction public.property_transactions%rowtype;
  v_was_published boolean := false;
begin
  select * into v_transaction
  from public.property_transactions
  where id = p_transaction_id
  for update;

  if not found then
    raise exception 'Transaction not found';
  end if;

  if v_transaction.status = 'cancelled' then
    raise exception 'Transaction already cancelled';
  end if;

  update public.property_transactions
  set status = 'cancelled',
      cancelled_at = now(),
      cancelled_by = p_cancelled_by,
      cancellation_reason = nullif(btrim(p_reason), ''),
      updated_at = now()
  where id = p_transaction_id
  returning * into v_transaction;

  if v_transaction.property_id is not null then
    begin
      v_was_published := coalesce((v_transaction.property_snapshot ->> 'is_published')::boolean, false);
    exception when others then
      v_was_published := false;
    end;

    update public.properties
    set status = 'available',
        is_published = v_was_published,
        updated_at = now()
    where id = v_transaction.property_id;
  end if;

  return v_transaction;
end;
$$;

revoke all on function public.complete_property_transaction(text,text,numeric,text,text,text,timestamptz,text,text)
  from public, anon, authenticated;
revoke all on function public.cancel_property_transaction(text,text,text)
  from public, anon, authenticated;
grant execute on function public.complete_property_transaction(text,text,numeric,text,text,text,timestamptz,text,text)
  to service_role;
grant execute on function public.cancel_property_transaction(text,text,text)
  to service_role;

-- =========================================================
-- SOLICITUDES DE MODIFICACIÓN DE PERFIL
-- =========================================================
create table if not exists public.modification_requests (
  id text primary key default gen_random_uuid()::text,
  user_id text not null references public.users(id) on delete cascade,
  field text not null check (field in ('full_name', 'email', 'username', 'phone')),
  new_value text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'denied')),
  reviewed_by text references public.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint modification_requests_value_length_check
    check (char_length(btrim(new_value)) between 1 and 200)
);

create index if not exists idx_modification_requests_status_created
  on public.modification_requests (status, created_at desc);
create index if not exists idx_modification_requests_user
  on public.modification_requests (user_id);

drop trigger if exists set_modification_requests_updated_at on public.modification_requests;
create trigger set_modification_requests_updated_at
before update on public.modification_requests
for each row execute function public.set_updated_at();

-- =========================================================
-- RLS: todas las tablas se consumen a través de FastAPI.
-- =========================================================
alter table public.users enable row level security;
alter table public.properties enable row level security;
alter table public.property_transactions enable row level security;
alter table public.company_information enable row level security;
alter table public.blog_articles enable row level security;
alter table public.reviews enable row level security;
alter table public.modification_requests enable row level security;

commit;
