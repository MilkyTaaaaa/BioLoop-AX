-- Jalankan di Supabase > SQL Editor
create extension if not exists "pgcrypto";

create table if not exists merchants (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  address     text,
  lat         double precision,
  lng         double precision,
  created_at  timestamptz not null default now()
);

create table if not exists submissions (
  id                        uuid primary key default gen_random_uuid(),
  merchant_id               uuid not null references merchants(id) on delete cascade,
  image_path                text not null,
  image_url                 text,
  is_waste_detected         boolean not null default true,
  waste_type                text,            -- used_cooking_oil | coffee_grounds | mixed_organic | other
  estimated_volume_liters   numeric(8,2),
  fill_percentage           integer,
  purity_grade              text,            -- A | B | REJECT
  confidence                numeric(3,2),
  biodiesel_liters          numeric(8,2),
  co2_saved_kg              numeric(8,2),
  cashback_idr              integer,
  ai_notes                  text,
  raw_ai_json               jsonb,
  pickup_requested          boolean not null default false,
  created_at                timestamptz not null default now()
);

create index if not exists idx_submissions_merchant on submissions(merchant_id, created_at desc);

-- Seed 1 merchant demo (hapus/ganti sesuai data lapangan)
insert into merchants (name, address, lat, lng)
values ('Kafe Demo BioLoop', 'Sleman, DIY', -7.7713, 110.3775)
on conflict do nothing;

-- Storage: buat bucket "waste-photos" (Public untuk MVP) lewat Dashboard > Storage
