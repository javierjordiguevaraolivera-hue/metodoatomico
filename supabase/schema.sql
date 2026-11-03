-- Método Atómico: compradores, pedidos y archivos descargables.
-- Se puede correr más de una vez (no borra ni pisa datos).
-- Todo el acceso es desde el servidor con la llave service_role: RLS activado y sin políticas públicas.

create table if not exists public.customers (
  email       text primary key check (email = lower(email)),
  first_name  text,
  last_name   text,
  country     text,
  created_at  timestamptz not null default now()
);

create table if not exists public.orders (
  payment_id       text primary key,                 -- id del pago en dLocal Go (DP-…)
  email            text not null references public.customers(email) on update cascade,
  order_id         text,                             -- nuestro id de pedido (también va a Meta/TikTok)
  amount           numeric(12, 2),
  currency         text,
  country          text,
  status           text not null check (status in ('paid', 'refunded', 'chargeback')),
  paid_at          timestamptz,
  welcome_sent_at  timestamptz,                      -- cuándo se mandó el correo de bienvenida (evita duplicados)
  created_at       timestamptz not null default now()
);
create index if not exists orders_email_idx on public.orders (email);

-- Cada ingreso a /acceso: sirve para ver si un correo se está compartiendo.
create table if not exists public.access_logins (
  id          bigint generated always as identity primary key,
  email       text not null,
  ip          text,
  user_agent  text,
  country     text,
  created_at  timestamptz not null default now()
);
create index if not exists access_logins_email_idx on public.access_logins (email, created_at desc);

alter table public.customers     enable row level security;
alter table public.orders        enable row level security;
alter table public.access_logins enable row level security;
revoke all on public.customers, public.orders, public.access_logins from anon, authenticated;

-- Archivos descargables: bucket privado (los links de descarga se firman y vencen en minutos).
insert into storage.buckets (id, name, public)
values ('descargas', 'descargas', false)
on conflict (id) do nothing;
