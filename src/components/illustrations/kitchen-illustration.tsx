import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * رسم توضيحي متجهي لمطبخ (منظر أمامي) يتغير حسب النمط واللون والسطح.
 * يُستخدم في الواجهة والمعرض كتصور توضيحي فقط — ليس ناتج ذكاء اصطناعي وليس مخططاً تنفيذياً.
 */
export type KitchenStyle = "modern" | "classic" | "neo_classic" | "minimal" | "luxury";
export type CountertopKind = "quartz" | "marble" | "granite" | "wood";

export type KitchenIllustrationProps = {
  style?: KitchenStyle;
  cabinetColor?: string;
  upperColor?: string;
  countertop?: CountertopKind;
  wallColor?: string;
  withIsland?: boolean;
  withLighting?: boolean;
  className?: string;
  title?: string;
};

function clamp(n: number) {
  return Math.max(0, Math.min(255, Math.round(n)));
}

/** تفتيح (+) أو تغميق (-) لون سداسي */
export function shade(hex: string, amount: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const t = amount < 0 ? 0 : 255;
  const p = Math.abs(amount);
  return `#${[r, g, b].map((c) => clamp(c + (t - c) * p).toString(16).padStart(2, "0")).join("")}`;
}

function luminance(hex: string) {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const COUNTERTOPS: Record<CountertopKind, { top: string; splash: string }> = {
  quartz: { top: "#ECE7DF", splash: "#F1ECE4" },
  marble: { top: "#F3F0EB", splash: "#F5F2ED" },
  granite: { top: "#5F5B57", splash: "#E8E2D8" },
  wood: { top: "#A87B52", splash: "#EFE8DD" },
};

export function KitchenIllustration({
  style = "modern",
  cabinetColor = "#F2EEE7",
  upperColor,
  countertop = "quartz",
  wallColor = "#ECE5DA",
  withIsland = true,
  withLighting = true,
  className,
  title = "رسم توضيحي لمطبخ",
}: KitchenIllustrationProps) {
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const id = (s: string) => `k${rawId}-${s}`;

  const upper = upperColor ?? cabinetColor;
  const isDark = luminance(cabinetColor) < 0.35;
  const line = isDark ? shade(cabinetColor, 0.18) : shade(cabinetColor, -0.14);
  const upperLine = luminance(upper) < 0.35 ? shade(upper, 0.18) : shade(upper, -0.14);
  const panel = isDark ? shade(cabinetColor, 0.06) : shade(cabinetColor, -0.05);
  const ct = COUNTERTOPS[countertop];
  const handle =
    style === "luxury" ? "#B89157" : style === "classic" || style === "neo_classic" ? "#9C7A52" : isDark ? "#C9C2B6" : "#4A4A46";
  const framed = style === "classic" || style === "neo_classic";
  const handleless = style === "minimal" || style === "modern";
  const veins = countertop === "marble" || style === "luxury";

  // باب خزانة مع حشوة (كلاسيك) أو سطح أملس
  const door = ({ k, x, y, w, h, color, stroke, knob }: { k?: string | number; x: number; y: number; w: number; h: number; color: string; stroke: string; knob?: "top" | "bottom" | "center" }) => (
    <g key={k}>
      <rect x={x + 2} y={y + 2} width={w - 4} height={h - 4} rx={style === "minimal" ? 1 : 2} fill={color} stroke={stroke} strokeWidth={1.2} />
      {framed ? (
        <rect x={x + 10} y={y + 10} width={w - 20} height={h - 20} rx={style === "classic" ? 6 : 1.5} fill={panel} stroke={stroke} strokeWidth={1} opacity={0.9} />
      ) : null}
      {handleless ? null : knob === "center" ? (
        <rect x={x + w / 2 - 14} y={y + 12} width={28} height={4} rx={2} fill={handle} />
      ) : framed && style === "classic" ? (
        <circle cx={x + w - 14} cy={knob === "top" ? y + 18 : y + h - 18} r={3.4} fill={handle} />
      ) : (
        <rect x={x + w - 12} y={knob === "top" ? y + 12 : y + h - 42} width={4} height={30} rx={2} fill={handle} />
      )}
    </g>
  );

  const baseTop = 346;
  const baseH = 108;

  return (
    <svg viewBox="0 0 800 560" role="img" aria-label={title} className={cn("h-auto w-full", className)}>
      <defs>
        <linearGradient id={id("wall")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={shade(wallColor, 0.12)} />
          <stop offset="1" stopColor={wallColor} />
        </linearGradient>
        <linearGradient id={id("sky")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#DCE6E4" />
          <stop offset="1" stopColor="#F4EFE6" />
        </linearGradient>
        <linearGradient id={id("floor")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#D8CCB9" />
          <stop offset="1" stopColor="#E6DCCD" />
        </linearGradient>
        <radialGradient id={id("glow")} cx="0.5" cy="0" r="0.9">
          <stop offset="0" stopColor="#FFE9C2" stopOpacity="0.75" />
          <stop offset="1" stopColor="#FFE9C2" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id("shadow")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.12" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* الجدار والأرضية */}
      <rect width="800" height="560" fill={`url(#${id("wall")})`} />
      <rect y="470" width="800" height="90" fill={`url(#${id("floor")})`} />
      <rect y="470" width="800" height="2" fill="#000" opacity="0.06" />
      {style === "classic" || style === "luxury" ? <rect y="30" width="800" height="10" fill={shade(wallColor, 0.25)} /> : null}

      {/* النافذة */}
      <g>
        <rect x="338" y="96" width="144" height="172" rx={style === "classic" ? 4 : 2} fill={shade(wallColor, -0.12)} />
        <rect x="346" y="104" width="128" height="156" fill={`url(#${id("sky")})`} />
        <path d="M346 210 C 380 190, 420 196, 474 178 L474 260 L346 260 Z" fill="#B8C7B9" opacity="0.55" />
        <rect x="408" y="104" width="4" height="156" fill={shade(wallColor, -0.12)} />
        <rect x="346" y="180" width="128" height="3" fill={shade(wallColor, -0.12)} />
      </g>

      {/* الواجهة الخلفية بين الخزائن */}
      <rect x="140" y="250" width="620" height="96" fill={ct.splash} />
      {veins ? (
        <g stroke="#CFC6B8" strokeWidth="1" fill="none" opacity="0.7">
          <path d="M150 300 C 220 270, 260 330, 330 290" />
          <path d="M490 270 C 540 300, 600 260, 690 300 S 740 280, 760 300" />
          <path d="M160 335 C 200 320, 240 340, 300 322" />
        </g>
      ) : null}

      {/* عمود طويل (ثلاجة/مخزن) */}
      <g>
        <rect x="48" y="58" width="94" height="412" fill={shade(upper, -0.04)} />
        {door({ x: 48, y: 58, w: 94, h: 140, color: upper, stroke: upperLine, knob: "bottom" })}
        {door({ x: 48, y: 198, w: 94, h: 258, color: cabinetColor, stroke: line, knob: "top" })}
        <rect x="48" y="456" width="94" height="14" fill={shade(cabinetColor, -0.3)} />
      </g>

      {/* الخزائن العلوية */}
      <g>
        {style === "classic" || style === "neo_classic" ? <rect x="140" y="80" width="190" height="10" fill={upperLine} /> : null}
        {[140, 235].map((x) => door({ k: x, x: x, y: 90, w: 95, h: 160, color: upper, stroke: upperLine, knob: "bottom" }))}
        {style === "classic" || style === "neo_classic" ? <rect x="644" y="80" width="116" height="10" fill={upperLine} /> : null}
        {door({ x: 644, y: 90, w: 116, h: 160, color: upper, stroke: upperLine, knob: "bottom" })}
        {/* رف مفتوح */}
        <rect x="490" y="150" width="40" height="5" fill={shade(upper, -0.2)} />
      </g>

      {/* الشفاط */}
      <g>
        <rect x="572" y="40" width="40" height="112" fill={style === "luxury" ? "#C9B28A" : shade(wallColor, -0.08)} />
        <path d="M542 152 H642 L630 196 H554 Z" fill={style === "luxury" ? "#BFA273" : shade(wallColor, -0.14)} />
        <rect x="554" y="194" width="76" height="4" fill="#000" opacity="0.15" />
      </g>

      {/* إضاءة أسفل الخزائن */}
      {withLighting ? (
        <g>
          <rect x="140" y="250" width="190" height="60" fill={`url(#${id("glow")})`} />
          <rect x="644" y="250" width="116" height="60" fill={`url(#${id("glow")})`} />
          <rect x="146" y="248" width="178" height="2" fill="#FFF3DA" />
          <rect x="650" y="248" width="104" height="2" fill="#FFF3DA" />
        </g>
      ) : null}

      {/* السطح */}
      <rect x="138" y={baseTop - 14} width="624" height="14" fill={ct.top} />
      <rect x="138" y={baseTop - 1} width="624" height="2" fill="#000" opacity="0.1" />

      {/* الحنفية والموقد ولمسات */}
      <g>
        <path d="M410 332 V300 Q410 290 420 290 H428" stroke="#6C6A66" strokeWidth="4" fill="none" strokeLinecap="round" />
        <rect x="548" y="328" width="88" height="4" rx="2" fill="#2B2A28" />
        <rect x="184" y="296" width="18" height="36" rx="8" fill="#E5DED2" stroke="#CDBFA8" />
        <path d="M193 296 C 186 276, 176 270, 172 262 M193 296 C 196 272, 206 266, 214 258 M193 296 C 192 280, 194 270, 192 256" stroke="#5E7A62" strokeWidth="3" fill="none" strokeLinecap="round" />
        <rect x="690" y="312" width="44" height="20" rx="3" fill={shade(cabinetColor, -0.08)} />
      </g>

      {/* الخزائن السفلية */}
      <g>
        <rect x="140" y={baseTop} width="620" height={baseH} fill={shade(cabinetColor, -0.03)} />
        {/* أدراج */}
        {[0, 1, 2].map((i) => door({ k: `d${i}`, x: 140, y: baseTop + i * 36, w: 100, h: 36, color: cabinetColor, stroke: line, knob: "center" }))}
        {door({ x: 240, y: baseTop, w: 100, h: baseH, color: cabinetColor, stroke: line, knob: "top" })}
        {door({ x: 340, y: baseTop, w: 70, h: baseH, color: cabinetColor, stroke: line, knob: "top" })}
        {door({ x: 410, y: baseTop, w: 70, h: baseH, color: cabinetColor, stroke: line, knob: "top" })}
        {door({ x: 480, y: baseTop, w: 60, h: baseH, color: cabinetColor, stroke: line, knob: "center" })}
        {/* الفرن */}
        <g>
          <rect x="542" y={baseTop + 4} width="96" height={baseH - 8} rx="3" fill="#2C2B29" />
          <rect x="552" y={baseTop + 26} width="76" height="58" rx="3" fill="#3F3D3A" />
          <rect x="560" y={baseTop + 12} width="60" height="4" rx="2" fill="#8D8A84" />
        </g>
        {[0, 1].map((i) => door({ k: `r${i}`, x: 640, y: baseTop + i * 54, w: 120, h: 54, color: cabinetColor, stroke: line, knob: "center" }))}
        {handleless ? (
          <rect x="140" y={baseTop + 2} width="400" height="3" fill="#000" opacity="0.12" />
        ) : null}
        <rect x="140" y={baseTop + baseH} width="620" height="16" fill={shade(cabinetColor, -0.3)} />
      </g>

      {/* الجزيرة */}
      {withIsland ? (
        <g>
          <ellipse cx="400" cy="530" rx="230" ry="14" fill="#000" opacity="0.08" />
          <rect x="196" y="404" width="408" height="16" fill={ct.top} />
          {countertop === "marble" || style === "luxury" ? (
            <rect x="196" y="404" width="16" height="122" fill={ct.top} />
          ) : null}
          <rect x="212" y="420" width="376" height="106" fill={shade(cabinetColor, -0.06)} />
          {[212, 306, 400, 494].map((x) => door({ k: `i${x}`, x: x, y: 420, w: 94, h: 106, color: shade(cabinetColor, -0.02), stroke: line, knob: "top" }))}
          {countertop === "marble" || style === "luxury" ? (
            <rect x="588" y="404" width="16" height="122" fill={ct.top} />
          ) : null}
          <rect x="196" y="419" width="408" height="10" fill={`url(#${id("shadow")})`} />
        </g>
      ) : null}

      {/* إضاءة معلقة */}
      {withIsland && withLighting ? (
        <g>
          {[310, 490].map((x) => (
            <g key={`p${x}`}>
              <rect x={x - 0.75} y="0" width="1.5" height="190" fill="#5B5852" />
              <path d={`M${x - 26} 214 Q ${x} 182 ${x + 26} 214 Z`} fill={style === "luxury" ? "#BFA273" : "#3D3C39"} />
              <ellipse cx={x} cy="216" rx="20" ry="4" fill="#FFF0D0" />
              <ellipse cx={x} cy="240" rx="60" ry="26" fill={`url(#${id("glow")})`} />
            </g>
          ))}
        </g>
      ) : null}
    </svg>
  );
}
