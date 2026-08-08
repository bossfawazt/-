-- Table is empty at this point in dev (truncated for the taxonomy reseed),
-- so a straight NOT NULL add + unique index is safe without a backfill step.
ALTER TABLE "attribute_options" ADD COLUMN "key" TEXT NOT NULL;
CREATE UNIQUE INDEX "attribute_options_attribute_definition_id_key_key" ON "attribute_options"("attribute_definition_id", "key");
