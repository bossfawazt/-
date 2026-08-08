"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Building2, Clock, Heart, MapPin, MessageSquareText, Package, ShoppingBag, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { ProductCard } from "@/components/shared/product-card";
import { RatingStars } from "@/components/shared/rating-stars";
import { StatTile } from "@/components/shared/stat-tile";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { useInfiniteProductsQuery, useToggleFavoriteMutation } from "@/features/marketplace/hooks";
import { useSupplierProfileQuery, useToggleFollowSupplierMutation } from "@/features/suppliers/hooks";
import { formatDate, formatMinutes } from "@/lib/format";
import { cn } from "@/lib/utils";

interface SupplierProfileClientProps {
  supplierId: string;
}

function RatingDistributionBar({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-8 shrink-0 text-muted-foreground">{star} ★</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 shrink-0 text-end text-muted-foreground">{count}</span>
    </div>
  );
}

/** docs/UIUX-touq.md #C.3: public supplier storefront — trust signals + full catalog + reviews + policies. */
export function SupplierProfileClient({ supplierId }: SupplierProfileClientProps) {
  const { data: session } = useSession();
  const { data: profile, isLoading } = useSupplierProfileQuery(supplierId);
  const toggleFollow = useToggleFollowSupplierMutation();
  const toggleFavorite = useToggleFavoriteMutation();
  const { data: productsData, isLoading: productsLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteProductsQuery({
    supplierId,
  });

  const isMerchant = session?.user.organization?.type === "MERCHANT";
  const products = productsData?.pages.flatMap((page) => page.items) ?? [];

  async function handleToggleFollow() {
    if (!profile) return;
    try {
      const result = await toggleFollow.mutateAsync(supplierId);
      toast.success(result.favorited ? "تمت إضافة المورد إلى المفضلة" : "تمت إزالة المورد من المفضلة");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "تعذر تحديث المتابعة");
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="mt-6 h-32 w-full" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16">
        <EmptyState icon={Building2} title="المورد غير موجود" description="ربما تم إلغاء تفعيل هذا الحساب." />
      </div>
    );
  }

  const memberSinceYear = new Date(profile.memberSince).getFullYear();
  const totalReviews = profile.reviews.total;

  return (
    <div className="pb-24 lg:pb-0">
      <div className="relative h-40 w-full overflow-hidden bg-muted sm:h-56">
        {profile.coverUrl ? (
          <Image src={profile.coverUrl} alt="" fill className="object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary/20 via-muted to-secondary" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />
      </div>

      <div className="mx-auto max-w-5xl px-4">
        <div className="-mt-14 flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm sm:-mt-16 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <Avatar className="size-20 border-4 border-card shadow-sm sm:size-24">
              <AvatarImage src={profile.logoUrl ?? undefined} alt={profile.legalNameAr} />
              <AvatarFallback>
                <Building2 className="size-8 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold text-foreground">{profile.legalNameAr}</h1>
                {profile.verified ? <VerifiedBadge /> : null}
              </div>
              {profile.legalNameEn ? <p className="text-sm text-muted-foreground" dir="ltr">{profile.legalNameEn}</p> : null}
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                {profile.city ? (
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3.5" /> {profile.city}
                  </span>
                ) : null}
                {profile.responseTimeAvgMinutes ? (
                  <span className="flex items-center gap-1">
                    <Clock className="size-3.5" /> يرد خلال {formatMinutes(profile.responseTimeAvgMinutes)}
                  </span>
                ) : null}
                {profile.ratingCount > 0 ? <RatingStars rating={profile.ratingAvg} count={profile.ratingCount} /> : null}
              </div>
            </div>
          </div>

          <div className="hidden shrink-0 items-center gap-2 sm:flex">
            <Button asChild>
              <Link href={`/merchant/requests/new?supplierId=${profile.id}`}>
                <MessageSquareText /> إرسال طلب شراء
              </Link>
            </Button>
            {isMerchant ? (
              <Button variant="secondary" onClick={handleToggleFollow} loading={toggleFollow.isPending}>
                <Heart className={cn("size-4", profile.isFollowed && "fill-destructive text-destructive")} />
                {profile.isFollowed ? "متابَع" : "متابعة"}
              </Button>
            ) : null}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="إجمالي المنتجات" value={profile.stats.totalProducts} icon={Package} />
          <StatTile label="طلبات مكتملة" value={profile.stats.completedOrders} icon={ShoppingBag} />
          <StatTile
            label="متوسط وقت الرد"
            value={profile.responseTimeAvgMinutes ? formatMinutes(profile.responseTimeAvgMinutes) : "—"}
            icon={Clock}
          />
          <StatTile label="عضو منذ" value={memberSinceYear} icon={Star} />
        </div>

        <Tabs defaultValue="products" className="mt-8">
          <TabsList>
            <TabsTrigger value="products">المنتجات</TabsTrigger>
            <TabsTrigger value="about">عن المنشأة</TabsTrigger>
            <TabsTrigger value="reviews">التقييمات ({totalReviews})</TabsTrigger>
            <TabsTrigger value="policies">السياسات</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="pt-6">
            {productsLoading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[4/5] w-full" />
                ))}
              </div>
            ) : !products.length ? (
              <EmptyState icon={Package} title="لا توجد منتجات منشورة حاليًا" />
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} onToggleFavorite={(id) => toggleFavorite.mutate({ productId: id })} />
                  ))}
                </div>
                {hasNextPage ? (
                  <div className="mt-8 flex justify-center">
                    <Button variant="secondary" loading={isFetchingNextPage} onClick={() => fetchNextPage()}>
                      عرض المزيد
                    </Button>
                  </div>
                ) : null}
              </>
            )}
          </TabsContent>

          <TabsContent value="about" className="flex flex-col gap-4 pt-6">
            {profile.descriptionAr ? <p className="text-sm text-foreground">{profile.descriptionAr}</p> : null}
            <dl className="grid grid-cols-1 gap-4 rounded-lg border border-border p-5 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">حالة التوثيق</dt>
                <dd className="mt-1 font-medium text-foreground">{profile.verified ? "موثّق" : "قيد المراجعة"}</dd>
              </div>
              {profile.crNumberMasked ? (
                <div>
                  <dt className="text-muted-foreground">رقم السجل التجاري</dt>
                  <dd dir="ltr" className="mt-1 text-end font-medium text-foreground">{profile.crNumberMasked}</dd>
                </div>
              ) : null}
              {profile.maroofId ? (
                <div>
                  <dt className="text-muted-foreground">معروف</dt>
                  <dd className="mt-1 font-medium text-foreground">
                    <Badge variant="gold">موثّق عبر معروف</Badge>
                  </dd>
                </div>
              ) : null}
              <div>
                <dt className="text-muted-foreground">المنطقة</dt>
                <dd className="mt-1 font-medium text-foreground">{profile.regionNameAr ?? profile.city ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">عضو منذ</dt>
                <dd className="mt-1 font-medium text-foreground">{formatDate(profile.memberSince)}</dd>
              </div>
            </dl>
          </TabsContent>

          <TabsContent value="reviews" className="pt-6">
            {!totalReviews ? (
              <EmptyState icon={Star} title="لا توجد تقييمات بعد" description="ستظهر هنا تقييمات التجار بعد إتمام طلباتهم." />
            ) : (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2 rounded-lg border border-border p-5">
                  {([5, 4, 3, 2, 1] as const).map((star) => (
                    <RatingDistributionBar key={star} star={star} count={profile.reviews.distribution[star]} total={totalReviews} />
                  ))}
                </div>

                {profile.reviewableOrderId ? (
                  <Button asChild variant="secondary" className="w-fit">
                    <Link href={`/merchant/orders/${profile.reviewableOrderId}`}>كتابة تقييم</Link>
                  </Button>
                ) : null}

                <div className="flex flex-col gap-4">
                  {profile.reviews.items.map((review) => (
                    <div key={review.id} className="flex gap-3 rounded-lg border border-border p-4">
                      <Avatar className="size-9 shrink-0">
                        <AvatarFallback className="text-xs">{review.merchantInitials}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-1 flex-col gap-1">
                        <div className="flex items-center justify-between gap-2">
                          <RatingStars rating={review.rating} />
                          <span className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</span>
                        </div>
                        {review.comment ? <p className="text-sm text-foreground">{review.comment}</p> : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="policies" className="pt-6">
            <div className="flex flex-col gap-4 rounded-lg border border-border p-5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">الحد الأدنى للطلب (MOQ)</span>
                <span className="font-medium text-foreground">
                  {profile.policies.moqMin ? `${profile.policies.moqMin} قطعة` : "يختلف حسب المنتج"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">مدة التجهيز</span>
                <span className="font-medium text-foreground">
                  {profile.policies.leadTimeMinDays ? `من ${profile.policies.leadTimeMinDays} أيام` : "يختلف حسب المنتج"}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                جميع صفقات الشراء تتم مباشرة بين التاجر والمورد وفق الشروط المتفق عليها في طلب الشراء والعرض المقدَّم. لا تتولى منصة
                توق حاليًا استلام البضائع أو إدارة الشحن أو المدفوعات.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card p-3 shadow-lg lg:hidden">
        <Button asChild className="w-full">
          <Link href={`/merchant/requests/new?supplierId=${profile.id}`}>
            <MessageSquareText /> إرسال طلب شراء
          </Link>
        </Button>
      </div>
    </div>
  );
}
