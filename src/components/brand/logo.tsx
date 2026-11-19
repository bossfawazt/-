import Link from "next/link";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

/** علامة معمار المنزل: قوس معماري يضم خطوط خزائن — بيت يُصمَّم قبل أن يُبنى */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("size-9", className)} aria-hidden>
      <rect width="40" height="40" rx="11" fill="var(--green)" />
      <path
        d="M11 31V18.5C11 13.25 15.03 9 20 9s9 4.25 9 9.5V31"
        fill="none"
        stroke="#F3EEE4"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path d="M15 22.5h10M15 26.75h10" stroke="#C9A97F" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M8 31h24" stroke="#F3EEE4" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ className, showTagline = false }: { className?: string; showTagline?: boolean }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5 rounded-lg", className)} aria-label={siteConfig.name}>
      <LogoMark />
      <span className="flex flex-col leading-tight">
        <span className="text-lg font-bold text-foreground">{siteConfig.name}</span>
        {showTagline ? <span className="text-xs text-muted-foreground">{siteConfig.tagline}</span> : null}
      </span>
    </Link>
  );
}
