import { IBM_Plex_Sans_Arabic, Inter, Marcellus, Noto_Kufi_Arabic } from "next/font/google";

/**
 * Font pairing per docs/UIUX-touq.md #A.3.
 * Arabic (default) uses the Kufi/Plex Sans Arabic pairing; English swaps to
 * Marcellus/Inter. Both pairs are always loaded (small, self-hosted via
 * next/font) so switching locale never triggers a font-loading flash.
 */

export const notoKufiArabic = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  weight: ["500", "600", "700"],
  variable: "--font-noto-kufi-arabic",
  display: "swap",
});

export const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex-sans-arabic",
  display: "swap",
});

export const marcellus = Marcellus({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-marcellus",
  display: "swap",
});

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const fontVariables = [
  notoKufiArabic.variable,
  ibmPlexSansArabic.variable,
  marcellus.variable,
  inter.variable,
].join(" ");
