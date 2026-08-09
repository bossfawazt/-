import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiError, apiOk } from "@/lib/api-response";

/** Recent AI job history for the supplier's /supplier/ai hub. */
export async function GET() {
  const session = await auth();
  if (session?.user.organization?.type !== "SUPPLIER") return apiError("forbidden", "متاح للموردين فقط", 403);

  const jobs = await db.aiJob.findMany({
    where: { supplierId: session.user.organization.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: { id: true, type: true, status: true, provider: true, createdAt: true, errorMessage: true, _count: { select: { results: true } } },
  });

  return apiOk(
    jobs.map((j) => ({
      id: j.id,
      type: j.type,
      status: j.status,
      provider: j.provider,
      createdAt: j.createdAt.toISOString(),
      errorMessage: j.errorMessage,
      resultCount: j._count.results,
    })),
  );
}
