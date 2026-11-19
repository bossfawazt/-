import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CircleCheck } from "lucide-react";
import { PROJECT_STATUS_LABELS, PROPERTY_TYPE_LABELS, WIZARD_STEPS, WORK_TYPE_LABELS } from "@/features/projects/labels";
import { WizardSteps } from "@/features/projects/wizard-steps";
import { requireUser } from "@/lib/auth/session";
import { formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "تفاصيل المشروع" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function ProjectPage({ params, searchParams }: PageProps<"/account/projects/[projectId]">) {
  const { projectId } = await params;
  const { created } = await searchParams;
  await requireUser(`/account/projects/${projectId}`);
  if (!UUID.test(projectId)) notFound();

  // RLS: يعيد المشروع فقط إن كان المستخدم يملك صلاحية رؤيته
  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("id, name, city, district, property_type, work_type, description, status, current_step, created_at")
    .eq("id", projectId)
    .is("deleted_at", null)
    .maybeSingle();
  if (!project) notFound();

  const details = [
    ["المدينة", project.city],
    ["الحي", project.district ?? "—"],
    ["نوع العقار", PROPERTY_TYPE_LABELS[project.property_type]],
    ["نوع العمل", WORK_TYPE_LABELS[project.work_type]],
    ["الحالة", PROJECT_STATUS_LABELS[project.status]],
    ["تاريخ الإنشاء", formatDate(project.created_at)],
  ];

  return (
    <div className="container-page max-w-3xl py-8 sm:py-12">
      <Link href="/account" className="text-sm text-muted-foreground hover:text-foreground">
        → مشاريعي
      </Link>
      <div className="mt-4">
        <WizardSteps current={project.current_step} />
      </div>
      {created ? (
        <p role="status" className="mt-6 flex items-center gap-2 rounded-xl bg-[var(--green-tint)] px-4 py-3 text-sm text-primary">
          <CircleCheck className="size-5" aria-hidden />
          تم حفظ مشروعك. يمكنك العودة لإكماله في أي وقت.
        </p>
      ) : null}
      <h1 className="mt-6 text-2xl font-bold sm:text-3xl">{project.name}</h1>
      {project.description ? <p className="mt-2 text-muted-foreground">{project.description}</p> : null}

      <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3">
        {details.map(([k, v]) => (
          <div key={k} className="bg-card p-4">
            <dt className="text-xs text-muted-foreground">{k}</dt>
            <dd className="mt-1 font-medium">{v}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-8 rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h2 className="font-semibold">الخطوة التالية: {WIZARD_STEPS[Math.min(project.current_step, 6) - 1]}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          رفع الصور والمقاسات واختيار التصميم والتوليد بالذكاء الاصطناعي ستتاح قريباً ضمن مراحل الإطلاق التالية. مشروعك
          محفوظ وستكمله من هنا مباشرة.
        </p>
      </section>
    </div>
  );
}
