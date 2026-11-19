-- =============================================================================
-- معمار المنزل — 0001: الأساسيات (المخططات، الأنواع، الدوال المساعدة)
-- =============================================================================
-- private: دوال مساعدة لا تُعرض عبر واجهة PostgREST العامة.
create schema if not exists private;
grant usage on schema private to authenticated, anon, service_role;

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- الأنواع (Enums)
-- ---------------------------------------------------------------------------
create type public.app_role as enum (
  'admin', 'customer', 'manufacturer', 'technician', 'support', 'accountant'
);

create type public.property_type as enum ('villa', 'apartment', 'duplex', 'floor', 'other');
create type public.kitchen_work_type as enum ('new', 'renovation');
create type public.kitchen_shape as enum ('straight', 'l_shape', 'u_shape', 'island', 'parallel');

create type public.project_status as enum (
  'draft',          -- قيد الإعداد
  'designing',      -- في مرحلة التصميم
  'design_ready',   -- التصميم جاهز
  'submitted',      -- تم طلب المعاينة / تحول إلى طلب
  'archived'        -- مؤرشف
);

create type public.design_status as enum ('draft', 'generating', 'ready', 'failed');
create type public.generation_status as enum ('pending', 'succeeded', 'failed', 'not_configured');

create type public.option_category as enum ('style', 'color', 'addon');
create type public.material_kind as enum ('cabinet', 'countertop', 'handle', 'other');
create type public.product_kind as enum (
  'base_cabinet', 'wall_cabinet', 'tall_unit', 'corner_unit', 'island', 'accessory', 'service'
);

create type public.pricing_unit as enum (
  'linear_meter',   -- متر طولي
  'square_meter',   -- متر مربع
  'unit',           -- وحدة منفصلة
  'fixed',          -- سعر ثابت
  'appliance',      -- سعر جهاز
  'installation',   -- تكلفة تركيب
  'extra'           -- تكلفة إضافية حسب الطلب
);

create type public.price_item_type as enum ('material', 'product', 'appliance', 'option', 'service');

create type public.partnership_status as enum ('prospect', 'active', 'paused', 'terminated');
create type public.assignment_status as enum ('pending', 'accepted', 'declined', 'cancelled');

create type public.appointment_status as enum (
  'new',        -- جديد
  'confirmed',  -- مؤكد
  'completed',  -- تمت المعاينة
  'postponed',  -- مؤجل
  'cancelled'   -- ملغي
);

create type public.order_status as enum (
  'new',                      -- 1 جديد
  'design_ready',             -- 2 التصميم جاهز
  'awaiting_inspection',      -- 3 بانتظار المعاينة
  'inspected',                -- 4 تمت المعاينة
  'awaiting_quotation',       -- 5 بانتظار عرض السعر
  'quotation_ready',          -- 6 عرض السعر جاهز
  'awaiting_customer_approval', -- 7 بانتظار موافقة العميل
  'awaiting_payment',         -- 8 بانتظار الدفع
  'paid',                     -- 9 مدفوع
  'in_manufacturing',         -- 10 قيد التصنيع
  'ready_for_installation',   -- 11 جاهز للتركيب
  'installing',               -- 12 جارٍ التركيب
  'installed',                -- 13 تم التركيب
  'completed',                -- 14 مكتمل
  'cancelled',                -- 15 ملغي
  'disputed'                  -- 16 يوجد نزاع أو شكوى
);

create type public.quotation_status as enum (
  'draft', 'issued', 'accepted', 'rejected', 'revision_requested', 'expired', 'superseded'
);

create type public.payment_status as enum ('pending', 'succeeded', 'failed', 'refunded', 'cancelled');
create type public.payment_payee as enum ('manufacturer', 'platform');
create type public.commission_status as enum ('pending', 'invoiced', 'settled', 'cancelled');
create type public.settlement_status as enum ('open', 'invoiced', 'settled', 'cancelled');
create type public.invoice_status as enum ('draft', 'issued', 'paid', 'void');
create type public.warranty_status as enum ('active', 'expired', 'void');
create type public.complaint_kind as enum ('inquiry', 'complaint', 'warranty_claim');
create type public.complaint_status as enum ('open', 'in_progress', 'resolved', 'closed');
create type public.image_kind as enum ('room', 'inspection');
create type public.measurement_source as enum ('customer', 'technician');

-- ---------------------------------------------------------------------------
-- updated_at تلقائي
-- ---------------------------------------------------------------------------
create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
