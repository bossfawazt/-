import { ABAYA_ATTRIBUTES } from "@/lib/taxonomy";
import type {
  AiProvider,
  ImageStudioMode,
  ImageVariantResult,
  MarketingKitInput,
  MarketingKitResult,
  ProductImageSuggestion,
} from "@/server/ai/provider";

/**
 * Deterministic Mock AI provider. No model call happens here — outputs are
 * built from the real taxonomy (src/lib/taxonomy.ts) so suggestions are
 * always valid, editable starting points, never invented category/attribute
 * keys. Every result carries an honest label so the UI never claims real
 * model inference occurred (docs/AI-SYSTEM-touq.md, user requirement:
 * "لا تدعي أن معالجة حقيقية بالذكاء الاصطناعي تحدث إذا لم تكن مرتبطة بمزود AI").
 */

function hashSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function pick<T>(items: T[], seed: number, salt: number): T {
  return items[(seed + salt) % items.length];
}

function optionsOf(key: string) {
  const def = ABAYA_ATTRIBUTES.find((a) => a.key === key);
  return def?.options ?? [];
}

async function simulateLatency(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

const SIZE_SETS = [
  ["50", "52", "54"],
  ["50", "52", "54", "56"],
  ["52", "54", "56", "58"],
];

export class MockAiProvider implements AiProvider {
  readonly name = "mock";

  async analyzeProductImage(imageUrl: string): Promise<ProductImageSuggestion> {
    await simulateLatency(700);
    const seed = hashSeed(imageUrl);

    const fabric = pick(optionsOf("fabric"), seed, 1);
    const style = pick(optionsOf("style"), seed, 2);
    const sleeve = pick(optionsOf("sleeve"), seed, 3);
    const color = pick(optionsOf("color"), seed, 4);
    const embroidery = pick(optionsOf("embroidery"), seed, 5);
    const category = pick(optionsOf("category"), seed, 6);
    const season = pick(optionsOf("season"), seed, 7);

    const titleAr = `عباية ${style.valueAr} ${color.valueAr} من ${fabric.valueAr}`;
    const titleEn = `${color.valueEn} ${style.valueEn} Abaya — ${fabric.valueEn}`;
    const embroideryPhrase = embroidery.key === "none" ? "بتصميم بسيط وأنيق دون تطريز" : `مزينة بتطريز ${embroidery.valueAr}`;

    return {
      titleAr,
      titleEn,
      descriptionAr: `عباية بقصة ${style.valueAr} من قماش ${fabric.valueAr} عالي الجودة، بأكمام ${sleeve.valueAr} ${embroideryPhrase}. مناسبة لـ${category.valueAr}.`,
      attributes: {
        fabric: fabric.key,
        style: style.key,
        sleeve: sleeve.key,
        color: color.key,
        embroidery: embroidery.key,
        category: category.key,
        season: season.key,
      },
      suggestedSizes: pick(SIZE_SETS, seed, 8),
      keywords: [style.valueAr, fabric.valueAr, color.valueAr, "عباية سعودية", "جملة عبايات"],
      confidence: 0.6 + (seed % 30) / 100,
    };
  }

  async processImage(imageUrl: string, modes: ImageStudioMode[]): Promise<ImageVariantResult[]> {
    await simulateLatency(900);
    const LABELS: Record<ImageStudioMode, { labelAr: string; note: string }> = {
      enhance: { labelAr: "تحسين الإضاءة والألوان", note: "معاينة Mock — تحسين تلقائي للسطوع والتباين والوضوح" },
      remove_bg: { labelAr: "إزالة الخلفية", note: "معاينة Mock — خلفية شفافة لعرض المنتج بمفرده" },
      luxury_bg: { labelAr: "خلفية فاخرة", note: "معاينة Mock — خلفية استوديو متدرجة بلمسة فاخرة" },
      social_crop: { labelAr: "قياس منصات التواصل", note: "معاينة Mock — قصّ مربع 1:1 لإنستغرام وتيك توك" },
    };

    return modes.map((mode) => ({
      mode,
      labelAr: LABELS[mode].labelAr,
      note: LABELS[mode].note,
      url: imageUrl,
    }));
  }

  async scanCatalogFile(fileUrl: string, fileName: string): Promise<ProductImageSuggestion[]> {
    await simulateLatency(1400);
    const seed = hashSeed(fileUrl + fileName);
    const count = 2 + (seed % 3); // 2-4 drafts per file, mimicking a multi-page/multi-image source

    const results: ProductImageSuggestion[] = [];
    for (let i = 0; i < count; i++) {
      results.push(await this.analyzeProductImage(`${fileUrl}#${i}`));
    }
    return results;
  }

  async generateMarketingKit(input: MarketingKitInput): Promise<MarketingKitResult> {
    await simulateLatency(600);
    const priceLabel = (input.priceFromMinor / 100).toFixed(0);
    const hashBase = [input.attributes.style, input.attributes.fabric, "عبايات_جملة", "توق"]
      .filter(Boolean)
      .map((tag) => tag.replace(/\s+/g, "_"));

    return {
      shortDescriptionAr: `${input.titleAr} — جودة جملة موثوقة بأسعار تنافسية تبدأ من ${priceLabel} ر.س.`,
      longDescriptionAr:
        input.descriptionAr ??
        `${input.titleAr}. منتج متوفر للطلب بالجملة بحد أدنى ${input.moq} قطعة، مثالي لمتاجر العبايات الإلكترونية الباحثة عن جودة واستجابة سريعة.`,
      instagramCaption: `✨ ${input.titleAr}\nمتوفرة الآن للطلب بالجملة عبر منصة توق.\n#عبايات #جملة_عبايات #موضة_سعودية`,
      tiktokCaption: `شحنة جديدة وصلت 🖤 ${input.titleAr} — اطلبيها بالجملة الآن على توق`,
      whatsappMessage: `مرحبًا، أعرض لكم ${input.titleAr} بسعر يبدأ من ${priceLabel} ر.س للقطعة (الحد الأدنى للطلب ${input.moq} قطعة). للتفاصيل والطلب تواصلوا معنا عبر منصة توق.`,
      hashtags: hashBase.map((tag) => `#${tag}`),
      seoTitle: `${input.titleAr} بالجملة | توق`,
      seoDescription: `اطلب ${input.titleAr} بالجملة من موردين موثقين على منصة توق. أسعار تنافسية بدءًا من ${priceLabel} ر.س، حد أدنى ${input.moq} قطعة.`,
    };
  }
}
