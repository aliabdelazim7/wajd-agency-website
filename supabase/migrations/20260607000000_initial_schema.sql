/*
  Initial schema for Wajd Agency website Supabase database.
  Includes tables: profiles, audit_logs, custom_scripts, site_settings,
  hero_content, statistics, testimonials, portfolio, faqs, seo_pages,
  leads, traffic_analytics, preauthorized_admins.
*/

create table if not exists profiles (
  id uuid primary key,
  email text not null unique,
  role text default 'user',
  created_at timestamp with time zone default now()
);

create table if not exists audit_logs (
  id bigserial primary key,
  user_email text not null,
  action text not null,
  details text,
  created_at timestamp with time zone default now()
);

create table if not exists custom_scripts (
  id bigserial primary key,
  name text not null,
  code text not null,
  active boolean default false,
  created_at timestamp with time zone default now()
);

create table if not exists site_settings (
  id integer primary key,
  site_name text,
  contact_email text,
  social_links jsonb,
  created_at timestamp with time zone default now()
);

create table if not exists hero_content (
  id integer primary key,
  title text,
  subtitle text,
  background_image text,
  created_at timestamp with time zone default now()
);

create table if not exists statistics (
  id bigserial primary key,
  label text not null,
  value numeric not null,
  created_at timestamp with time zone default now()
);

create table if not exists testimonials (
  id bigserial primary key,
  name text not null,
  company text,
  testimonial text not null,
  rating integer check (rating >= 1 and rating <= 5),
  created_at timestamp with time zone default now()
);

create table if not exists portfolio (
  id bigserial primary key,
  name text not null,
  slug text not null unique,
  category text,
  challenge text,
  strategy text,
  results_json jsonb,
  image_url text,
  thumbnail_url text,
  alt_text text,
  created_at timestamp with time zone default now()
);

create table if not exists faqs (
  id bigserial primary key,
  question text not null,
  answer text not null,
  order_index integer default 0,
  created_at timestamp with time zone default now()
);

create table if not exists seo_pages (
  id bigserial primary key,
  page text not null unique,
  title text,
  description text,
  keywords text[],
  created_at timestamp with time zone default now()
);

create table if not exists leads (
  id bigserial primary key,
  name text not null,
  email text not null,
  phone text,
  service text,
  status text default 'New',
  description text,
  created_at timestamp with time zone default now()
);

create table if not exists traffic_analytics (
  id bigserial primary key,
  session_id uuid not null,
  page_path text not null,
  referrer text,
  user_agent text,
  duration_seconds integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists preauthorized_admins (
  id bigserial primary key,
  email text not null unique,
  invited_by uuid references profiles(id),
  created_at timestamp with time zone default now()
);

-- Trigger to update updated_at on traffic_analytics rows
create or replace function set_traffic_updated()
returns trigger as $$
begin
  NEW.updated_at := now();
  return NEW;
end;
$$ language plpgsql;

drop trigger if exists traffic_analytics_update on traffic_analytics;
create trigger traffic_analytics_update before update on traffic_analytics
for each row execute function set_traffic_updated();

create table if not exists whatsapp_templates (
  id bigserial primary key,
  title text not null,
  message text not null,
  created_at timestamp with time zone default now()
);
