-- =============================================================================
-- معمار المنزل — 0009: الخيارات الافتراضية للكتالوج (بدون أسعار)
-- هذه إعدادات منتج حقيقية قابلة للتعديل من لوحة الإدارة، وليست بيانات تجريبية.
-- الأسعار لا تُضاف هنا إطلاقاً: يدخلها المدير لكل مصنع.
-- =============================================================================

insert into public.design_options (category, key, name_ar, description_ar, hex_color, prompt_hint, sort_order) values
  ('style', 'modern', 'مودرن', 'خطوط مستقيمة وواجهات ناعمة بدون زخارف', null, 'modern kitchen, flat slab handleless doors, clean lines', 1),
  ('style', 'classic', 'كلاسيك', 'واجهات بإطارات وحليات وتفاصيل تقليدية', null, 'classic kitchen, raised panel doors, decorative moldings, crown molding', 2),
  ('style', 'neo_classic', 'نيو كلاسيك', 'مزيج بين بساطة المودرن وأناقة الكلاسيك', null, 'neoclassical kitchen, shaker doors, refined moldings, elegant brass details', 3),
  ('style', 'minimal', 'مينيمال', 'أقل عدد من العناصر ومساحات هادئة', null, 'minimalist kitchen, seamless handleless fronts, hidden appliances, calm uncluttered surfaces', 4),
  ('style', 'luxury', 'فاخر', 'خامات فاخرة وإضاءة مدروسة وتفاصيل مميزة', null, 'luxury kitchen, premium finishes, statement lighting, marble accents, gold details', 5),

  ('color', 'white', 'أبيض', null, '#F5F3EE', 'warm white cabinets', 1),
  ('color', 'beige', 'بيج', null, '#D9CBB4', 'soft beige cabinets', 2),
  ('color', 'grey', 'رمادي', null, '#9A9A96', 'stone grey cabinets', 3),
  ('color', 'black', 'أسود', null, '#232220', 'matte black cabinets', 4),
  ('color', 'wood', 'خشبي', null, '#9C6B43', 'natural oak wood cabinets', 5),
  ('color', 'green', 'أخضر', null, '#3F5A4A', 'deep sage green cabinets', 6),

  ('addon', 'interior_lighting', 'إضاءة داخلية', 'إضاءة LED داخل الخزائن وتحتها', null, 'under-cabinet LED strip lighting', 1),
  ('addon', 'smart_drawers', 'أدراج ذكية', 'أدراج بإغلاق هادئ وتنظيم داخلي', null, 'soft-close organized drawers', 2),
  ('addon', 'storage_baskets', 'سلال تخزين', 'سلال سحب للبهارات والأواني', null, 'pull-out storage baskets', 3),
  ('addon', 'corner_units', 'وحدات زاوية', 'حلول استغلال الزوايا (ماجيك كورنر)', null, 'corner carousel storage unit', 4),
  ('addon', 'center_island', 'جزيرة وسطية', 'جزيرة وسط المطبخ للتحضير أو الجلوس', null, 'kitchen center island', 5),
  ('addon', 'handles_accessories', 'مقابض وإكسسوارات', 'مقابض مميزة وإكسسوارات معدنية', null, 'designer metal handles', 6);

insert into public.materials (kind, key, name_ar, description_ar, prompt_hint, sort_order) values
  ('cabinet', 'mdf', 'MDF', 'ألواح خشب مضغوط بتشطيبات متنوعة', 'MDF cabinet fronts', 1),
  ('cabinet', 'solid_wood', 'خشب طبيعي', 'خشب طبيعي متين بعروق ظاهرة', 'solid natural wood cabinet fronts with visible grain', 2),
  ('cabinet', 'aluminum', 'ألمنيوم', 'مقاوم للرطوبة والحرارة', 'aluminum framed cabinet fronts', 3),
  ('cabinet', 'acrylic', 'أكريليك', 'لمعان عالٍ وسطح أملس', 'high-gloss acrylic cabinet fronts', 4),
  ('cabinet', 'lacquer', 'لاكر', 'دهان بخ ناعم مطفي أو لامع', 'lacquered painted cabinet fronts', 5),
  ('countertop', 'quartz', 'كوارتز', 'سطح صلب سهل التنظيف', 'quartz countertop', 1),
  ('countertop', 'marble', 'رخام', 'رخام طبيعي بعروق مميزة', 'natural marble countertop with veining', 2),
  ('countertop', 'granite', 'جرانيت', 'متين ومقاوم للحرارة', 'granite countertop', 3),
  ('countertop', 'porcelain', 'بورسلان', 'ألواح بورسلان رقيقة ومقاومة', 'large-format porcelain slab countertop', 4);

insert into public.appliances (key, name_ar, prompt_hint, sort_order) values
  ('oven', 'فرن', 'built-in oven', 1),
  ('cooktop', 'موقد', 'built-in cooktop', 2),
  ('hood', 'شفاط', 'range hood', 3),
  ('dishwasher', 'غسالة صحون', 'integrated dishwasher', 4),
  ('refrigerator', 'ثلاجة', 'refrigerator', 5),
  ('microwave', 'ميكروويف', 'built-in microwave', 6);

insert into public.products (kind, key, name_ar, description_ar, default_pricing_unit, sort_order) values
  ('base_cabinet', 'base_cabinets', 'خزائن سفلية', 'تُسعّر بالمتر الطولي', 'linear_meter', 1),
  ('wall_cabinet', 'wall_cabinets', 'خزائن علوية', 'تُسعّر بالمتر الطولي', 'linear_meter', 2),
  ('tall_unit', 'tall_units', 'وحدات أعمدة', 'تُسعّر بالوحدة', 'unit', 3),
  ('island', 'island_unit', 'جزيرة', 'تُسعّر بالوحدة', 'unit', 4),
  ('service', 'manufacturing', 'التصنيع', 'تكلفة التصنيع إن كانت منفصلة', 'fixed', 5),
  ('service', 'delivery', 'النقل', 'نقل الوحدات للموقع', 'fixed', 6),
  ('service', 'installation', 'التركيب', 'تركيب المطبخ في الموقع', 'installation', 7);
