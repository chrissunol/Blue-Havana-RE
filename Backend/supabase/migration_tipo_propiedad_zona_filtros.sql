-- Migración segura para guardar y filtrar tipo de propiedad y zona/municipio.
-- Ejecutar en Supabase SQL Editor si ya tienes la tabla properties creada.

alter table public.properties add column if not exists property_type text not null default '';
alter table public.properties add column if not exists location text not null default '';
alter table public.properties add column if not exists amenities jsonb not null default '{}'::jsonb;

create index if not exists idx_properties_property_type on public.properties (property_type);
create index if not exists idx_properties_location on public.properties (location);
create index if not exists idx_properties_amenities on public.properties using gin (amenities);
