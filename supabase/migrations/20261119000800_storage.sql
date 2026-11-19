-- =============================================================================
-- معمار المنزل — 0008: التخزين (Supabase Storage)
-- كل الحاويات خاصة. المسار: {customer_id}/{project_id}/{file}
-- الوصول للصور يتم بروابط موقعة قصيرة الأجل تُنشأ من الخادم.
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('room-images', 'room-images', false, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
  ('inspection-images', 'inspection-images', false, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
  ('generated-designs', 'generated-designs', false, 15728640, array['image/jpeg', 'image/png', 'image/webp']),
  ('documents', 'documents', false, 10485760, array['application/pdf'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;


-- تحويل آمن لنص إلى uuid (يعيد null بدلاً من خطأ عند مسار غير صالح)
create or replace function private.try_uuid(p text)
returns uuid
language plpgsql immutable
set search_path = ''
as $$
begin
  return p::uuid;
exception when others then
  return null;
end;
$$;
grant execute on function private.try_uuid(text) to authenticated, service_role;

-- صور الغرفة: العميل يرفع ويقرأ ويحذف داخل مجلده فقط، ولمشروع يملكه
create policy room_images_owner_insert on storage.objects for insert to authenticated
  with check (
    bucket_id = 'room-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and private.owns_project(private.try_uuid((storage.foldername(name))[2]))
  );
create policy room_images_owner_select on storage.objects for select to authenticated
  using (
    bucket_id = 'room-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
create policy room_images_owner_delete on storage.objects for delete to authenticated
  using (
    bucket_id = 'room-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- التصاميم المولدة: العميل يقرأ مجلده فقط؛ الكتابة من الخادم (service_role)
create policy generated_designs_owner_select on storage.objects for select to authenticated
  using (
    bucket_id = 'generated-designs'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- الإدارة والدعم: قراءة جميع الصور التشغيلية
create policy staff_select_operational on storage.objects for select to authenticated
  using (
    bucket_id in ('room-images', 'inspection-images', 'generated-designs', 'documents')
    and private.is_staff()
  );

-- صور المعاينة: الفني المكلف يرفع لمشاريع مواعيده. المسار: {project_id}/{file}
create policy inspection_images_technician_insert on storage.objects for insert to authenticated
  with check (
    bucket_id = 'inspection-images'
    and private.technician_has_project(private.try_uuid((storage.foldername(name))[1]))
  );
create policy inspection_images_technician_select on storage.objects for select to authenticated
  using (
    bucket_id = 'inspection-images'
    and private.technician_has_project(private.try_uuid((storage.foldername(name))[1]))
  );
