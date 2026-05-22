-- =========================================================
-- Fix: handle_new_user lee el role del raw_user_meta_data
-- Ejecuta este SQL en Supabase SQL Editor
-- =========================================================

create or replace function public.handle_new_user()
returns trigger as $$
declare
  user_role text;
begin
  user_role := coalesce(new.raw_user_meta_data->>'role', 'buyer');

  insert into public.profiles (id, email, full_name, avatar_url, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    user_role::user_role
  );

  -- Si es developer, crear automáticamente su developer_profile
  if user_role = 'developer' then
    insert into public.developer_profiles (id)
    values (new.id)
    on conflict (id) do nothing;
  end if;

  return new;
end;
$$ language plpgsql security definer;
