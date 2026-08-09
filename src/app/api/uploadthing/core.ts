import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const f = createUploadthing();

async function requireOrgSession() {
  const session = await auth();
  if (!session?.user.organization) {
    throw new UploadThingError("Unauthorized");
  }
  return session;
}

/**
 * UploadThing file router. Two endpoints for now:
 * - verificationDocument: CR/Maroof documents (docs/UIUX-touq.md #C.12 onboarding)
 * - productImage: catalog media, wired up for Phase 8 (Supplier catalog CRUD)
 *
 * Requires UPLOADTHING_TOKEN to be set (.env.example) — the integration is
 * fully wired, but uploads will fail against a placeholder/empty token
 * until a real UploadThing project is connected.
 */
export const ourFileRouter = {
  verificationDocument: f({ pdf: { maxFileSize: "8MB", maxFileCount: 3 }, image: { maxFileSize: "8MB", maxFileCount: 3 } })
    .middleware(async () => {
      const session = await requireOrgSession();
      return { organizationId: session.user.organization!.id, userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await db.verificationDocument.create({
        data: {
          organizationId: metadata.organizationId,
          docType: "cr_certificate",
          fileUrl: file.ufsUrl,
        },
      });
      return { uploadedBy: metadata.userId };
    }),

  productImage: f({ image: { maxFileSize: "4MB", maxFileCount: 10 } })
    .middleware(async () => {
      const session = await requireOrgSession();
      if (session.user.organization!.type !== "SUPPLIER") {
        throw new UploadThingError("Only suppliers can upload product images");
      }
      return { organizationId: session.user.organization!.id };
    })
    .onUploadComplete(async ({ file }) => {
      // Persisted to product_media once the caller knows the product id
      // (Phase 8's product form calls the products API with this URL).
      return { url: file.ufsUrl };
    }),

  /** AI Catalog Scanner (Phase 13): images, PDFs, or a zipped batch of photos. */
  catalogSourceFile: f({
    image: { maxFileSize: "8MB", maxFileCount: 10 },
    pdf: { maxFileSize: "16MB", maxFileCount: 5 },
    blob: { maxFileSize: "32MB", maxFileCount: 3 },
  })
    .middleware(async () => {
      const session = await requireOrgSession();
      if (session.user.organization!.type !== "SUPPLIER") {
        throw new UploadThingError("Only suppliers can upload catalog files");
      }
      return { organizationId: session.user.organization!.id };
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl, name: file.name };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
