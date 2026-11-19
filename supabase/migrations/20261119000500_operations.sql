-- =============================================================================
-- معمار المنزل — 0005: الإسناد للمصانع، المعاينات، الطلبات، سجل الحالات، عروض الأسعار
-- =============================================================================

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete restrict,
  customer_id uuid not null references public.profiles (id) on delete restrict,
  address_id uuid references public.customer_addresses (id) on delete set null,
  contact_name text not null check (char_length(contact_name) between 2 and 120),
  contact_phone text not null check (contact_phone ~ '^\+?[0-9]{8,15}$'),
  address_text text not null check (char_length(address_text) between 3 and 400),
  requested_date date not null,
  requested_time_slot text not null check (requested_time_slot in ('morning', 'afternoon', 'evening')),
  scheduled_at timestamptz,
  technician_id uuid references public.technicians (id) on delete set null,
  status public.appointment_status not null default 'new',
  customer_notes text check (char_length(customer_notes) <= 1000),
  technician_notes text check (char_length(technician_notes) <= 4000),
  final_measurement_id uuid references public.room_measurements (id) on delete set null,
  cancellation_reason text check (char_length(cancellation_reason) <= 500),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index appointments_project_idx on public.appointments (project_id);
create index appointments_technician_idx on public.appointments (technician_id, requested_date);
create index appointments_status_date_idx on public.appointments (status, requested_date);
create trigger appointments_updated_at before update on public.appointments
  for each row execute function private.set_updated_at();

alter table public.room_images
  add constraint room_images_appointment_fk foreign key (appointment_id)
  references public.appointments (id) on delete set null;
alter table public.room_measurements
  add constraint room_measurements_appointment_fk foreign key (appointment_id)
  references public.appointments (id) on delete set null;
create index room_images_appointment_idx on public.room_images (appointment_id) where appointment_id is not null;

-- ---------------------------------------------------------------------------
-- الطلبات
-- ---------------------------------------------------------------------------
create sequence public.order_number_seq;
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique
    default ('MM-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.order_number_seq')::text, 6, '0')),
  project_id uuid not null references public.projects (id) on delete restrict,
  customer_id uuid not null references public.profiles (id) on delete restrict,
  manufacturer_id uuid references public.manufacturers (id) on delete restrict,
  design_session_id uuid references public.design_sessions (id) on delete set null,
  accepted_quotation_id uuid, -- يُربط بعد إنشاء جدول العروض
  status public.order_status not null default 'new',
  estimate_min numeric(12,2) check (estimate_min >= 0),  -- السعر المبدئي وقت الطلب
  estimate_max numeric(12,2) check (estimate_max >= estimate_min),
  total_amount numeric(12,2) check (total_amount >= 0), -- قيمة العرض المقبول شاملة الضريبة
  cancellation_reason text check (char_length(cancellation_reason) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index orders_one_active_per_project on public.orders (project_id) where status not in ('cancelled', 'completed');
create index orders_customer_idx on public.orders (customer_id, created_at desc);
create index orders_manufacturer_idx on public.orders (manufacturer_id, status);
create index orders_status_idx on public.orders (status, created_at desc);
create trigger orders_updated_at before update on public.orders
  for each row execute function private.set_updated_at();

create table public.order_status_history (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders (id) on delete cascade,
  from_status public.order_status,
  to_status public.order_status not null,
  changed_by uuid references public.profiles (id) on delete set null,
  note text check (char_length(note) <= 1000),
  created_at timestamptz not null default now()
);
create index order_status_history_order_idx on public.order_status_history (order_id, created_at);

-- كل تغيير في حالة الطلب يُسجل تلقائياً مع التاريخ والمستخدم المسؤول
create or replace function private.track_order_status()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
declare
  v_note text := nullif(current_setting('app.status_note', true), '');
begin
  if tg_op = 'INSERT' then
    insert into public.order_status_history (order_id, from_status, to_status, changed_by, note)
    values (new.id, null, new.status, (select auth.uid()), v_note);
  elsif new.status is distinct from old.status then
    insert into public.order_status_history (order_id, from_status, to_status, changed_by, note)
    values (new.id, old.status, new.status, (select auth.uid()), v_note);
    perform public.log_activity('order.status_changed', 'order', new.id,
      jsonb_build_object('from', old.status, 'to', new.status));
  end if;
  return new;
end;
$$;
create trigger orders_status_history
  after insert or update of status on public.orders
  for each row execute function private.track_order_status();

-- ---------------------------------------------------------------------------
-- الإسناد للمصانع
-- ---------------------------------------------------------------------------
create table public.manufacturer_assignments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  order_id uuid references public.orders (id) on delete cascade,
  manufacturer_id uuid not null references public.manufacturers (id) on delete restrict,
  status public.assignment_status not null default 'pending',
  assigned_by uuid references public.profiles (id) on delete set null,
  notes text check (char_length(notes) <= 1000),
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index manufacturer_assignments_active_one
  on public.manufacturer_assignments (project_id, manufacturer_id) where status in ('pending', 'accepted');
create index manufacturer_assignments_manufacturer_idx on public.manufacturer_assignments (manufacturer_id, status);
create trigger manufacturer_assignments_updated_at before update on public.manufacturer_assignments
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------------
-- عروض الأسعار
-- ---------------------------------------------------------------------------
create sequence public.quotation_number_seq;
create table public.quotations (
  id uuid primary key default gen_random_uuid(),
  quotation_number text not null unique
    default ('Q-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.quotation_number_seq')::text, 6, '0')),
  order_id uuid not null references public.orders (id) on delete restrict,
  project_id uuid not null references public.projects (id) on delete restrict,
  customer_id uuid not null references public.profiles (id) on delete restrict,
  manufacturer_id uuid not null references public.manufacturers (id) on delete restrict,
  measurement_id uuid references public.room_measurements (id) on delete set null, -- المقاسات المعتمدة
  status public.quotation_status not null default 'draft',
  kitchen_details text check (char_length(kitchen_details) <= 4000),
  materials_summary text check (char_length(materials_summary) <= 2000),
  appliances_summary text check (char_length(appliances_summary) <= 2000),
  subtotal numeric(12,2) not null default 0 check (subtotal >= 0),
  delivery_fee numeric(12,2) not null default 0 check (delivery_fee >= 0),
  installation_fee numeric(12,2) not null default 0 check (installation_fee >= 0),
  vat_rate numeric(5,2) not null default 15 check (vat_rate between 0 and 100),
  vat_amount numeric(12,2) not null default 0 check (vat_amount >= 0),
  total numeric(12,2) not null default 0 check (total >= 0),
  execution_days int check (execution_days > 0),
  warranty_terms text check (char_length(warranty_terms) <= 2000),
  payment_terms text check (char_length(payment_terms) <= 2000),
  valid_until date,
  customer_response_note text check (char_length(customer_response_note) <= 1000),
  issued_by uuid references public.profiles (id) on delete set null,
  issued_at timestamptz,
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quotations_issued_complete check (
    status = 'draft' or (issued_at is not null and valid_until is not null and total > 0)
  )
);
create index quotations_order_idx on public.quotations (order_id, created_at desc);
create index quotations_customer_idx on public.quotations (customer_id);
create index quotations_manufacturer_idx on public.quotations (manufacturer_id, status);
create trigger quotations_updated_at before update on public.quotations
  for each row execute function private.set_updated_at();

alter table public.orders
  add constraint orders_accepted_quotation_fk foreign key (accepted_quotation_id)
  references public.quotations (id) on delete set null;

create table public.quotation_items (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid not null references public.quotations (id) on delete cascade,
  description text not null check (char_length(description) between 1 and 300),
  pricing_unit public.pricing_unit not null,
  quantity numeric(10,2) not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  line_total numeric(12,2) generated always as (round(quantity * unit_price, 2)) stored,
  sort_order smallint not null default 0
);
create index quotation_items_quotation_idx on public.quotation_items (quotation_id, sort_order);

-- قبول/رفض/طلب تعديل العرض من العميل فقط، مع تحديث حالة الطلب في نفس المعاملة
create or replace function public.respond_to_quotation(
  p_quotation_id uuid, p_response public.quotation_status, p_note text default null
)
returns public.quotations
language plpgsql security definer
set search_path = ''
as $$
declare
  q public.quotations;
begin
  if p_response not in ('accepted', 'rejected', 'revision_requested') then
    raise exception 'استجابة غير صالحة' using errcode = '22023';
  end if;

  select * into q from public.quotations where id = p_quotation_id for update;
  if not found or q.customer_id <> (select auth.uid()) then
    raise exception 'العرض غير موجود' using errcode = '42501';
  end if;
  if q.status <> 'issued' then
    raise exception 'لا يمكن الرد على هذا العرض في حالته الحالية' using errcode = '22023';
  end if;
  if q.valid_until < current_date then
    update public.quotations set status = 'expired' where id = q.id;
    raise exception 'انتهت صلاحية العرض' using errcode = '22023';
  end if;

  update public.quotations
     set status = p_response,
         customer_response_note = left(p_note, 1000),
         responded_at = now()
   where id = q.id
  returning * into q;

  perform set_config('app.status_note', 'رد العميل على العرض ' || q.quotation_number, true);
  if p_response = 'accepted' then
    update public.orders
       set status = 'awaiting_payment', accepted_quotation_id = q.id, total_amount = q.total,
           manufacturer_id = q.manufacturer_id
     where id = q.order_id;
  else
    update public.orders set status = 'awaiting_quotation' where id = q.order_id;
  end if;

  perform public.log_activity('quotation.' || p_response::text, 'quotation', q.id,
    jsonb_build_object('order_id', q.order_id));
  return q;
end;
$$;
revoke execute on function public.respond_to_quotation(uuid, public.quotation_status, text) from public, anon;
grant execute on function public.respond_to_quotation(uuid, public.quotation_status, text) to authenticated;
