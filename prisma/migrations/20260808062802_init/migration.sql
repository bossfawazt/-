-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "OtpPurpose" AS ENUM ('REGISTER', 'LOGIN');

-- CreateEnum
CREATE TYPE "OrganizationType" AS ENUM ('SUPPLIER', 'MERCHANT');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "OrganizationStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('ACTIVE', 'INVITED', 'REMOVED');

-- CreateEnum
CREATE TYPE "RoleScope" AS ENUM ('PLATFORM', 'ORGANIZATION');

-- CreateEnum
CREATE TYPE "AttributeType" AS ENUM ('ENUM', 'TEXT', 'NUMBER');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'LIVE', 'PAUSED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "StockStatus" AS ENUM ('IN_STOCK', 'MADE_TO_ORDER', 'OUT_OF_STOCK');

-- CreateEnum
CREATE TYPE "VariantStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateEnum
CREATE TYPE "RfqStatus" AS ENUM ('SUBMITTED', 'VIEWED', 'QUOTED', 'NEGOTIATING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'SUPERSEDED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('CONFIRMED', 'IN_PRODUCTION', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('OFF_PLATFORM');

-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('OPEN', 'INVESTIGATING', 'RESOLVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'SMS', 'WHATSAPP', 'EMAIL');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('QUEUED', 'SENT', 'FAILED', 'READ');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "phone_country_code" TEXT NOT NULL DEFAULT '+966',
    "email" TEXT,
    "password_hash" TEXT,
    "name" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'ar',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "phone_verified_at" TIMESTAMP(3),
    "email_verified_at" TIMESTAMP(3),
    "mfa_enabled" BOOLEAN NOT NULL DEFAULT false,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_codes" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "code_hash" TEXT NOT NULL,
    "purpose" "OtpPurpose" NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "consumed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "type" "OrganizationType" NOT NULL,
    "legal_name_ar" TEXT NOT NULL,
    "legal_name_en" TEXT,
    "cr_number" TEXT,
    "maroof_id" TEXT,
    "verification_status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "region_id" TEXT,
    "city" TEXT,
    "address" TEXT,
    "logo_url" TEXT,
    "cover_url" TEXT,
    "description_ar" TEXT,
    "description_en" TEXT,
    "status" "OrganizationStatus" NOT NULL DEFAULT 'PENDING',
    "rating_avg" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "rating_count" INTEGER NOT NULL DEFAULT 0,
    "response_time_avg_minutes" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_members" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "status" "MemberStatus" NOT NULL DEFAULT 'ACTIVE',
    "invited_by_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organization_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "scope" "RoleScope" NOT NULL,
    "description" TEXT,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "role_id" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateTable
CREATE TABLE "verification_documents" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "doc_type" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewed_by_user_id" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regions" (
    "id" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "parent_id" TEXT,

    CONSTRAINT "regions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "parent_id" TEXT,
    "name_ar" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attribute_definitions" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label_ar" TEXT NOT NULL,
    "label_en" TEXT NOT NULL,
    "type" "AttributeType" NOT NULL,
    "is_filterable" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "attribute_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attribute_options" (
    "id" TEXT NOT NULL,
    "attribute_definition_id" TEXT NOT NULL,
    "value_ar" TEXT NOT NULL,
    "value_en" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "attribute_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "supplier_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "title_ar" TEXT NOT NULL,
    "title_en" TEXT,
    "description_ar" TEXT,
    "description_en" TEXT,
    "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT',
    "rejection_reason" TEXT,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_attribute_values" (
    "product_id" TEXT NOT NULL,
    "attribute_definition_id" TEXT NOT NULL,
    "attribute_option_id" TEXT,
    "value_text" TEXT,

    CONSTRAINT "product_attribute_values_pkey" PRIMARY KEY ("product_id","attribute_definition_id")
);

-- CreateTable
CREATE TABLE "product_variants" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "sku" TEXT,
    "color" TEXT,
    "size" TEXT,
    "moq" INTEGER NOT NULL DEFAULT 1,
    "lead_time_days" INTEGER NOT NULL DEFAULT 7,
    "stock_status" "StockStatus" NOT NULL DEFAULT 'IN_STOCK',
    "status" "VariantStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_tiers" (
    "id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "min_qty" INTEGER NOT NULL,
    "max_qty" INTEGER,
    "unit_price_minor" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'SAR',

    CONSTRAINT "pricing_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_media" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "variant_id" TEXT,
    "media_type" "MediaType" NOT NULL DEFAULT 'IMAGE',
    "url" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "product_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorites" (
    "id" TEXT NOT NULL,
    "merchant_id" TEXT NOT NULL,
    "supplier_id" TEXT,
    "product_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rfqs" (
    "id" TEXT NOT NULL,
    "merchant_id" TEXT NOT NULL,
    "supplier_id" TEXT NOT NULL,
    "product_id" TEXT,
    "variant_id" TEXT,
    "requested_qty" INTEGER NOT NULL,
    "target_price_minor" INTEGER,
    "customization_notes" TEXT,
    "status" "RfqStatus" NOT NULL DEFAULT 'SUBMITTED',
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rfqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rfq_messages" (
    "id" TEXT NOT NULL,
    "rfq_id" TEXT NOT NULL,
    "sender_user_id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "attachment_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rfq_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotes" (
    "id" TEXT NOT NULL,
    "rfq_id" TEXT NOT NULL,
    "supplier_id" TEXT NOT NULL,
    "quoted_qty" INTEGER NOT NULL,
    "quoted_unit_price_minor" INTEGER NOT NULL,
    "lead_time_days" INTEGER NOT NULL,
    "valid_until" TIMESTAMP(3) NOT NULL,
    "status" "QuoteStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "rfq_id" TEXT NOT NULL,
    "quote_id" TEXT NOT NULL,
    "merchant_id" TEXT NOT NULL,
    "supplier_id" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'CONFIRMED',
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'OFF_PLATFORM',
    "total_amount_minor" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'SAR',
    "confirmed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "unit_price_minor" INTEGER NOT NULL,
    "subtotal_minor" INTEGER NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_status_history" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "from_status" "OrderStatus",
    "to_status" "OrderStatus" NOT NULL,
    "changed_by_user_id" TEXT,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "merchant_id" TEXT NOT NULL,
    "supplier_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disputes" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "raised_by_user_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "DisputeStatus" NOT NULL DEFAULT 'OPEN',
    "resolution_notes" TEXT,
    "resolved_by_user_id" TEXT,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "disputes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_events" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "link_url" TEXT,
    "payload_json" JSONB,
    "status" "NotificationStatus" NOT NULL DEFAULT 'QUEUED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sent_at" TIMESTAMP(3),
    "read_at" TIMESTAMP(3),

    CONSTRAINT "notification_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actor_user_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "metadata_json" JSONB,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "otp_codes_phone_purpose_idx" ON "otp_codes"("phone", "purpose");

-- CreateIndex
CREATE UNIQUE INDEX "organization_members_organization_id_user_id_key" ON "organization_members"("organization_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_key_key" ON "permissions"("key");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "attribute_definitions_category_id_key_key" ON "attribute_definitions"("category_id", "key");

-- CreateIndex
CREATE INDEX "products_supplier_id_status_idx" ON "products"("supplier_id", "status");

-- CreateIndex
CREATE INDEX "products_category_id_status_idx" ON "products"("category_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_sku_key" ON "product_variants"("sku");

-- CreateIndex
CREATE INDEX "pricing_tiers_variant_id_idx" ON "pricing_tiers"("variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_merchant_id_supplier_id_key" ON "favorites"("merchant_id", "supplier_id");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_merchant_id_product_id_key" ON "favorites"("merchant_id", "product_id");

-- CreateIndex
CREATE INDEX "rfqs_supplier_id_status_idx" ON "rfqs"("supplier_id", "status");

-- CreateIndex
CREATE INDEX "rfqs_merchant_id_status_idx" ON "rfqs"("merchant_id", "status");

-- CreateIndex
CREATE INDEX "rfq_messages_rfq_id_idx" ON "rfq_messages"("rfq_id");

-- CreateIndex
CREATE INDEX "quotes_rfq_id_idx" ON "quotes"("rfq_id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_rfq_id_key" ON "orders"("rfq_id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_quote_id_key" ON "orders"("quote_id");

-- CreateIndex
CREATE INDEX "orders_merchant_id_status_idx" ON "orders"("merchant_id", "status");

-- CreateIndex
CREATE INDEX "orders_supplier_id_status_idx" ON "orders"("supplier_id", "status");

-- CreateIndex
CREATE INDEX "order_status_history_order_id_idx" ON "order_status_history"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_order_id_key" ON "reviews"("order_id");

-- CreateIndex
CREATE INDEX "reviews_supplier_id_idx" ON "reviews"("supplier_id");

-- CreateIndex
CREATE UNIQUE INDEX "disputes_order_id_key" ON "disputes"("order_id");

-- CreateIndex
CREATE INDEX "notification_events_user_id_status_idx" ON "notification_events"("user_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_user_id_event_type_channel_key" ON "notification_preferences"("user_id", "event_type", "channel");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_invited_by_user_id_fkey" FOREIGN KEY ("invited_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_documents" ADD CONSTRAINT "verification_documents_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_documents" ADD CONSTRAINT "verification_documents_reviewed_by_user_id_fkey" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regions" ADD CONSTRAINT "regions_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "regions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attribute_definitions" ADD CONSTRAINT "attribute_definitions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attribute_options" ADD CONSTRAINT "attribute_options_attribute_definition_id_fkey" FOREIGN KEY ("attribute_definition_id") REFERENCES "attribute_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_attribute_values" ADD CONSTRAINT "product_attribute_values_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_attribute_values" ADD CONSTRAINT "product_attribute_values_attribute_definition_id_fkey" FOREIGN KEY ("attribute_definition_id") REFERENCES "attribute_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_attribute_values" ADD CONSTRAINT "product_attribute_values_attribute_option_id_fkey" FOREIGN KEY ("attribute_option_id") REFERENCES "attribute_options"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing_tiers" ADD CONSTRAINT "pricing_tiers_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_media" ADD CONSTRAINT "product_media_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_media" ADD CONSTRAINT "product_media_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rfqs" ADD CONSTRAINT "rfqs_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rfqs" ADD CONSTRAINT "rfqs_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rfqs" ADD CONSTRAINT "rfqs_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rfqs" ADD CONSTRAINT "rfqs_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rfq_messages" ADD CONSTRAINT "rfq_messages_rfq_id_fkey" FOREIGN KEY ("rfq_id") REFERENCES "rfqs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rfq_messages" ADD CONSTRAINT "rfq_messages_sender_user_id_fkey" FOREIGN KEY ("sender_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_rfq_id_fkey" FOREIGN KEY ("rfq_id") REFERENCES "rfqs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_rfq_id_fkey" FOREIGN KEY ("rfq_id") REFERENCES "rfqs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "quotes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_changed_by_user_id_fkey" FOREIGN KEY ("changed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_raised_by_user_id_fkey" FOREIGN KEY ("raised_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_resolved_by_user_id_fkey" FOREIGN KEY ("resolved_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_events" ADD CONSTRAINT "notification_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
