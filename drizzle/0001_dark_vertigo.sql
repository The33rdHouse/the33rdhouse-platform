ALTER TABLE "discoveries" ADD COLUMN "external_id" text;--> statement-breakpoint
UPDATE "discoveries" SET "external_id" = 'legacy-' || "id"::text WHERE "external_id" IS NULL;--> statement-breakpoint
ALTER TABLE "discoveries" ALTER COLUMN "external_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "discoveries" ADD CONSTRAINT "discoveries_external_id_unique" UNIQUE("external_id");