import type { Metadata } from "next";
import { ImageStudioClient } from "@/features/ai/components/image-studio-client";

export const metadata: Metadata = { title: "استوديو الصور" };

export default function ImageStudioPage() {
  return <ImageStudioClient />;
}
