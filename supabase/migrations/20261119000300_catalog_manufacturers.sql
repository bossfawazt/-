-- =============================================================================
-- معمار المنزل — 0003: الكتالوج (خيارات التصميم، الخامات، المنتجات، الأجهزة)
--                   والمصانع وأسعارها والفنيون
-- كل الخيارات قابلة للإضافة والتعديل والإيقاف من لوحة الإدارة.
-- =============================================================================

-- أنماط التصميم والألوان والإضافات
create table public.design_options (
  id uuid primary key default gen_random_uuid(),
  category public.option_category not null,
  key text not null check (key ~ '^[a-z0-9_]{2,48}$'),
  name_ar text not null check (char_length(name_ar) between 1 and 80),
  description_ar text check (char_length(description_ar) <= 400),
  hex_color text check (hex_color is null or hex_color ~ '^#[0-9a-fA-F]{6}$'),
  prompt_hint text check (char_length(prompt_hint) <= 300), -- وصف إنجليزي يُمرر لمزود الذكاء الاصطناعي
  image_path text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category, key)
);
create index design_options_category_idx on public.design_options (category, sort_order) where is_active;
create trigger design_options_updated_at before update on public.design_options
  for each row execute function private.set_updated_at();

-- خامات الخزائن والأسطح والمقابض
create table public.materials (
  id uuid primary key default gen_random_uuid(),
  kind public.material_kind not null,
  key text not null check (key ~ '^[a-z0-9_]{2,48}$'),
  name_ar text not null check (char_length(name_ar) between 1 and 80),
  description_ar text check (char_length(description_ar) <= 400),
  prompt_hint text check (char_length(prompt_hint) <= 300),
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (kind, key)
);
create trigger materials_updated_at before update on public.materials
  for each row execute function private.set_updated_at();

-- وحدات قابلة للتسعير (خزائن سفلية، علوية، أعمدة، إكسسوارات، خدمات)
create table public.products (
  id uuid primary key default gen_random_uuid(),
  kind public.product_kind not null,
  key text not null unique check (key ~ '^[a-z0-9_]{2,48}$'),
  name_ar text not null check (char_length(name_ar) between 1 and 80),
  description_ar text check (char_length(description_ar) <= 400),
  default_pricing_unit public.pricing_unit not null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger products_updated_at before update on public.products
  for each row execute function private.set_updated_at();

create table public.appliances (
  id uuid primary key default gen_random_uuid(),
  key text not null unique check (key ~ '^[a-z0-9_]{2,48}$'),
  name_ar text not null check (char_length(name_ar) between 1 and 80),
  description_ar text check (char_length(description_ar) <= 400),
  prompt_hint text check (char_length(prompt_hint) <= 300),
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger appliances_updated_at before update on public.appliances
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------------
-- المصانع الشريكة
-- ---------------------------------------------------------------------------
create table public.manufacturers (
  id uuid primary key default gen_random_uuid(),
  trade_name text not null check (char_length(trade_name) between 2 and 120),
  legal_name text check (char_length(legal_name) <= 160),
  cr_number text check (cr_number is null or cr_number ~ '^[0-9]{10}$'), -- السجل التجاري
  vat_number text check (vat_number is null or vat_number ~ '^[0-9]{15}$'),
  city text not null default 'الرياض',
  address text check (char_length(address) <= 300),
  phone text check (phone is null or phone ~ '^\+?[0-9]{8,15}$'),
  contact_person text check (char_length(contact_person) <= 120),
  email text check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  kitchen_styles text[] not null default '{}',      -- أنواع المطابخ (مفاتيح design_options)
  material_keys text[] not null default '{}',       -- الخامات التي يعمل بها
  manufacturing_days_min int check (manufacturing_days_min > 0),
  manufacturing_days_max int check (manufacturing_days_max >= manufacturing_days_min),
  warranty_terms text check (char_length(warranty_terms) <= 2000),
  partnership_status public.partnership_status not null default 'prospect',
  commission_rate numeric(5,2) check (commission_rate between 0 and 100), -- null = النسبة الافتراضية
  agreement_reference text,
  is_public boolean not null default false,   -- يظهر في قسم المصانع الشريكة
  is_test_data boolean not null default false, -- بيانات اختبار لا تظهر في الإنتاج
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index manufacturers_status_idx on public.manufacturers (partnership_status);
create trigger manufacturers_updated_at before update on public.manufacturers
  for each row execute function private.set_updated_at();

alter table public.profiles
  add constraint profiles_manufacturer_fk foreign key (manufacturer_id)
  references public.manufacturers (id) on delete set null;
create index profiles_manufacturer_idx on public.profiles (manufacturer_id) where manufacturer_id is not null;

-- أسعار كل مصنع: بند واحد يشير إلى عنصر واحد بالضبط من الكتالوج (أو خدمة باسم حر)
create table public.manufacturer_prices (
  id uuid primary key default gen_random_uuid(),
  manufacturer_id uuid not null references public.manufacturers (id) on delete cascade,
  item_type public.price_item_type not null,
  material_id uuid references public.materials (id) on delete cascade,
  product_id uuid references public.products (id) on delete cascade,
  appliance_id uuid references public.appliances (id) on delete cascade,
  option_id uuid references public.design_options (id) on delete cascade,
  label_ar text check (char_length(label_ar) <= 120),
  pricing_unit public.pricing_unit not null,
  price_min numeric(12,2) not null check (price_min >= 0),
  price_max numeric(12,2) not null check (price_max >= price_min),
  currency text not null default 'SAR' check (currency = 'SAR'),
  is_active boolean not null default true,
  valid_from date not null default current_date,
  valid_to date check (valid_to is null or valid_to >= valid_from),
  is_test_data boolean not null default false,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint manufacturer_prices_one_target check (
    (item_type = 'material'  and material_id  is not null and product_id is null and appliance_id is null and option_id is null) or
    (item_type = 'product'   and product_id   is not null and material_id is null and appliance_id is null and option_id is null) or
    (item_type = 'appliance' and appliance_id is not null and material_id is null and product_id is null and option_id is null) or
    (item_type = 'option'    and option_id    is not null and material_id is null and product_id is null and appliance_id is null) or
    (item_type = 'service'   and label_ar     is not null and material_id is null and product_id is null and appliance_id is null and option_id is null)
  )
);
create index manufacturer_prices_manufacturer_idx on public.manufacturer_prices (manufacturer_id) where is_active;
create index manufacturer_prices_material_idx on public.manufacturer_prices (material_id) where material_id is not null;
create index manufacturer_prices_product_idx on public.manufacturer_prices (product_id) where product_id is not null;
create index manufacturer_prices_appliance_idx on public.manufacturer_prices (appliance_id) where appliance_id is not null;
create index manufacturer_prices_option_idx on public.manufacturer_prices (option_id) where option_id is not null;
create trigger manufacturer_prices_updated_at before update on public.manufacturer_prices
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------------
-- الفنيون
-- ---------------------------------------------------------------------------
create table public.technicians (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles (id) on delete set null, -- حساب الدخول للفني
  full_name text not null check (char_length(full_name) between 2 and 120),
  phone text not null check (phone ~ '^\+?[0-9]{8,15}$'),
  manufacturer_id uuid references public.manufacturers (id) on delete set null,
  service_districts text[] not null default '{}',
  is_active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger technicians_updated_at before update on public.technicians
  for each row execute function private.set_updated_at();

create or replace function private.current_technician_id()
returns uuid
language sql stable security definer
set search_path = ''
as $$
  select t.id from public.technicians t
  join public.profiles p on p.id = t.profile_id
  where t.profile_id = (select auth.uid()) and t.is_active and p.role = 'technician' and p.is_active
$$;
grant execute on function private.current_technician_id() to authenticated, anon, service_role;

-- قائمة عامة آمنة للمصانع الشريكة (الاسم والمدينة فقط) للصفحة الرئيسية
create or replace function public.list_public_manufacturers()
returns table (id uuid, trade_name text, city text)
language sql stable security definer
set search_path = ''
as $$
  select m.id, m.trade_name, m.city
  from public.manufacturers m
  where m.is_public and m.partnership_status = 'active' and not m.is_test_data
  order by m.trade_name
$$;
grant execute on function public.list_public_manufacturers() to anon, authenticated;
