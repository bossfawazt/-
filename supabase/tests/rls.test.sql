-- =============================================================================
-- اختبارات الصلاحيات (RLS) — تفشل عند أول مخالفة
-- =============================================================================
\set ON_ERROR_STOP 1

-- أدوات مساعدة: تبديل الهوية داخل المعاملة
create or replace function pg_temp.act_as(p_user uuid) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', coalesce(p_user::text, ''), true);
  perform set_config('request.jwt.claim.role', case when p_user is null then 'anon' else 'authenticated' end, true);
  if p_user is null then execute 'set local role anon'; else execute 'set local role authenticated'; end if;
end $$;
create or replace function pg_temp.assert(cond boolean, msg text) returns void language plpgsql as $$
begin
  if not coalesce(cond, false) then raise exception 'فشل الاختبار: %', msg; end if;
  raise notice 'ok: %', msg;
end $$;

-- ---------------------------------------------------------------------------
-- تجهيز المستخدمين (كمستخدم postgres)
-- ---------------------------------------------------------------------------
insert into auth.users (id, phone) values
  ('11111111-1111-4111-8111-111111111111', '966500000001'),  -- عميل أ
  ('22222222-2222-4222-8222-222222222222', '966500000002'),  -- عميل ب
  ('33333333-3333-4333-8333-333333333333', '966500000003'),  -- مدير
  ('44444444-4444-4444-8444-444444444444', '966500000004'),  -- مستخدم مصنع
  ('55555555-5555-4555-8555-555555555555', '966500000005'),  -- فني
  ('66666666-6666-4666-8666-666666666666', '966500000006');  -- محاسب

select pg_temp.assert((select count(*) = 6 from public.profiles), 'إنشاء الملفات الشخصية تلقائياً عند التسجيل');
select pg_temp.assert((select bool_and(role = 'customer') from public.profiles), 'الدور الافتراضي عميل دائماً');

update public.profiles set role = 'admin' where id = '33333333-3333-4333-8333-333333333333';
update public.profiles set role = 'manufacturer', manufacturer_id = '00000000-0000-4000-8000-000000000001'
  where id = '44444444-4444-4444-8444-444444444444';
update public.profiles set role = 'technician' where id = '55555555-5555-4555-8555-555555555555';
update public.profiles set role = 'accountant' where id = '66666666-6666-4666-8666-666666666666';
insert into public.technicians (id, profile_id, full_name, phone)
  values ('77777777-7777-4777-8777-777777777777', '55555555-5555-4555-8555-555555555555', 'فني اختبار', '966500000005');

-- ---------------------------------------------------------------------------
-- 1) الزائر المجهول
-- ---------------------------------------------------------------------------
begin;
select pg_temp.act_as(null);
select pg_temp.assert((select count(*) from public.design_options) > 0, 'الزائر يقرأ خيارات التصميم');
select pg_temp.assert((select count(*) from public.app_settings where key = 'vat_rate') = 1, 'الزائر يقرأ الإعدادات العامة');
select pg_temp.assert((select count(*) from public.app_settings where key = 'default_commission_rate') = 0, 'الزائر لا يرى نسبة العمولة');
do $$ begin
  perform 1 from public.projects;
  raise exception 'فشل الاختبار: الزائر قرأ المشاريع';
exception when insufficient_privilege then raise notice 'ok: الزائر ممنوع من المشاريع';
end $$;
do $$ begin
  perform 1 from public.manufacturer_prices;
  raise exception 'فشل الاختبار: الزائر قرأ الأسعار';
exception when insufficient_privilege then raise notice 'ok: الزائر ممنوع من الأسعار';
end $$;
select pg_temp.assert((select count(*) from public.list_public_manufacturers()) = 0, 'بيانات الاختبار لا تظهر في المصانع الشريكة العامة');
rollback;

-- ---------------------------------------------------------------------------
-- 2) العميل أ ينشئ مشروعاً
-- ---------------------------------------------------------------------------
begin;
select pg_temp.act_as('11111111-1111-4111-8111-111111111111');
insert into public.projects (id, customer_id, name, district)
  values ('aaaaaaaa-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'مطبخ الفيلا', 'الملقا');
insert into public.room_measurements (project_id, wall_a_cm, wall_b_cm, ceiling_height_cm, kitchen_shape)
  values ('aaaaaaaa-0000-4000-8000-000000000001', 420, 300, 300, 'l_shape');
insert into public.room_images (project_id, uploaded_by, bucket, storage_path, mime_type, size_bytes)
  values ('aaaaaaaa-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'room-images',
          '11111111-1111-4111-8111-111111111111/aaaaaaaa-0000-4000-8000-000000000001/1.jpg', 'image/jpeg', 2048);
insert into storage.objects (bucket_id, name)
  values ('room-images', '11111111-1111-4111-8111-111111111111/aaaaaaaa-0000-4000-8000-000000000001/1.jpg');
select pg_temp.assert((select count(*) from public.projects) = 1, 'العميل يرى مشروعه');
do $$ begin
  update public.profiles set role = 'admin' where id = '11111111-1111-4111-8111-111111111111';
  raise exception 'فشل الاختبار: العميل رقّى نفسه لمدير';
exception when insufficient_privilege then raise notice 'ok: العميل لا يستطيع تغيير دوره';
end $$;
update public.profiles set full_name = 'عميل أ' where id = '11111111-1111-4111-8111-111111111111';
select pg_temp.assert((select full_name = 'عميل أ' from public.profiles where id = (select auth.uid())), 'العميل يعدل اسمه');
do $$ begin
  insert into public.generated_designs (design_session_id, project_id, customer_id, provider, status)
  select gen_random_uuid(), 'aaaaaaaa-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'x', 'succeeded';
  raise exception 'فشل الاختبار: العميل أنشأ تصميماً مولداً مباشرة';
exception when insufficient_privilege or foreign_key_violation then raise notice 'ok: التصاميم المولدة تُكتب من الخادم فقط';
end $$;
do $$ begin
  insert into storage.objects (bucket_id, name)
    values ('room-images', '22222222-2222-4222-8222-222222222222/aaaaaaaa-0000-4000-8000-000000000001/x.jpg');
  raise exception 'فشل الاختبار: رفع ملف في مجلد عميل آخر';
exception when insufficient_privilege then raise notice 'ok: لا رفع في مجلد مستخدم آخر';
end $$;
commit;

-- ---------------------------------------------------------------------------
-- 3) العميل ب لا يرى بيانات العميل أ
-- ---------------------------------------------------------------------------
begin;
select pg_temp.act_as('22222222-2222-4222-8222-222222222222');
select pg_temp.assert((select count(*) from public.projects) = 0, 'العميل ب لا يرى مشاريع أ');
select pg_temp.assert((select count(*) from public.room_images) = 0, 'العميل ب لا يرى صور أ');
select pg_temp.assert((select count(*) from public.room_measurements) = 0, 'العميل ب لا يرى مقاسات أ');
select pg_temp.assert((select count(*) from storage.objects) = 0, 'العميل ب لا يرى ملفات أ في التخزين');
select pg_temp.assert((select count(*) from public.profiles) = 1, 'العميل ب يرى ملفه فقط');
do $$ begin
  insert into public.projects (customer_id, name) values ('11111111-1111-4111-8111-111111111111', 'انتحال');
  raise exception 'فشل الاختبار: إنشاء مشروع باسم عميل آخر';
exception when insufficient_privilege then raise notice 'ok: لا إنشاء مشروع لعميل آخر';
end $$;
update public.projects set name = 'اختراق' where id = 'aaaaaaaa-0000-4000-8000-000000000001';
select pg_temp.assert((select count(*) from public.manufacturers) = 0, 'العميل لا يرى بيانات المصانع');
rollback;

-- ---------------------------------------------------------------------------
-- 4) المصنع لا يرى إلا ما أُسند إليه
-- ---------------------------------------------------------------------------
begin;
select pg_temp.act_as('44444444-4444-4444-8444-444444444444');
select pg_temp.assert((select count(*) from public.projects) = 0, 'المصنع لا يرى المشروع قبل الإسناد');
select pg_temp.assert((select count(*) from public.manufacturer_prices) > 0, 'المصنع يرى أسعاره');
rollback;

-- المدير ينشئ طلباً ويسنده للمصنع ويحجز معاينة للفني
begin;
select pg_temp.act_as('33333333-3333-4333-8333-333333333333');
select pg_temp.assert((select name from public.projects) = 'مطبخ الفيلا', 'المدير يرى المشاريع (وتعديل العميل ب لم يُطبق)');
insert into public.orders (id, project_id, customer_id, manufacturer_id)
  values ('bbbbbbbb-0000-4000-8000-000000000001', 'aaaaaaaa-0000-4000-8000-000000000001',
          '11111111-1111-4111-8111-111111111111', '00000000-0000-4000-8000-000000000001');
insert into public.manufacturer_assignments (project_id, order_id, manufacturer_id, assigned_by)
  values ('aaaaaaaa-0000-4000-8000-000000000001', 'bbbbbbbb-0000-4000-8000-000000000001',
          '00000000-0000-4000-8000-000000000001', '33333333-3333-4333-8333-333333333333');
insert into public.appointments (project_id, customer_id, contact_name, contact_phone, address_text,
                                 requested_date, requested_time_slot, technician_id, status)
  values ('aaaaaaaa-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'عميل أ',
          '966500000001', 'الرياض، حي الملقا', current_date + 3, 'morning',
          '77777777-7777-4777-8777-777777777777', 'confirmed');
update public.orders set status = 'awaiting_inspection' where id = 'bbbbbbbb-0000-4000-8000-000000000001';
insert into public.quotations (id, order_id, project_id, customer_id, manufacturer_id, status)
  values ('cccccccc-0000-4000-8000-000000000001', 'bbbbbbbb-0000-4000-8000-000000000001',
          'aaaaaaaa-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111',
          '00000000-0000-4000-8000-000000000001', 'draft');
insert into public.quotation_items (quotation_id, description, pricing_unit, quantity, unit_price)
  values ('cccccccc-0000-4000-8000-000000000001', 'خزائن سفلية', 'linear_meter', 4.2, 1200);
commit;

begin;
select pg_temp.act_as('44444444-4444-4444-8444-444444444444');
select pg_temp.assert((select count(*) from public.projects) = 1, 'المصنع يرى المشروع المسند إليه');
select pg_temp.assert((select count(*) from public.orders) = 1, 'المصنع يرى الطلب المسند إليه');
select pg_temp.assert((select count(*) from public.profiles) = 1, 'المصنع لا يرى ملفات العملاء');
rollback;

begin;
select pg_temp.act_as('55555555-5555-4555-8555-555555555555');
select pg_temp.assert((select count(*) from public.appointments) = 1, 'الفني يرى موعده');
select pg_temp.assert((select count(*) from public.projects) = 1, 'الفني يرى مشروع موعده');
select pg_temp.assert((select count(*) from public.orders) = 0, 'الفني لا يرى الطلبات المالية');
insert into public.room_measurements (project_id, source, recorded_by, wall_a_cm, kitchen_shape, is_final)
  values ('aaaaaaaa-0000-4000-8000-000000000001', 'technician', '55555555-5555-4555-8555-555555555555', 418, 'l_shape', true);
select pg_temp.assert(true, 'الفني يسجل المقاسات النهائية');
rollback;

-- ---------------------------------------------------------------------------
-- 5) عرض السعر: المسودة مخفية عن العميل، ثم القبول يحدّث الطلب ويُسجل
-- ---------------------------------------------------------------------------
begin;
select pg_temp.act_as('11111111-1111-4111-8111-111111111111');
select pg_temp.assert((select count(*) from public.quotations) = 0, 'العميل لا يرى مسودة العرض');
rollback;

begin;
select pg_temp.act_as('33333333-3333-4333-8333-333333333333');
update public.quotations set status = 'issued', issued_at = now(), valid_until = current_date + 14,
  subtotal = 5040, vat_amount = 756, total = 5796 where id = 'cccccccc-0000-4000-8000-000000000001';
update public.orders set status = 'awaiting_customer_approval' where id = 'bbbbbbbb-0000-4000-8000-000000000001';
commit;

begin;
select pg_temp.act_as('22222222-2222-4222-8222-222222222222');
do $$ begin
  perform public.respond_to_quotation('cccccccc-0000-4000-8000-000000000001', 'accepted');
  raise exception 'فشل الاختبار: عميل آخر قبل العرض';
exception when insufficient_privilege then raise notice 'ok: لا يقبل العرض إلا صاحبه';
end $$;
rollback;

begin;
select pg_temp.act_as('11111111-1111-4111-8111-111111111111');
select pg_temp.assert((select count(*) from public.quotation_items) = 1, 'العميل يرى بنود العرض الصادر');
select pg_temp.assert((select line_total from public.quotation_items) = 5040.00, 'حساب إجمالي البند');
select (public.respond_to_quotation('cccccccc-0000-4000-8000-000000000001', 'accepted', 'موافق')).status;
select pg_temp.assert((select status = 'awaiting_payment' and total_amount = 5796 from public.orders), 'قبول العرض يحدّث حالة الطلب وقيمته');
select pg_temp.assert((select count(*) from public.order_status_history) = 4, 'كل تغيير حالة مسجل في السجل');
select pg_temp.assert((select changed_by = '11111111-1111-4111-8111-111111111111' from public.order_status_history
                       order by id desc limit 1), 'السجل يحفظ المستخدم المسؤول');
select pg_temp.assert((select count(*) from public.activity_logs) = 0, 'العميل لا يقرأ سجل العمليات');
commit;

begin;
select pg_temp.act_as('33333333-3333-4333-8333-333333333333');
select pg_temp.assert((select count(*) from public.activity_logs where action = 'quotation.accepted') = 1, 'قبول العرض مسجل في سجل العمليات');
rollback;

-- ---------------------------------------------------------------------------
-- 6) المالية
-- ---------------------------------------------------------------------------
begin;
select pg_temp.act_as('66666666-6666-4666-8666-666666666666');
insert into public.commissions (order_id, manufacturer_id, order_value, base_amount, rate, amount, manufacturer_net)
  values ('bbbbbbbb-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', 5796, 5040, 12, 604.80, 5191.20);
select pg_temp.assert(true, 'المحاسب يسجل العمولة');
select pg_temp.assert((select count(*) from public.projects) = 0, 'المحاسب لا يرى صور ومشاريع العملاء');
commit;

begin;
select pg_temp.act_as('11111111-1111-4111-8111-111111111111');
select pg_temp.assert((select count(*) from public.commissions) = 0, 'العميل لا يرى العمولات');
rollback;

begin;
select pg_temp.act_as('44444444-4444-4444-8444-444444444444');
select pg_temp.assert((select count(*) from public.commissions) = 1, 'المصنع يرى عمولته');
do $$ begin
  update public.commissions set amount = 0;
  if found then raise exception 'فشل الاختبار: المصنع عدّل العمولة'; end if;
  raise notice 'ok: المصنع لا يعدل العمولة';
end $$;
rollback;

select 'كل اختبارات RLS نجحت' as result;
