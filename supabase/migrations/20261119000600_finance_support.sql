-- =============================================================================
-- معمار المنزل — 0006: المدفوعات، العمولات، التسويات، الفواتير، الضمانات، الشكاوى، التواصل
-- المنصة لا تحتفظ بأموال العملاء ولا تخزن بيانات البطاقات. المدفوعات هنا سجلات فقط
-- (دفع مباشر للمصنع حالياً)، وجاهزة لربط مزود دفع مرخص لاحقاً.
-- =============================================================================

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete restrict,
  customer_id uuid not null references public.profiles (id) on delete restrict,
  payee public.payment_payee not null default 'manufacturer',
  amount numeric(12,2) not null check (amount > 0),
  currency text not null default 'SAR' check (currency = 'SAR'),
  method text not null check (method in ('bank_transfer', 'direct_to_manufacturer', 'payment_gateway', 'cash', 'other')),
  provider text,                -- اسم مزود الدفع عند الربط
  provider_reference text,      -- مرجع العملية لدى المزود (لا بيانات بطاقات)
  status public.payment_status not null default 'pending',
  paid_at timestamptz,
  recorded_by uuid references public.profiles (id) on delete set null,
  notes text check (char_length(notes) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index payments_order_idx on public.payments (order_id);
create unique index payments_provider_ref_unique on public.payments (provider, provider_reference)
  where provider_reference is not null;
create trigger payments_updated_at before update on public.payments
  for each row execute function private.set_updated_at();

create table public.settlements (
  id uuid primary key default gen_random_uuid(),
  manufacturer_id uuid not null references public.manufacturers (id) on delete restrict,
  period_start date not null,
  period_end date not null check (period_end >= period_start),
  total_order_value numeric(14,2) not null default 0,
  total_commission numeric(14,2) not null default 0,
  status public.settlement_status not null default 'open',
  settled_at timestamptz,
  reference text,
  notes text check (char_length(notes) <= 1000),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index settlements_manufacturer_idx on public.settlements (manufacturer_id, period_end desc);
create trigger settlements_updated_at before update on public.settlements
  for each row execute function private.set_updated_at();

create table public.commissions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders (id) on delete restrict,
  manufacturer_id uuid not null references public.manufacturers (id) on delete restrict,
  order_value numeric(12,2) not null check (order_value >= 0),          -- قيمة الطلب شاملة الضريبة
  base_type text not null default 'subtotal_excl_vat'
    check (base_type in ('subtotal_excl_vat', 'total_incl_vat')),       -- أساس الاحتساب
  base_amount numeric(12,2) not null check (base_amount >= 0),
  rate numeric(5,2) not null check (rate between 0 and 100),
  amount numeric(12,2) not null check (amount >= 0),
  manufacturer_net numeric(12,2) not null,                             -- المستحق للمصنع
  status public.commission_status not null default 'pending',
  due_date date,
  settlement_id uuid references public.settlements (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index commissions_manufacturer_idx on public.commissions (manufacturer_id, status);
create trigger commissions_updated_at before update on public.commissions
  for each row execute function private.set_updated_at();

create sequence public.invoice_number_seq;
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique
    default ('INV-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.invoice_number_seq')::text, 6, '0')),
  kind text not null default 'commission' check (kind in ('commission')),  -- فاتورة عمولة المنصة للمصنع
  manufacturer_id uuid not null references public.manufacturers (id) on delete restrict,
  order_id uuid references public.orders (id) on delete restrict,
  commission_id uuid references public.commissions (id) on delete restrict,
  settlement_id uuid references public.settlements (id) on delete restrict,
  subtotal numeric(12,2) not null check (subtotal >= 0),
  vat_rate numeric(5,2) not null default 15,
  vat_amount numeric(12,2) not null check (vat_amount >= 0),
  total numeric(12,2) not null check (total >= 0),
  status public.invoice_status not null default 'draft',
  issued_at timestamptz,
  due_date date,
  paid_at timestamptz,
  pdf_path text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invoices_has_source check (num_nonnulls(commission_id, settlement_id) >= 1)
);
create index invoices_manufacturer_idx on public.invoices (manufacturer_id, created_at desc);
create trigger invoices_updated_at before update on public.invoices
  for each row execute function private.set_updated_at();

create table public.warranties (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders (id) on delete restrict,
  manufacturer_id uuid not null references public.manufacturers (id) on delete restrict,
  customer_id uuid not null references public.profiles (id) on delete restrict,
  starts_on date not null,
  ends_on date not null check (ends_on > starts_on),
  terms text not null check (char_length(terms) <= 4000),
  status public.warranty_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger warranties_updated_at before update on public.warranties
  for each row execute function private.set_updated_at();

create table public.complaints (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles (id) on delete restrict,
  order_id uuid references public.orders (id) on delete set null,
  project_id uuid references public.projects (id) on delete set null,
  warranty_id uuid references public.warranties (id) on delete set null,
  kind public.complaint_kind not null default 'inquiry',
  subject text not null check (char_length(subject) between 3 and 160),
  body text not null check (char_length(body) between 5 and 4000),
  status public.complaint_status not null default 'open',
  assigned_to uuid references public.profiles (id) on delete set null,
  resolution text check (char_length(resolution) <= 4000),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index complaints_customer_idx on public.complaints (customer_id, created_at desc);
create index complaints_status_idx on public.complaints (status, created_at desc);
create trigger complaints_updated_at before update on public.complaints
  for each row execute function private.set_updated_at();

create table public.complaint_replies (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaints (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete restrict,
  body text not null check (char_length(body) between 1 and 4000),
  is_internal boolean not null default false,  -- ملاحظة داخلية لا يراها العميل
  created_at timestamptz not null default now()
);
create index complaint_replies_complaint_idx on public.complaint_replies (complaint_id, created_at);

-- رسائل "تواصل معنا" من الزوار. تُكتب من الخادم فقط بعد التحقق وتحديد المعدل.
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 2 and 120),
  phone text not null check (phone ~ '^\+?[0-9]{8,15}$'),
  email text check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  topic text not null check (topic in ('general', 'partnership', 'support', 'other')),
  message text not null check (char_length(message) between 10 and 2000),
  user_id uuid references public.profiles (id) on delete set null,
  ip_hash text,
  handled_at timestamptz,
  handled_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);
create index contact_messages_created_idx on public.contact_messages (created_at desc);
create index contact_messages_ip_idx on public.contact_messages (ip_hash, created_at desc);
