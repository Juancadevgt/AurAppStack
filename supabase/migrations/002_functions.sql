-- =========================================================
-- Funciones auxiliares
-- =========================================================

-- Incrementa el contador de vistas de una app
create or replace function public.increment_app_views(app_id_param uuid)
returns void as $$
begin
  update public.apps
  set views_count = views_count + 1
  where id = app_id_param;
end;
$$ language plpgsql security definer;

-- Incrementa el contador de compras + actualiza stats del dev
create or replace function public.increment_app_purchases(app_id_param uuid)
returns void as $$
declare
  app_dev_id uuid;
  payout int;
begin
  update public.apps
  set purchases_count = purchases_count + 1
  where id = app_id_param
  returning developer_id into app_dev_id;

  select developer_payout_cents into payout
  from public.purchases
  where app_id = app_id_param
  order by created_at desc
  limit 1;

  update public.developer_profiles
  set
    total_sales_count = total_sales_count + 1,
    total_revenue_cents = total_revenue_cents + coalesce(payout, 0)
  where id = app_dev_id;
end;
$$ language plpgsql security definer;

-- Promueve a un usuario a admin (usar manualmente en SQL Editor)
create or replace function public.promote_to_admin(user_email text)
returns void as $$
begin
  update public.profiles set role = 'admin' where email = user_email;
end;
$$ language plpgsql security definer;
