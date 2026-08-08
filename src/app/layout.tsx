import type { Metadata } from "next";
import { Toaster } from "sonner";
import { fontVariables } from "@/config/fonts";
import { QueryProvider } from "@/providers/query-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "توق | Touq — سوق الجملة للعبايات",
    template: "%s | توق",
  },
  description:
    "منصة B2B تربط موردي العبايات بالتجار الإلكترونيين في المملكة العربية السعودية.",
};

/**
 * Arabic is the default, native locale (docs/UIUX-touq.md #A.4) — the
 * document renders RTL out of the box. English is the mirrored, secondary
 * experience, switched via the language toggle (see components/layout).
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ar" dir="rtl" className={`${fontVariables} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <QueryProvider>
          {children}
          <Toaster
            position="top-center"
            dir="rtl"
            toastOptions={{
              classNames: {
                toast: "font-sans",
              },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}
