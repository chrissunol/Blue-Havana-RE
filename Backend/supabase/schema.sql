-- Blue Havana Real Estate - Supabase schema
-- Ejecuta este archivo completo en Supabase SQL Editor.
-- El backend usa SUPABASE_SERVICE_ROLE_KEY solo en servidor. Nunca pongas esa llave en Angular.

create extension if not exists "pgcrypto";

create table if not exists public.users (
  id text primary key,
  email text unique not null,
  full_name text not null,
  username text,
  phone text not null default '',
  hashed_password text not null,
  role text not null check (role in ('admin', 'superadmin')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- Migraciones seguras para usuarios si la tabla ya existía.
alter table public.users add column if not exists username text;
alter table public.users add column if not exists phone text not null default '';
create unique index if not exists idx_users_username_unique
on public.users (lower(username))
where username is not null and username <> '';

create table if not exists public.properties (
  id text primary key,
  code text unique not null,
  title text not null,
  description text not null default '',
  operation text not null check (operation in ('venta', 'renta')),
  price numeric not null check (price >= 0),
  property_type text not null default '',
  bedrooms integer not null default 0,
  bathrooms numeric not null default 0,
  area_m2 numeric,
  lot_size_m2 numeric,
  floors integer,
  location text not null default '',
  address text,
  city text,
  state text,
  amenities jsonb not null default '{}'::jsonb,
  images jsonb not null default '[]'::jsonb,
  is_published boolean not null default false,
  featured boolean not null default false,
  status text not null default 'available' check (status in ('available', 'sold', 'rented')),
  created_by text references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Migraciones seguras si ya habías creado la tabla antes.
alter table public.properties add column if not exists status text not null default 'available';
alter table public.properties add column if not exists property_type text not null default '';
alter table public.properties add column if not exists location text not null default '';
alter table public.properties add column if not exists featured boolean not null default false;
alter table public.properties add column if not exists is_published boolean not null default false;
alter table public.properties add column if not exists amenities jsonb not null default '{}'::jsonb;
alter table public.properties add column if not exists images jsonb not null default '[]'::jsonb;
alter table public.properties add column if not exists created_by text references public.users(id) on delete set null;

create table if not exists public.property_transactions (
  id text primary key,
  property_id text references public.properties(id) on delete set null,
  property_snapshot jsonb not null default '{}'::jsonb,
  transaction_type text not null check (transaction_type in ('sale', 'rent')),
  final_price numeric,
  client_name text,
  client_phone text,
  client_email text,
  transaction_date timestamptz not null default now(),
  created_by text references public.users(id) on delete set null,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.company_information (
  id text primary key default 'main',
  phone text not null default '',
  whatsapp text not null default '',
  email text not null default '',
  address text not null default '',
  facebook text not null default '',
  instagram text not null default '',
  x text not null default '',
  origin_text text not null default '',
  today_text text not null default '',
  future_text text not null default '',
  where_text text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.company_information (
  id, phone, whatsapp, email, address, facebook, instagram, x,
  origin_text, today_text, future_text, where_text
)
values (
  'main',
  '+53 00000000',
  '+5352627046',
  'bluehavanars@gmail.com',
  'La Habana, Cuba',
  '@bluehavanars',
  '@bluehavanars',
  '@bluehavanars',
  'Blue Havana Real Estate transforma el mercado inmobiliario cubano con estándares internacionales de transparencia, eficiencia y excelencia.',
  'Brindar soluciones inmobiliarias integrales y de alto nivel.',
  'Ser la empresa inmobiliaria líder y referente en Cuba.',
  'Operamos principalmente en La Habana y sus zonas más exclusivas.'
)
on conflict (id) do nothing;

create index if not exists idx_properties_public on public.properties (is_published, status, created_at desc);
create index if not exists idx_properties_operation on public.properties (operation);
create index if not exists idx_properties_property_type on public.properties (property_type);
create index if not exists idx_properties_location on public.properties (location);
create index if not exists idx_properties_amenities on public.properties using gin (amenities);
create index if not exists idx_properties_price on public.properties (price);
create index if not exists idx_properties_city on public.properties (city);
create index if not exists idx_properties_featured on public.properties (featured);
create index if not exists idx_property_transactions_property on public.property_transactions (property_id);
create index if not exists idx_property_transactions_date on public.property_transactions (transaction_date desc);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_users_updated_at on public.users;
create trigger set_users_updated_at
before update on public.users
for each row execute function public.set_updated_at();

drop trigger if exists set_properties_updated_at on public.properties;
create trigger set_properties_updated_at
before update on public.properties
for each row execute function public.set_updated_at();

drop trigger if exists set_company_information_updated_at on public.company_information;
create trigger set_company_information_updated_at
before update on public.company_information
for each row execute function public.set_updated_at();

-- Storage público para fotos de propiedades.
insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public read property images" on storage.objects;
create policy "Public read property images"
on storage.objects for select
to public
using (bucket_id = 'property-images');
