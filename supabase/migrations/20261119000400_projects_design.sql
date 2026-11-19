-- =============================================================================
-- معمار المنزل — 0004: المشاريع والصور والمقاسات وجلسات التصميم والتصاميم المولدة
-- =============================================================================

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles (id) on delete restrict,
  address_id uuid references public.customer_addresses (id) on delete set null,
  name text not null check (char_length(name) between 2 and 120),
  city text not null default 'الرياض' check (char_length(city) <= 60),
  district text check (char_length(district) <= 80),
  property_type public.property_type not null default 'villa',
  work_type public.kitchen_work_type not null default 'renovation',
  description text check (char_length(description) <= 2000),
  status public.project_status not null default 'draft',
  current_step smallint not null default 1 check (current_step between 1 and 6),
  photo_consent_at timestamptz,  -- موافقة العميل على معالجة صور هذا المشروع
  deleted_at timestamptz,        -- حذف ناعم وفق سياسة الاحتفاظ
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index projects_customer_idx on public.projects (customer_id, created_at desc) where deleted_at is null;
create index projects_status_idx on public.projects (status) where deleted_at is null;
create trigger projects_updated_at before update on public.projects
  for each row execute function private.set_updated_at();

-- صور الغرفة (من العميل) وصور المعاينة (من الفني). الملفات في Storage خاصة.
create table public.room_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  uploaded_by uuid not null references public.profiles (id) on delete restrict,
  appointment_id uuid,  -- يُربط في 0005
  kind public.image_kind not null default 'room',
  bucket text not null check (bucket in ('room-images', 'inspection-images')),
  storage_path text not null unique check (char_length(storage_path) <= 512),
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp')),
  size_bytes int not null check (size_bytes > 0 and size_bytes <= 10485760),
  width int check (width > 0),
  height int check (height > 0),
  sort_order smallint not null default 0,
  created_at timestamptz not null default now()
);
create index room_images_project_idx on public.room_images (project_id, sort_order);

create table public.room_measurements (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  source public.measurement_source not null default 'customer',
  appointment_id uuid,  -- يُربط في 0005
  recorded_by uuid references public.profiles (id) on delete set null,
  kitchen_shape public.kitchen_shape not null default 'straight',
  -- جميع الأطوال بالسنتيمتر
  wall_a_cm numeric(7,1) check (wall_a_cm > 0 and wall_a_cm <= 3000),
  wall_b_cm numeric(7,1) check (wall_b_cm > 0 and wall_b_cm <= 3000),
  wall_c_cm numeric(7,1) check (wall_c_cm > 0 and wall_c_cm <= 3000),
  ceiling_height_cm numeric(6,1) check (ceiling_height_cm between 150 and 800),
  window_sill_height_cm numeric(6,1) check (window_sill_height_cm between 0 and 400),
  -- مواقع العناصر: مصفوفة {wall: "a"|"b"|"c", offset_cm, width_cm, note}
  doors jsonb not null default '[]'::jsonb check (jsonb_typeof(doors) = 'array'),
  windows jsonb not null default '[]'::jsonb check (jsonb_typeof(windows) = 'array'),
  water_points jsonb not null default '[]'::jsonb check (jsonb_typeof(water_points) = 'array'),
  electrical_points jsonb not null default '[]'::jsonb check (jsonb_typeof(electrical_points) = 'array'),
  gas_points jsonb not null default '[]'::jsonb check (jsonb_typeof(gas_points) = 'array'),
  notes text check (char_length(notes) <= 2000),
  is_final boolean not null default false,  -- معتمد من الفني للتصنيع
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint room_measurements_final_by_technician check (not is_final or source = 'technician')
);
-- قياس العميل: سجل واحد لكل مشروع
create unique index room_measurements_customer_one on public.room_measurements (project_id) where source = 'customer';
create index room_measurements_project_idx on public.room_measurements (project_id);
create trigger room_measurements_updated_at before update on public.room_measurements
  for each row execute function private.set_updated_at();

-- جلسة تصميم = مجموعة اختيارات (نسخة). كل تعديل جوهري ينشئ نسخة جديدة.
create table public.design_sessions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  customer_id uuid not null references public.profiles (id) on delete restrict,
  version int not null default 1 check (version > 0),
  is_current boolean not null default true,
  status public.design_status not null default 'draft',
  style_option_id uuid references public.design_options (id) on delete set null,
  color_option_id uuid references public.design_options (id) on delete set null,
  custom_color text check (char_length(custom_color) <= 60),
  cabinet_material_id uuid references public.materials (id) on delete set null,
  countertop_material_id uuid references public.materials (id) on delete set null,
  notes text check (char_length(notes) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, version)
);
create unique index design_sessions_one_current on public.design_sessions (project_id) where is_current;
create trigger design_sessions_updated_at before update on public.design_sessions
  for each row execute function private.set_updated_at();

-- عناصر الجلسة: الأجهزة والإضافات والوحدات المختارة
create table public.design_session_items (
  id uuid primary key default gen_random_uuid(),
  design_session_id uuid not null references public.design_sessions (id) on delete cascade,
  appliance_id uuid references public.appliances (id) on delete cascade,
  option_id uuid references public.design_options (id) on delete cascade,
  product_id uuid references public.products (id) on delete cascade,
  quantity smallint not null default 1 check (quantity between 1 and 50),
  created_at timestamptz not null default now(),
  constraint design_session_items_one_target check (num_nonnulls(appliance_id, option_id, product_id) = 1)
);
create index design_session_items_session_idx on public.design_session_items (design_session_id);

-- الصور المولدة. تُكتب من الخادم فقط بعد التحقق من الصلاحية والحد اليومي.
create table public.generated_designs (
  id uuid primary key default gen_random_uuid(),
  design_session_id uuid not null references public.design_sessions (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  customer_id uuid not null references public.profiles (id) on delete restrict,
  source_image_id uuid references public.room_images (id) on delete set null,
  provider text not null check (char_length(provider) <= 40),
  model text check (char_length(model) <= 80),
  prompt text check (char_length(prompt) <= 4000),
  status public.generation_status not null default 'pending',
  storage_path text check (char_length(storage_path) <= 512),
  error_message text check (char_length(error_message) <= 1000),
  cost_estimate_usd numeric(8,4) check (cost_estimate_usd >= 0),
  duration_ms int check (duration_ms >= 0),
  created_at timestamptz not null default now()
);
create index generated_designs_session_idx on public.generated_designs (design_session_id, created_at desc);
create index generated_designs_customer_day_idx on public.generated_designs (customer_id, created_at desc);
