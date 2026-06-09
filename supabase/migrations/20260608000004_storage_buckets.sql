-- Create storage buckets for Wajd Marketing Agency
insert into storage.buckets (id, name, public) 
values ('portfolio_images', 'portfolio_images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public) 
values ('site_assets', 'site_assets', true)
on conflict (id) do nothing;

-- Drop existing storage policies if they exist to avoid duplicates
drop policy if exists "Public Read Access" on storage.objects;
drop policy if exists "Authenticated Upload Access" on storage.objects;
drop policy if exists "Authenticated Delete Access" on storage.objects;
drop policy if exists "Admin Upload Access" on storage.objects;
drop policy if exists "Admin Delete Access" on storage.objects;

-- Create storage policies for media access
create policy "Public Read Access" on storage.objects 
  for select to public using (bucket_id in ('portfolio_images', 'site_assets'));

create policy "Admin Upload Access" on storage.objects 
  for insert to authenticated with check (
    bucket_id in ('portfolio_images', 'site_assets')
    and exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "Admin Delete Access" on storage.objects 
  for delete to authenticated using (
    bucket_id in ('portfolio_images', 'site_assets')
    and exists (
      select 1 from public.profiles 
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );
