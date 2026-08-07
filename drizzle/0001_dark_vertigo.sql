ALTER TABLE "discoveries" ADD COLUMN "external_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "discoveries" ADD CONSTRAINT "discoveries_external_id_unique" UNIQUE("external_id");