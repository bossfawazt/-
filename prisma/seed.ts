/**
 * Development seed data.
 *
 * Populates: RBAC (roles/permissions), the region tree, the abaya taxonomy
 * (category + attributes + options), a handful of realistic supplier/merchant
 * organizations with users, a small product catalog with variants/pricing,
 * and one full RFQ -> quote -> order -> review chain so every screen built
 * in Phases 6-11 has real data to render against.
 *
 * Run with: pnpm db:seed
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, ProductStatus } from "../src/generated/prisma/client";
import { ABAYA_ATTRIBUTES, REGIONS_SEED, ROOT_CATEGORY_SLUG } from "../src/lib/taxonomy";
import { PERMISSIONS, ROLE_DESCRIPTIONS, ROLE_PERMISSIONS, ROLES } from "../src/lib/rbac";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

const DEV_PASSWORD = "Passw0rd!123";

function placeholderImage(label: string, w = 800, h = 1000) {
  return `https://placehold.co/${w}x${h}/f8f4ee/201d1a?text=${encodeURIComponent(label)}`;
}

async function seedRbac() {
  console.log("Seeding roles & permissions...");

  const permissionRecords = await Promise.all(
    Object.values(PERMISSIONS).map((key) =>
      db.permission.upsert({
        where: { key },
        update: {},
        create: { key },
      }),
    ),
  );
  const permissionByKey = new Map(permissionRecords.map((p) => [p.key, p]));

  for (const roleName of Object.values(ROLES)) {
    const scope = roleName === ROLES.SUPER_ADMIN || roleName === ROLES.OPS_ADMIN ? "PLATFORM" : "ORGANIZATION";
    const role = await db.role.upsert({
      where: { name: roleName },
      update: { description: ROLE_DESCRIPTIONS[roleName], scope },
      create: { name: roleName, scope, description: ROLE_DESCRIPTIONS[roleName] },
    });

    for (const permissionKey of ROLE_PERMISSIONS[roleName]) {
      const permission = permissionByKey.get(permissionKey);
      if (!permission) continue;
      await db.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
        update: {},
        create: { roleId: role.id, permissionId: permission.id },
      });
    }
  }
}

async function seedRegions() {
  console.log("Seeding regions...");
  const country = await db.region.create({
    data: { nameAr: REGIONS_SEED.countryAr, nameEn: REGIONS_SEED.countryEn },
  });
  const cities = new Map<string, string>();
  for (const city of REGIONS_SEED.cities) {
    const record = await db.region.create({
      data: { nameAr: city.nameAr, nameEn: city.nameEn, parentId: country.id },
    });
    cities.set(city.key, record.id);
  }
  return cities;
}

async function seedTaxonomy() {
  console.log("Seeding abaya taxonomy...");
  const category = await db.category.create({
    data: { slug: ROOT_CATEGORY_SLUG, nameAr: "عباية", nameEn: "Abaya" },
  });

  const attributeIdByKey = new Map<string, string>();
  const optionIdByKey = new Map<string, string>(); // "attrKey:optionKey" -> id

  for (const [index, attribute] of ABAYA_ATTRIBUTES.entries()) {
    const definition = await db.attributeDefinition.create({
      data: {
        categoryId: category.id,
        key: attribute.key,
        labelAr: attribute.labelAr,
        labelEn: attribute.labelEn,
        type: attribute.type,
        isFilterable: attribute.isFilterable,
        sortOrder: index,
      },
    });
    attributeIdByKey.set(attribute.key, definition.id);

    for (const [optIndex, option] of (attribute.options ?? []).entries()) {
      const optionRecord = await db.attributeOption.create({
        data: {
          attributeDefinitionId: definition.id,
          key: option.key,
          valueAr: option.valueAr,
          valueEn: option.valueEn,
          sortOrder: optIndex,
        },
      });
      optionIdByKey.set(`${attribute.key}:${option.key}`, optionRecord.id);
    }
  }

  return { category, attributeIdByKey, optionIdByKey };
}

async function seedOrganizationWithOwner(params: {
  type: "SUPPLIER" | "MERCHANT";
  legalNameAr: string;
  legalNameEn: string;
  regionId: string;
  city: string;
  descriptionAr: string;
  ownerName: string;
  ownerPhone: string;
  ratingAvg?: number;
  ratingCount?: number;
  responseTimeAvgMinutes?: number;
}) {
  const passwordHash = await bcrypt.hash(DEV_PASSWORD, 10);
  const owner = await db.user.create({
    data: {
      name: params.ownerName,
      phone: params.ownerPhone,
      passwordHash,
      phoneVerifiedAt: new Date(),
    },
  });

  const ownerRole = await db.role.findUniqueOrThrow({ where: { name: ROLES.ORG_OWNER } });

  const organization = await db.organization.create({
    data: {
      type: params.type,
      legalNameAr: params.legalNameAr,
      legalNameEn: params.legalNameEn,
      crNumber: `CR-${Math.floor(1000000000 + Math.random() * 8999999999)}`,
      verificationStatus: "VERIFIED",
      status: "ACTIVE",
      regionId: params.regionId,
      city: params.city,
      descriptionAr: params.descriptionAr,
      ratingAvg: params.ratingAvg ?? 0,
      ratingCount: params.ratingCount ?? 0,
      responseTimeAvgMinutes: params.responseTimeAvgMinutes,
      members: {
        create: { userId: owner.id, roleId: ownerRole.id, status: "ACTIVE" },
      },
    },
  });

  return { organization, owner };
}

async function seedAdmin() {
  console.log("Seeding platform admin...");
  const passwordHash = await bcrypt.hash(DEV_PASSWORD, 10);
  const superAdminRole = await db.role.findUniqueOrThrow({ where: { name: ROLES.SUPER_ADMIN } });
  const admin = await db.user.create({
    data: {
      name: "عبدالله المشرف",
      phone: "+966500000001",
      passwordHash,
      phoneVerifiedAt: new Date(),
      mfaEnabled: true,
      platformRoles: { create: { roleId: superAdminRole.id } },
    },
  });
  return admin;
}

async function seedProduct(params: {
  supplierId: string;
  categoryId: string;
  attributeIdByKey: Map<string, string>;
  optionIdByKey: Map<string, string>;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  status: ProductStatus;
  attrs: Record<string, string>; // attrKey -> optionKey
  variants: Array<{
    color: string;
    size: string;
    moq: number;
    leadTimeDays: number;
    tiers: Array<{ minQty: number; maxQty?: number; unitPriceMinor: number }>;
  }>;
}) {
  const product = await db.product.create({
    data: {
      supplierId: params.supplierId,
      categoryId: params.categoryId,
      titleAr: params.titleAr,
      titleEn: params.titleEn,
      descriptionAr: params.descriptionAr,
      status: params.status,
      publishedAt: params.status === "LIVE" ? new Date() : null,
    },
  });

  for (const [attrKey, optionKey] of Object.entries(params.attrs)) {
    const attributeDefinitionId = params.attributeIdByKey.get(attrKey);
    const attributeOptionId = params.optionIdByKey.get(`${attrKey}:${optionKey}`);
    if (!attributeDefinitionId || !attributeOptionId) continue;
    await db.productAttributeValue.create({
      data: { productId: product.id, attributeDefinitionId, attributeOptionId },
    });
  }

  await db.productMedia.create({
    data: {
      productId: product.id,
      url: placeholderImage(params.titleEn),
      isPrimary: true,
      sortOrder: 0,
    },
  });

  const variantRecords = [];
  for (const variant of params.variants) {
    const variantRecord = await db.productVariant.create({
      data: {
        productId: product.id,
        color: variant.color,
        size: variant.size,
        moq: variant.moq,
        leadTimeDays: variant.leadTimeDays,
        pricingTiers: {
          create: variant.tiers.map((tier) => ({
            minQty: tier.minQty,
            maxQty: tier.maxQty,
            unitPriceMinor: tier.unitPriceMinor,
          })),
        },
      },
    });
    variantRecords.push(variantRecord);
  }

  return { product, variants: variantRecords };
}

async function main() {
  console.log("--- touq dev seed: start ---");

  await seedRbac();
  const cities = await seedRegions();
  const { category, attributeIdByKey, optionIdByKey } = await seedTaxonomy();
  await seedAdmin();

  const { organization: ummFaisal } = await seedOrganizationWithOwner({
    type: "SUPPLIER",
    legalNameAr: "ورشة أم فيصل للعبايات",
    legalNameEn: "Umm Faisal Abaya Workshop",
    regionId: cities.get("makkah")!,
    city: "مكة المكرمة",
    descriptionAr: "ورشة عائلية متخصصة في العبايات الكلاسيكية المطرزة يدويًا منذ أكثر من 15 عامًا.",
    ownerName: "أم فيصل",
    ownerPhone: "+966500000010",
    ratingAvg: 4.6,
    ratingCount: 38,
    responseTimeAvgMinutes: 90,
  });

  const { organization: abuTurki } = await seedOrganizationWithOwner({
    type: "SUPPLIER",
    legalNameAr: "مصنع أبو تركي للعبايات",
    legalNameEn: "Abu Turki Abaya Factory",
    regionId: cities.get("riyadh")!,
    city: "الرياض",
    descriptionAr: "مصنع متوسط الحجم في المدينة الصناعية الثانية بالرياض، طاقة إنتاجية عالية وجودة ثابتة.",
    ownerName: "أبو تركي",
    ownerPhone: "+966500000011",
    ratingAvg: 4.8,
    ratingCount: 112,
    responseTimeAvgMinutes: 35,
  });

  const { organization: baytReem } = await seedOrganizationWithOwner({
    type: "SUPPLIER",
    legalNameAr: "بيت ريم للأزياء",
    legalNameEn: "Bayt Reem Fashion House",
    regionId: cities.get("jeddah")!,
    city: "جدة",
    descriptionAr: "تصاميم عصرية بأقمشة مستوردة، متخصصون في العبايات المفتوحة والكيمونو.",
    ownerName: "ريم الحربي",
    ownerPhone: "+966500000012",
    ratingAvg: 4.3,
    ratingCount: 21,
    responseTimeAvgMinutes: 150,
  });

  const { organization: boutiqueSara } = await seedOrganizationWithOwner({
    type: "MERCHANT",
    legalNameAr: "بوتيك سارة",
    legalNameEn: "Sara Boutique",
    regionId: cities.get("riyadh")!,
    city: "الرياض",
    descriptionAr: "متجر أزياء نسائية عبر انستقرام وسناب شات.",
    ownerName: "سارة العتيبي",
    ownerPhone: "+966500000020",
  });

  const { organization: matjarNour } = await seedOrganizationWithOwner({
    type: "MERCHANT",
    legalNameAr: "متجر نور",
    legalNameEn: "Noor Store",
    regionId: cities.get("jeddah")!,
    city: "جدة",
    descriptionAr: "متجر إلكتروني على منصة سلة متخصص في العبايات.",
    ownerName: "نور القحطاني",
    ownerPhone: "+966500000021",
  });

  console.log("Seeding products...");

  await seedProduct({
    supplierId: ummFaisal.id,
    categoryId: category.id,
    attributeIdByKey,
    optionIdByKey,
    titleAr: "عباية ندى كلاسيكية مطرزة",
    titleEn: "Classic Nada Abaya - Embroidered",
    descriptionAr: "عباية كلاسيكية مغلقة من قماش الندى الفاخر مع تطريز يدوي على الأكمام.",
    status: "LIVE",
    attrs: { fabric: "nada", style: "classic", sleeve: "cuffed", color: "black", embroidery: "sleeve", category: "everyday", season: "transitional" },
    variants: [
      {
        color: "أسود",
        size: "One Size",
        moq: 10,
        leadTimeDays: 7,
        tiers: [
          { minQty: 10, maxQty: 49, unitPriceMinor: 12000 },
          { minQty: 50, maxQty: 99, unitPriceMinor: 10500 },
          { minQty: 100, unitPriceMinor: 9000 },
        ],
      },
    ],
  });

  const { product: butterflyProduct, variants: butterflyVariants } = await seedProduct({
    supplierId: abuTurki.id,
    categoryId: category.id,
    attributeIdByKey,
    optionIdByKey,
    titleAr: "عباية فراشة كريب زمردي",
    titleEn: "Emerald Crepe Butterfly Abaya",
    descriptionAr: "عباية مفتوحة بقصة الفراشة من الكريب الياباني، مثالية للمناسبات.",
    status: "LIVE",
    attrs: { fabric: "japanese_crepe", style: "open_farasha", sleeve: "wide_bell", color: "emerald", embroidery: "hem", category: "occasion", season: "summer" },
    variants: [
      {
        color: "زمردي",
        size: "52",
        moq: 20,
        leadTimeDays: 5,
        tiers: [
          { minQty: 20, maxQty: 49, unitPriceMinor: 15000 },
          { minQty: 50, maxQty: 149, unitPriceMinor: 13000 },
          { minQty: 150, unitPriceMinor: 11000 },
        ],
      },
      {
        color: "كحلي",
        size: "54",
        moq: 20,
        leadTimeDays: 5,
        tiers: [
          { minQty: 20, maxQty: 49, unitPriceMinor: 15000 },
          { minQty: 50, unitPriceMinor: 13000 },
        ],
      },
    ],
  });

  await seedProduct({
    supplierId: abuTurki.id,
    categoryId: category.id,
    attributeIdByKey,
    optionIdByKey,
    titleAr: "عباية شتوية بتطريز كامل",
    titleEn: "Winter Abaya - All-over Embroidery",
    descriptionAr: "عباية ثقيلة مناسبة للشتاء بتطريز شامل وقماش كوري فاخر.",
    status: "PENDING_REVIEW",
    attrs: { fabric: "korean", style: "classic", sleeve: "fitted", color: "burgundy", embroidery: "all_over", category: "occasion", season: "winter" },
    variants: [
      {
        color: "خمري",
        size: "One Size",
        moq: 15,
        leadTimeDays: 10,
        tiers: [{ minQty: 15, unitPriceMinor: 18000 }],
      },
    ],
  });

  await seedProduct({
    supplierId: baytReem.id,
    categoryId: category.id,
    attributeIdByKey,
    optionIdByKey,
    titleAr: "عباية كيمونو شيفون",
    titleEn: "Chiffon Kimono Abaya",
    descriptionAr: "عباية كيمونو خفيفة من الشيفون بألوان متعددة.",
    status: "LIVE",
    attrs: { fabric: "chiffon", style: "kimono", sleeve: "batwing", color: "beige", embroidery: "none", category: "everyday", season: "summer" },
    variants: [
      {
        color: "بيج",
        size: "Free Size",
        moq: 30,
        leadTimeDays: 12,
        tiers: [
          { minQty: 30, maxQty: 99, unitPriceMinor: 8000 },
          { minQty: 100, unitPriceMinor: 6500 },
        ],
      },
    ],
  });

  await db.product.create({
    data: {
      supplierId: baytReem.id,
      categoryId: category.id,
      titleAr: "عباية زفاف مطرزة بالكريستال (مسودة)",
      titleEn: "Bridal Abaya - Crystal Detailing (Draft)",
      descriptionAr: "لا تزال قيد التحرير.",
      status: "DRAFT",
    },
  });

  console.log("Seeding favorites...");
  await db.favorite.create({ data: { merchantId: boutiqueSara.id, supplierId: abuTurki.id } });
  await db.favorite.create({ data: { merchantId: boutiqueSara.id, productId: butterflyProduct.id } });

  console.log("Seeding a full RFQ -> quote -> order -> review chain...");
  const nourOwnerMembership = await db.organizationMember.findFirstOrThrow({
    where: { organizationId: matjarNour.id },
    include: { user: true },
  });
  const abuTurkiOwnerMembership = await db.organizationMember.findFirstOrThrow({
    where: { organizationId: abuTurki.id },
    include: { user: true },
  });

  const rfq = await db.rfq.create({
    data: {
      merchantId: matjarNour.id,
      supplierId: abuTurki.id,
      productId: butterflyProduct.id,
      variantId: butterflyVariants[0].id,
      requestedQty: 60,
      targetPriceMinor: 12500,
      customizationNotes: "هل يمكن التوصيل خلال 10 أيام بدلاً من 5؟",
      status: "ACCEPTED",
      messages: {
        create: [
          {
            senderUserId: nourOwnerMembership.userId,
            body: "مرحباً، هل يمكن الحصول على سعر أفضل لكمية 60 قطعة؟",
          },
          {
            senderUserId: abuTurkiOwnerMembership.userId,
            body: "أهلاً بك، بكل سرور. سأرسل عرض سعر الآن.",
          },
        ],
      },
    },
  });

  const quote = await db.quote.create({
    data: {
      rfqId: rfq.id,
      supplierId: abuTurki.id,
      quotedQty: 60,
      quotedUnitPriceMinor: 13000,
      leadTimeDays: 7,
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: "ACCEPTED",
    },
  });

  const order = await db.order.create({
    data: {
      rfqId: rfq.id,
      quoteId: quote.id,
      merchantId: matjarNour.id,
      supplierId: abuTurki.id,
      status: "COMPLETED",
      totalAmountMinor: quote.quotedUnitPriceMinor * quote.quotedQty,
      items: {
        create: {
          variantId: butterflyVariants[0].id,
          qty: 60,
          unitPriceMinor: quote.quotedUnitPriceMinor,
          subtotalMinor: quote.quotedUnitPriceMinor * 60,
        },
      },
      statusHistory: {
        create: [
          { toStatus: "CONFIRMED", changedByUserId: nourOwnerMembership.userId, note: "تم إنشاء الطلب من عرض السعر المقبول." },
          { fromStatus: "CONFIRMED", toStatus: "IN_PRODUCTION", changedByUserId: abuTurkiOwnerMembership.userId },
          { fromStatus: "IN_PRODUCTION", toStatus: "SHIPPED", changedByUserId: abuTurkiOwnerMembership.userId, note: "شركة الشحن: سمسا" },
          { fromStatus: "SHIPPED", toStatus: "DELIVERED", changedByUserId: nourOwnerMembership.userId },
          { fromStatus: "DELIVERED", toStatus: "COMPLETED", changedByUserId: nourOwnerMembership.userId },
        ],
      },
    },
  });

  await db.review.create({
    data: {
      orderId: order.id,
      merchantId: matjarNour.id,
      supplierId: abuTurki.id,
      rating: 5,
      comment: "تعامل احترافي وسرعة في التسليم، الجودة مطابقة تمامًا للصور.",
    },
  });

  await db.notificationEvent.create({
    data: {
      userId: abuTurkiOwnerMembership.userId,
      eventType: "rfq.created",
      channel: "IN_APP",
      title: "طلب شراء جديد",
      body: "أرسل متجر نور طلب شراء لعباية فراشة كريب زمردي.",
      linkUrl: `/supplier/rfqs/${rfq.id}`,
      status: "READ",
      readAt: new Date(),
    },
  });
  await db.notificationEvent.create({
    data: {
      userId: nourOwnerMembership.userId,
      eventType: "order.status_changed",
      channel: "IN_APP",
      title: "تم تسليم طلبك",
      body: "تم تسليم طلبك من مصنع أبو تركي للعبايات بنجاح.",
      linkUrl: `/merchant/orders/${order.id}`,
      status: "SENT",
    },
  });

  console.log("--- touq dev seed: done ---");
  console.log(`Dev login password for every seeded user: ${DEV_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
