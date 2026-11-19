-- =============================================================================
-- معمار المنزل — 0007: سياسات أمان الصفوف (Row Level Security)
-- القاعدة: كل جدول مفعّل عليه RLS. ما لم تسمح به سياسة صريحة فهو ممنوع.
-- العمليات الحساسة (توليد التصاميم، الإشعارات، السجل، المالية) تُنفذ من الخادم
-- بمفتاح service_role بعد التحقق من الصلاحية في الكود.
-- =============================================================================

-- تفعيل RLS على جميع الجداول في public
do $$
declare t record;
begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', t.tablename);
  end loop;
end $$;

-- لا يحتاج الزائر المجهول أي وصول مباشر عدا الكتالوج والإعدادات العامة
revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;

-- ---------------------------------------------------------------------------
-- دوال الوصول للمشاريع
-- ---------------------------------------------------------------------------
create or replace function private.owns_project(p_project_id uuid)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.projects p
    where p.id = p_project_id and p.customer_id = (select auth.uid()) and p.deleted_at is null
  )
$$;

create or replace function private.manufacturer_has_project(p_project_id uuid)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select private.current_manufacturer_id() is not null and exists (
    select 1 from public.manufacturer_assignments a
    where a.project_id = p_project_id
      and a.manufacturer_id = private.current_manufacturer_id()
      and a.status in ('pending', 'accepted')
  )
$$;

create or replace function private.technician_has_project(p_project_id uuid)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select private.current_technician_id() is not null and exists (
    select 1 from public.appointments ap
    where ap.project_id = p_project_id
      and ap.technician_id = private.current_technician_id()
      and ap.status <> 'cancelled'
  )
$$;

create or replace function private.can_view_project(p_project_id uuid)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select private.owns_project(p_project_id)
      or private.is_staff()
      or private.manufacturer_has_project(p_project_id)
      or private.technician_has_project(p_project_id)
$$;

create or replace function private.can_view_order(p_order_id uuid)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.orders o
    where o.id = p_order_id and (
      o.customer_id = (select auth.uid())
      or private.is_staff()
      or private.is_finance()
      or (o.manufacturer_id is not null and o.manufacturer_id = private.current_manufacturer_id())
    )
  )
$$;

grant execute on all functions in schema private to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create policy profiles_select on public.profiles for select to authenticated
  using (id = (select auth.uid()) or private.is_staff() or private.is_finance());
create policy profiles_update_self on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy profiles_admin_update on public.profiles for update to authenticated
  using (private.is_admin()) with check (private.is_admin());

-- customer_addresses
create policy addresses_owner on public.customer_addresses for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy addresses_staff_select on public.customer_addresses for select to authenticated
  using (private.is_staff());

-- app_settings: العامة للجميع، والكل للمدير
grant select on public.app_settings to anon;
create policy app_settings_public_read on public.app_settings for select to anon, authenticated
  using (is_public);
create policy app_settings_staff_read on public.app_settings for select to authenticated
  using (private.is_staff() or private.is_finance());
create policy app_settings_admin_write on public.app_settings for all to authenticated
  using (private.is_admin()) with check (private.is_admin());

-- notifications: المستخدم يقرأ ويعلّم كمقروء فقط. الإنشاء من الخادم.
create policy notifications_owner_select on public.notifications for select to authenticated
  using (user_id = (select auth.uid()));
create policy notifications_owner_update on public.notifications for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
revoke update on public.notifications from authenticated;
grant update (read_at) on public.notifications to authenticated;

create policy notification_deliveries_admin on public.notification_deliveries for select to authenticated
  using (private.is_admin());

-- activity_logs: قراءة للمدير فقط. لا تعديل ولا حذف لأي أحد عبر الواجهة.
create policy activity_logs_admin_select on public.activity_logs for select to authenticated
  using (private.is_admin());
revoke insert, update, delete, truncate on public.activity_logs from authenticated;

-- ---------------------------------------------------------------------------
-- الكتالوج: قراءة العناصر المفعلة للجميع، والإدارة للمدير
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['design_options', 'materials', 'products', 'appliances'] loop
    execute format('grant select on public.%I to anon', t);
    execute format($p$create policy %1$s_public_read on public.%1$I for select to anon, authenticated using (is_active)$p$, t);
    execute format($p$create policy %1$s_staff_read on public.%1$I for select to authenticated using (private.is_staff())$p$, t);
    execute format($p$create policy %1$s_admin_write on public.%1$I for all to authenticated using (private.is_admin()) with check (private.is_admin())$p$, t);
  end loop;
end $$;

-- manufacturers
create policy manufacturers_staff_read on public.manufacturers for select to authenticated
  using (private.is_staff() or private.is_finance());
create policy manufacturers_own_read on public.manufacturers for select to authenticated
  using (id = private.current_manufacturer_id());
create policy manufacturers_admin_write on public.manufacturers for all to authenticated
  using (private.is_admin()) with check (private.is_admin());

-- manufacturer_prices: لا يراها العميل مباشرة؛ التسعير المبدئي يُحسب في الخادم.
create policy prices_staff_read on public.manufacturer_prices for select to authenticated
  using (private.is_staff() or private.is_finance());
create policy prices_own_read on public.manufacturer_prices for select to authenticated
  using (manufacturer_id = private.current_manufacturer_id());
create policy prices_admin_write on public.manufacturer_prices for all to authenticated
  using (private.is_admin()) with check (private.is_admin());

-- technicians
create policy technicians_staff on public.technicians for select to authenticated
  using (private.is_staff());
create policy technicians_self on public.technicians for select to authenticated
  using (profile_id = (select auth.uid()));
create policy technicians_admin_write on public.technicians for all to authenticated
  using (private.is_admin()) with check (private.is_admin());

-- ---------------------------------------------------------------------------
-- المشاريع والتصميم
-- ---------------------------------------------------------------------------
create policy projects_select on public.projects for select to authenticated
  using ((customer_id = (select auth.uid()) and deleted_at is null) or private.can_view_project(id));
create policy projects_insert on public.projects for insert to authenticated
  with check (customer_id = (select auth.uid()) and status = 'draft' and deleted_at is null);
create policy projects_update_owner on public.projects for update to authenticated
  using (customer_id = (select auth.uid()) and deleted_at is null and status in ('draft', 'designing', 'design_ready'))
  with check (customer_id = (select auth.uid()) and status in ('draft', 'designing', 'design_ready', 'archived'));
create policy projects_update_staff on public.projects for update to authenticated
  using (private.is_staff()) with check (private.is_staff());
-- الحذف الفعلي ممنوع؛ الحذف عبر deleted_at (حذف ناعم) وفق سياسة الاحتفاظ.

create policy room_images_select on public.room_images for select to authenticated
  using (private.can_view_project(project_id));
create policy room_images_insert_owner on public.room_images for insert to authenticated
  with check (uploaded_by = (select auth.uid()) and kind = 'room' and bucket = 'room-images'
              and private.owns_project(project_id));
create policy room_images_insert_technician on public.room_images for insert to authenticated
  with check (uploaded_by = (select auth.uid()) and kind = 'inspection' and bucket = 'inspection-images'
              and private.technician_has_project(project_id));
create policy room_images_delete_owner on public.room_images for delete to authenticated
  using (uploaded_by = (select auth.uid()) and kind = 'room' and private.owns_project(project_id));
create policy room_images_staff_delete on public.room_images for delete to authenticated
  using (private.is_staff());

create policy measurements_select on public.room_measurements for select to authenticated
  using (private.can_view_project(project_id));
create policy measurements_owner_write on public.room_measurements for insert to authenticated
  with check (source = 'customer' and not is_final and private.owns_project(project_id));
create policy measurements_owner_update on public.room_measurements for update to authenticated
  using (source = 'customer' and private.owns_project(project_id))
  with check (source = 'customer' and not is_final and private.owns_project(project_id));
create policy measurements_technician_insert on public.room_measurements for insert to authenticated
  with check (source = 'technician' and recorded_by = (select auth.uid()) and private.technician_has_project(project_id));
create policy measurements_technician_update on public.room_measurements for update to authenticated
  using (source = 'technician' and recorded_by = (select auth.uid()) and private.technician_has_project(project_id))
  with check (source = 'technician' and recorded_by = (select auth.uid()));
create policy measurements_staff on public.room_measurements for all to authenticated
  using (private.is_staff()) with check (private.is_staff());

create policy design_sessions_select on public.design_sessions for select to authenticated
  using (private.can_view_project(project_id));
create policy design_sessions_owner_insert on public.design_sessions for insert to authenticated
  with check (customer_id = (select auth.uid()) and private.owns_project(project_id));
create policy design_sessions_owner_update on public.design_sessions for update to authenticated
  using (customer_id = (select auth.uid()) and private.owns_project(project_id))
  with check (customer_id = (select auth.uid()));

create policy design_items_select on public.design_session_items for select to authenticated
  using (exists (select 1 from public.design_sessions s where s.id = design_session_id and private.can_view_project(s.project_id)));
create policy design_items_owner_write on public.design_session_items for all to authenticated
  using (exists (select 1 from public.design_sessions s where s.id = design_session_id
                 and s.customer_id = (select auth.uid()) and private.owns_project(s.project_id)))
  with check (exists (select 1 from public.design_sessions s where s.id = design_session_id
                 and s.customer_id = (select auth.uid()) and private.owns_project(s.project_id)));

-- التصاميم المولدة: قراءة فقط. الكتابة من خدمة الذكاء الاصطناعي في الخادم.
create policy generated_designs_select on public.generated_designs for select to authenticated
  using (private.can_view_project(project_id));

-- ---------------------------------------------------------------------------
-- العمليات
-- ---------------------------------------------------------------------------
create policy appointments_select on public.appointments for select to authenticated
  using (customer_id = (select auth.uid())
         or private.is_staff()
         or (technician_id is not null and technician_id = private.current_technician_id()));
create policy appointments_customer_insert on public.appointments for insert to authenticated
  with check (customer_id = (select auth.uid()) and status = 'new' and technician_id is null
              and private.owns_project(project_id));
create policy appointments_staff_write on public.appointments for all to authenticated
  using (private.is_staff()) with check (private.is_staff());
create policy appointments_technician_update on public.appointments for update to authenticated
  using (technician_id = private.current_technician_id())
  with check (technician_id = private.current_technician_id() and status in ('confirmed', 'completed', 'postponed'));

create policy orders_select on public.orders for select to authenticated
  using (private.can_view_order(id));
create policy orders_staff_write on public.orders for all to authenticated
  using (private.is_staff()) with check (private.is_staff());

create policy order_history_select on public.order_status_history for select to authenticated
  using (private.can_view_order(order_id));

create policy assignments_staff on public.manufacturer_assignments for all to authenticated
  using (private.is_staff()) with check (private.is_staff());
create policy assignments_own_select on public.manufacturer_assignments for select to authenticated
  using (manufacturer_id = private.current_manufacturer_id());
create policy assignments_own_respond on public.manufacturer_assignments for update to authenticated
  using (manufacturer_id = private.current_manufacturer_id() and status = 'pending')
  with check (manufacturer_id = private.current_manufacturer_id() and status in ('accepted', 'declined'));

create policy quotations_customer_select on public.quotations for select to authenticated
  using (customer_id = (select auth.uid()) and status <> 'draft');
create policy quotations_staff on public.quotations for all to authenticated
  using (private.is_staff()) with check (private.is_staff());
create policy quotations_finance_read on public.quotations for select to authenticated
  using (private.is_finance());
create policy quotations_manufacturer_select on public.quotations for select to authenticated
  using (manufacturer_id = private.current_manufacturer_id());
create policy quotations_manufacturer_draft on public.quotations for insert to authenticated
  with check (manufacturer_id = private.current_manufacturer_id() and status = 'draft');
create policy quotations_manufacturer_update on public.quotations for update to authenticated
  using (manufacturer_id = private.current_manufacturer_id() and status = 'draft')
  with check (manufacturer_id = private.current_manufacturer_id() and status in ('draft', 'issued'));

create policy quotation_items_select on public.quotation_items for select to authenticated
  using (exists (select 1 from public.quotations q where q.id = quotation_id));  -- يرث سياسة العروض
create policy quotation_items_staff on public.quotation_items for all to authenticated
  using (private.is_staff()) with check (private.is_staff());
create policy quotation_items_manufacturer on public.quotation_items for all to authenticated
  using (exists (select 1 from public.quotations q where q.id = quotation_id and q.status = 'draft'
                 and q.manufacturer_id = private.current_manufacturer_id()))
  with check (exists (select 1 from public.quotations q where q.id = quotation_id and q.status = 'draft'
                 and q.manufacturer_id = private.current_manufacturer_id()));

-- ---------------------------------------------------------------------------
-- المالية: المدير والمحاسب. المصنع يرى ما يخصه فقط. العميل يرى مدفوعاته.
-- ---------------------------------------------------------------------------
create policy payments_finance on public.payments for all to authenticated
  using (private.is_finance()) with check (private.is_finance());
create policy payments_customer_select on public.payments for select to authenticated
  using (customer_id = (select auth.uid()));
create policy payments_support_select on public.payments for select to authenticated
  using (private.is_staff());
create policy payments_manufacturer_select on public.payments for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id
                 and o.manufacturer_id = private.current_manufacturer_id()));

do $$
declare t text;
begin
  foreach t in array array['commissions', 'settlements', 'invoices'] loop
    execute format($p$create policy %1$s_finance on public.%1$I for all to authenticated using (private.is_finance()) with check (private.is_finance())$p$, t);
    execute format($p$create policy %1$s_manufacturer_select on public.%1$I for select to authenticated using (manufacturer_id = private.current_manufacturer_id())$p$, t);
  end loop;
end $$;

create policy warranties_select on public.warranties for select to authenticated
  using (customer_id = (select auth.uid()) or private.is_staff()
         or manufacturer_id = private.current_manufacturer_id());
create policy warranties_staff_write on public.warranties for all to authenticated
  using (private.is_staff()) with check (private.is_staff());

-- الشكاوى والاستفسارات
create policy complaints_customer_select on public.complaints for select to authenticated
  using (customer_id = (select auth.uid()));
create policy complaints_customer_insert on public.complaints for insert to authenticated
  with check (customer_id = (select auth.uid()) and status = 'open' and assigned_to is null
              and (order_id is null or exists (select 1 from public.orders o where o.id = order_id and o.customer_id = (select auth.uid())))
              and (project_id is null or private.owns_project(project_id)));
create policy complaints_staff on public.complaints for all to authenticated
  using (private.is_staff()) with check (private.is_staff());
create policy complaints_manufacturer_select on public.complaints for select to authenticated
  using (order_id is not null and exists (select 1 from public.orders o where o.id = order_id
         and o.manufacturer_id = private.current_manufacturer_id()));

create policy complaint_replies_select on public.complaint_replies for select to authenticated
  using (private.is_staff()
         or (not is_internal and exists (select 1 from public.complaints c where c.id = complaint_id
             and c.customer_id = (select auth.uid()))));
create policy complaint_replies_customer_insert on public.complaint_replies for insert to authenticated
  with check (author_id = (select auth.uid()) and not is_internal
              and exists (select 1 from public.complaints c where c.id = complaint_id
                          and c.customer_id = (select auth.uid()) and c.status in ('open', 'in_progress')));
create policy complaint_replies_staff_insert on public.complaint_replies for insert to authenticated
  with check (author_id = (select auth.uid()) and private.is_staff());

-- رسائل التواصل: قراءة وتحديث للدعم والإدارة فقط
create policy contact_messages_staff on public.contact_messages for select to authenticated
  using (private.is_staff());
create policy contact_messages_staff_update on public.contact_messages for update to authenticated
  using (private.is_staff()) with check (private.is_staff());
