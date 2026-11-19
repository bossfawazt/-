-- =============================================================================
-- معمار المنزل — بيانات اختبار للتطوير المحلي فقط
-- ⚠️ هذه بيانات اختبار وليست مصانع أو عروض أسعار حقيقية.
-- يعمل هذا الملف تلقائياً مع `supabase db reset` محلياً فقط، ولا يُرفع للإنتاج.
-- جميع السجلات مميزة بـ is_test_data = true وبعبارة (بيانات اختبار) في الاسم.
-- =============================================================================

insert into public.manufacturers (
  id, trade_name, city, address, phone, contact_person, kitchen_styles, material_keys,
  manufacturing_days_min, manufacturing_days_max, warranty_terms, partnership_status,
  commission_rate, is_public, is_test_data, notes
) values (
  '00000000-0000-4000-8000-000000000001',
  'مصنع تجريبي أ (بيانات اختبار)', 'الرياض', 'عنوان اختبار — ليس عنواناً حقيقياً', '+966500000099',
  'مسؤول اختبار', array['modern','minimal','neo_classic'], array['mdf','acrylic','lacquer','quartz'],
  20, 35, 'ضمان اختبار — ليس شروطاً حقيقية', 'active', 12, false, true,
  'سجل اختبار لتجربة محرك التسعير والإسناد فقط'
);

-- أسعار اختبار (أرقام افتراضية لاختبار الحاسبة فقط — ليست أسعار سوق)
insert into public.manufacturer_prices (manufacturer_id, item_type, product_id, pricing_unit, price_min, price_max, is_test_data)
select '00000000-0000-4000-8000-000000000001', 'product', p.id, p.default_pricing_unit, v.min, v.max, true
from public.products p
join (values
  ('base_cabinets', 1000.00, 1500.00),
  ('wall_cabinets', 700.00, 1100.00),
  ('tall_units', 1500.00, 2500.00),
  ('island_unit', 4000.00, 7000.00),
  ('delivery', 300.00, 500.00),
  ('installation', 1000.00, 1800.00)
) as v(key, min, max) on v.key = p.key;

insert into public.manufacturer_prices (manufacturer_id, item_type, material_id, pricing_unit, price_min, price_max, is_test_data)
select '00000000-0000-4000-8000-000000000001', 'material', m.id, v.unit::public.pricing_unit, v.min, v.max, true
from public.materials m
join (values
  ('mdf', 'linear_meter', 0.00, 0.00),
  ('acrylic', 'linear_meter', 200.00, 350.00),
  ('lacquer', 'linear_meter', 300.00, 500.00),
  ('quartz', 'linear_meter', 600.00, 900.00)
) as v(key, unit, min, max) on v.key = m.key;
