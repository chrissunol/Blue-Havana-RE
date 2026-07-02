-- Migración segura: company info en base de datos + filtros de propiedad.
-- Ejecuta este archivo en Supabase SQL Editor si ya tienes tablas creadas.

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

alter table public.properties add column if not exists property_type text not null default '';
alter table public.properties add column if not exists location text not null default '';
alter table public.properties add column if not exists amenities jsonb not null default '{}'::jsonb;

create index if not exists idx_properties_property_type on public.properties (property_type);
create index if not exists idx_properties_location on public.properties (location);
create index if not exists idx_properties_amenities on public.properties using gin (amenities);

-- Opcional: normalizar valores antiguos que no quieres usar en el filtro público.
-- Actualiza manualmente cualquier propiedad vieja para que property_type sea exactamente:
-- Casa, Apartamento o Estudio.
