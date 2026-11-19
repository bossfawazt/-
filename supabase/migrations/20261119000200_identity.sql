-- =============================================================================
-- معمار المنزل — 0002: الهوية والمستخدمون والإعدادات والإشعارات وسجل العمليات
-- =============================================================================

-- ---------------------------------------------------------------------------
-- profiles (= جدول users في المتطلبات)
-- يرتبط واحد لواحد مع auth.users. الدور لا يحدده المستخدم أبداً.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text check (char_length(full_name) <= 120),
  phone text unique check (phone ~ '^\+?[0-9]{8,15}$'),
  email text check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  city text not null default 'الرياض' check (char_length(city) <= 60),
  role public.app_role not null default 'customer',
  manufacturer_id uuid,                       -- يُربط لاحقاً (0003) لمستخدمي المصانع
  is_active boolean not null default true,
  data_processing_consent_at timestamptz,     -- موافقة معالجة الصور والبيانات
  marketing_consent boolean not null default false, -- موافقة مستقلة للتسويق
  ai_training_consent boolean not null default false, -- موافقة مستقلة (افتراضياً: لا)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index profiles_role_idx on public.profiles (role);
create trigger profiles_updated_at before update on public.profiles
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------------
-- دوال الصلاحيات (security definer لتجنب التكرار اللانهائي في RLS)
-- ---------------------------------------------------------------------------
create or replace function private.current_app_role()
returns public.app_role
language sql stable security definer
set search_path = ''
as $$
  select p.role from public.profiles p
  where p.id = (select auth.uid()) and p.is_active
$$;

create or replace function private.has_role(roles public.app_role[])
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select coalesce(private.current_app_role() = any (roles), false)
$$;

-- الإدارة والدعم: صلاحيات تشغيلية على البيانات
create or replace function private.is_staff()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select private.has_role(array['admin','support']::public.app_role[])
$$;

create or replace function private.is_admin()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select private.has_role(array['admin']::public.app_role[])
$$;

-- المالية: الإدارة والمحاسب
create or replace function private.is_finance()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select private.has_role(array['admin','accountant']::public.app_role[])
$$;

create or replace function private.current_manufacturer_id()
returns uuid
language sql stable security definer
set search_path = ''
as $$
  select p.manufacturer_id from public.profiles p
  where p.id = (select auth.uid()) and p.is_active and p.role = 'manufacturer'
$$;

grant execute on all functions in schema private to authenticated, anon, service_role;

-- ---------------------------------------------------------------------------
-- حماية عمود الدور: المستخدم يعدل بياناته الأساسية فقط
-- ---------------------------------------------------------------------------
create or replace function private.guard_profile_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- المستخدمون عبر الواجهة (anon/authenticated) لا يغيرون الدور والربط والتفعيل إلا المدير.
  -- الخادم (service_role) ولوحة Supabase (postgres) غير مقيدين.
  if current_user in ('authenticated', 'anon') and not private.is_admin() then
    if new.role is distinct from old.role
       or new.manufacturer_id is distinct from old.manufacturer_id
       or new.is_active is distinct from old.is_active
       or new.phone is distinct from old.phone then
      raise exception 'غير مسموح بتعديل الدور أو الحالة أو رقم الجوال' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;
create trigger profiles_guard before update on public.profiles
  for each row execute function private.guard_profile_update();

-- إنشاء الملف الشخصي تلقائياً عند التسجيل. الدور دائماً customer.
create or replace function private.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, phone, email, full_name)
  values (
    new.id,
    nullif(new.phone, ''),
    nullif(new.email, ''),
    nullif(left(new.raw_user_meta_data ->> 'full_name', 120), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- ---------------------------------------------------------------------------
-- عناوين العملاء
-- ---------------------------------------------------------------------------
create table public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  label text not null default 'المنزل' check (char_length(label) <= 40),
  city text not null default 'الرياض' check (char_length(city) <= 60),
  district text not null check (char_length(district) between 2 and 80),
  street text check (char_length(street) <= 120),
  details text check (char_length(details) <= 300),
  latitude numeric(9,6) check (latitude between -90 and 90),
  longitude numeric(9,6) check (longitude between -180 and 180),
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index customer_addresses_user_idx on public.customer_addresses (user_id);
create unique index customer_addresses_one_default on public.customer_addresses (user_id) where is_default;
create trigger customer_addresses_updated_at before update on public.customer_addresses
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------------
-- إعدادات التطبيق (العمولة الافتراضية، الضريبة، حدود الذكاء الاصطناعي...)
-- ---------------------------------------------------------------------------
create table public.app_settings (
  key text primary key check (key ~ '^[a-z0-9_]{2,64}$'),
  value jsonb not null,
  description text,
  is_public boolean not null default false,  -- قابلة للقراءة من الواجهة العامة
  updated_by uuid references public.profiles (id) on delete set null,
  updated_at timestamptz not null default now()
);
create trigger app_settings_updated_at before update on public.app_settings
  for each row execute function private.set_updated_at();

insert into public.app_settings (key, value, description, is_public) values
  ('default_commission_rate', '12'::jsonb, 'نسبة عمولة المنصة الافتراضية (%)', false),
  ('vat_rate', '15'::jsonb, 'نسبة ضريبة القيمة المضافة (%)', true),
  ('launch_cities', '["الرياض"]'::jsonb, 'المدن المتاحة حالياً', true),
  ('ai_daily_generation_limit', '10'::jsonb, 'الحد اليومي لتوليد التصاميم لكل عميل', false),
  ('ai_monthly_budget_sar', '500'::jsonb, 'سقف تكلفة الذكاء الاصطناعي الشهري (ريال)', false),
  ('quotation_validity_days', '14'::jsonb, 'مدة صلاحية عرض السعر الافتراضية (يوم)', false);

-- ---------------------------------------------------------------------------
-- الإشعارات (داخل المنصة؛ القنوات الخارجية لاحقاً)
-- ---------------------------------------------------------------------------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null check (char_length(type) <= 64),
  title text not null check (char_length(title) <= 160),
  body text check (char_length(body) <= 1000),
  link text check (link is null or link ~ '^/'),   -- روابط داخلية فقط
  entity_type text,
  entity_id uuid,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_user_unread_idx on public.notifications (user_id, created_at desc) where read_at is null;
create index notifications_user_idx on public.notifications (user_id, created_at desc);

-- سجل محاولات الإرسال عبر قنوات خارجية (SMS / WhatsApp / Email) عند ربطها لاحقاً
create table public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  notification_id uuid not null references public.notifications (id) on delete cascade,
  channel text not null check (channel in ('sms', 'whatsapp', 'email')),
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed', 'skipped_not_configured')),
  provider text,
  provider_reference text,
  error text,
  created_at timestamptz not null default now()
);
create index notification_deliveries_notification_idx on public.notification_deliveries (notification_id);

-- ---------------------------------------------------------------------------
-- سجل العمليات (Audit / Activity log) — إضافة فقط
-- ---------------------------------------------------------------------------
create table public.activity_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles (id) on delete set null,
  actor_role public.app_role,
  action text not null check (char_length(action) <= 80),
  entity_type text not null check (char_length(entity_type) <= 64),
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index activity_logs_entity_idx on public.activity_logs (entity_type, entity_id);
create index activity_logs_actor_idx on public.activity_logs (actor_id, created_at desc);
create index activity_logs_created_idx on public.activity_logs (created_at desc);

-- تسجيل عملية من أي مكان (الخادم أو المشغلات) دون منح صلاحية كتابة مباشرة
create or replace function public.log_activity(
  p_action text, p_entity_type text, p_entity_id uuid, p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql security definer
set search_path = ''
as $$
begin
  insert into public.activity_logs (actor_id, actor_role, action, entity_type, entity_id, metadata)
  values ((select auth.uid()), private.current_app_role(), p_action, p_entity_type, p_entity_id,
          coalesce(p_metadata, '{}'::jsonb));
end;
$$;
-- يُستدعى من الخادم (service_role) أو من مشغلات security definer فقط
revoke execute on function public.log_activity(text, text, uuid, jsonb) from public, anon, authenticated;
grant execute on function public.log_activity(text, text, uuid, jsonb) to service_role;
