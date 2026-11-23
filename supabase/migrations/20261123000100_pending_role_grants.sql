-- =============================================================================
-- معمار المنزل — 0010: منح أدوار مسبقة برقم الجوال
-- يسمح للمدير بتحديد دور (مثلاً admin) لرقم جوال قبل أن يسجل صاحبه أول دخول.
-- الجدول في المخطط private فلا يصل إليه أحد عبر الواجهة العامة.
-- الأرقام تُضاف من SQL Editor فقط ولا تُحفظ في المستودع.
-- =============================================================================

create table private.pending_role_grants (
  phone text primary key check (phone ~ '^9665[0-9]{8}$'),  -- صيغة Supabase: بدون +
  role public.app_role not null,
  note text,
  created_at timestamptz not null default now(),
  consumed_at timestamptz
);
revoke all on private.pending_role_grants from public, anon, authenticated;

-- يطبّق المنح المسبق عند إنشاء المستخدم. الافتراضي يبقى customer لأي رقم آخر.
create or replace function private.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
declare
  v_phone text := nullif(regexp_replace(coalesce(new.phone, ''), '[^0-9]', '', 'g'), '');
  v_role public.app_role := 'customer';
begin
  if v_phone is not null then
    update private.pending_role_grants g
       set consumed_at = now()
     where g.phone = v_phone and g.consumed_at is null
    returning g.role into v_role;
    v_role := coalesce(v_role, 'customer');
  end if;

  insert into public.profiles (id, phone, email, full_name, role)
  values (
    new.id,
    nullif(new.phone, ''),
    nullif(new.email, ''),
    nullif(left(new.raw_user_meta_data ->> 'full_name', 120), ''),
    v_role
  )
  on conflict (id) do nothing;

  if v_role <> 'customer' then
    insert into public.activity_logs (actor_id, actor_role, action, entity_type, entity_id, metadata)
    values (new.id, v_role, 'role.granted_on_signup', 'profile', new.id, jsonb_build_object('role', v_role));
  end if;
  return new;
end;
$$;
