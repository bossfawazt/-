import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  Boxes,
  Building2,
  Heart,
  LayoutGrid,
  MessageSquareText,
  Package,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Users,
} from "lucide-react";

export const site = {
  name: "توق",
  nameEn: "Touq",
  description: "منصة B2B تربط موردي العبايات بالتجار الإلكترونيين في المملكة العربية السعودية.",
};

/** docs/UIUX-touq.md #B.1: public header nav links. */
export const publicNav = [
  { label: "السوق", href: "/marketplace" },
  { label: "الموردون", href: "/suppliers" },
  { label: "كيف تعمل المنصة", href: "/#how-it-works" },
];

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

/**
 * Role-scoped sidebar nav (docs/UIUX-touq.md #B.3). Each item links only to
 * a route that actually exists at this point in the build — the full
 * UIUX spec's sidebar lists a couple of items (Messages, Reviews, Insights)
 * that don't have a dedicated screen in this build's 11-phase scope; RFQ
 * messaging lives inside the RFQ detail thread instead of a standalone inbox.
 */
export const merchantNav: NavItem[] = [
  { label: "الرئيسية", href: "/merchant", icon: LayoutGrid },
  { label: "السوق", href: "/marketplace", icon: Store },
  { label: "طلبات الشراء", href: "/merchant/requests", icon: MessageSquareText },
  { label: "الطلبات", href: "/merchant/orders", icon: ShoppingBag },
  { label: "المفضلة", href: "/merchant/favorites", icon: Heart },
  { label: "الإشعارات", href: "/notifications", icon: Bell },
  { label: "الإعدادات", href: "/settings", icon: Settings },
];

export const supplierNav: NavItem[] = [
  { label: "الرئيسية", href: "/supplier", icon: LayoutGrid },
  { label: "منتجاتي", href: "/supplier/products", icon: Package },
  { label: "طلبات الشراء الواردة", href: "/supplier/rfqs", icon: MessageSquareText },
  { label: "الطلبات", href: "/supplier/orders", icon: ShoppingBag },
  { label: "أدوات الذكاء الاصطناعي", href: "/supplier/ai", icon: Sparkles },
  { label: "الإشعارات", href: "/notifications", icon: Bell },
  { label: "الإعدادات", href: "/settings", icon: Settings },
];

export const adminNav: NavItem[] = [
  { label: "نظرة عامة", href: "/admin", icon: LayoutGrid },
  { label: "طلبات التوثيق", href: "/admin/verification", icon: ShieldCheck },
  { label: "مراجعة المنتجات", href: "/admin/moderation", icon: Boxes },
  { label: "المستخدمون والمنشآت", href: "/admin/organizations", icon: Users },
  { label: "الطلبات والنزاعات", href: "/admin/orders", icon: ShoppingBag },
  { label: "التقارير", href: "/admin/reports", icon: BarChart3 },
];

/** Bottom tab bar for Merchant/Supplier on mobile (docs/UIUX-touq.md #B.3) — 5 items max. */
export const merchantMobileNav: NavItem[] = [
  { label: "الرئيسية", href: "/merchant", icon: LayoutGrid },
  { label: "السوق", href: "/marketplace", icon: Store },
  { label: "الطلبات", href: "/merchant/requests", icon: MessageSquareText },
  { label: "المفضلة", href: "/merchant/favorites", icon: Heart },
  { label: "حسابي", href: "/settings", icon: Building2 },
];

export const supplierMobileNav: NavItem[] = [
  { label: "الرئيسية", href: "/supplier", icon: LayoutGrid },
  { label: "منتجاتي", href: "/supplier/products", icon: Package },
  { label: "الطلبات", href: "/supplier/rfqs", icon: MessageSquareText },
  { label: "الطلبات", href: "/supplier/orders", icon: ShoppingBag },
  { label: "حسابي", href: "/settings", icon: Building2 },
];
