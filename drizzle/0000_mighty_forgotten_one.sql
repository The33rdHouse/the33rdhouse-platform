CREATE TYPE "public"."canon_level" AS ENUM('FOUNDATIONAL', 'STRUCTURAL', 'CONTENT', 'OPERATIONAL');--> statement-breakpoint
CREATE TYPE "public"."canon_status" AS ENUM('DRAFT', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."mapping_confidence" AS ENUM('A', 'B', 'C', 'D');--> statement-breakpoint
CREATE TYPE "public"."mapping_type" AS ENUM('EQUIVALENCE', 'ANALOGY', 'FUNCTIONAL_SIMILARITY', 'SYMBOLIC_RESONANCE');--> statement-breakpoint
CREATE TYPE "public"."media_availability" AS ENUM('AVAILABLE', 'PLANNED', 'MISSING', 'ARCHIVED');--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"actor_user_id" text NOT NULL,
	"action" text NOT NULL,
	"object_id" text,
	"version" integer,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "canon_objects" (
	"id" text PRIMARY KEY NOT NULL,
	"object_type" text NOT NULL,
	"level" "canon_level" NOT NULL,
	"status" "canon_status" DEFAULT 'DRAFT' NOT NULL,
	"current_version" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "canon_pins" (
	"id" serial PRIMARY KEY NOT NULL,
	"object_id" text NOT NULL,
	"version_id" integer NOT NULL,
	"reason" text NOT NULL,
	"actor_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "canon_reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"object_id" text NOT NULL,
	"version_id" integer NOT NULL,
	"decision" "canon_status" NOT NULL,
	"actor_user_id" text NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "canon_source_records" (
	"id" text PRIMARY KEY NOT NULL,
	"package_id" text NOT NULL,
	"source_path" text NOT NULL,
	"source_record_id" text NOT NULL,
	"sha256" text NOT NULL,
	"raw_json" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "canon_versions" (
	"id" serial PRIMARY KEY NOT NULL,
	"object_id" text NOT NULL,
	"version" integer NOT NULL,
	"status" "canon_status" DEFAULT 'DRAFT' NOT NULL,
	"payload" jsonb NOT NULL,
	"actor_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"user_id" text NOT NULL,
	"role_id" text NOT NULL,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_roles_user_id_role_id_pk" PRIMARY KEY("user_id","role_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text,
	"display_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "citations" (
	"id" text PRIMARY KEY NOT NULL,
	"source_id" text NOT NULL,
	"locator" text,
	"excerpt" text
);
--> statement-breakpoint
CREATE TABLE "concepts" (
	"id" text PRIMARY KEY NOT NULL,
	"canonical_name" text NOT NULL,
	"tradition_id" text,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "deities" (
	"id" text PRIMARY KEY NOT NULL,
	"canonical_name" text NOT NULL,
	"tradition_id" text,
	"era_id" text,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "deity_aliases" (
	"id" serial PRIMARY KEY NOT NULL,
	"deity_id" text NOT NULL,
	"alias" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "eras" (
	"id" text PRIMARY KEY NOT NULL,
	"canonical_name" text NOT NULL,
	"description" text,
	CONSTRAINT "eras_canonical_name_unique" UNIQUE("canonical_name")
);
--> statement-breakpoint
CREATE TABLE "mapping_claim_evidence" (
	"claim_id" text NOT NULL,
	"citation_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mapping_claims" (
	"id" text PRIMARY KEY NOT NULL,
	"from_object_id" text NOT NULL,
	"to_object_id" text NOT NULL,
	"mapping_type" "mapping_type" NOT NULL,
	"confidence" "mapping_confidence" NOT NULL,
	"status" "canon_status" DEFAULT 'DRAFT' NOT NULL,
	"rationale" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"author" text,
	"locator" text,
	"publication_year" text
);
--> statement-breakpoint
CREATE TABLE "traditions" (
	"id" text PRIMARY KEY NOT NULL,
	"canonical_name" text NOT NULL,
	"description" text,
	CONSTRAINT "traditions_canonical_name_unique" UNIQUE("canonical_name")
);
--> statement-breakpoint
CREATE TABLE "correspondences" (
	"id" text PRIMARY KEY NOT NULL,
	"from_object_id" text NOT NULL,
	"to_object_id" text NOT NULL,
	"relation_type" text NOT NULL,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "gates" (
	"id" text PRIMARY KEY NOT NULL,
	"ordinal" integer NOT NULL,
	"canonical_name" text NOT NULL,
	"description" text,
	CONSTRAINT "gates_ordinal_unique" UNIQUE("ordinal")
);
--> statement-breakpoint
CREATE TABLE "glyphs" (
	"id" text PRIMARY KEY NOT NULL,
	"realm_id" text,
	"name" text NOT NULL,
	"asset_key" text
);
--> statement-breakpoint
CREATE TABLE "paths" (
	"id" text PRIMARY KEY NOT NULL,
	"ordinal" integer NOT NULL,
	"canonical_name" text NOT NULL,
	"description" text,
	CONSTRAINT "paths_ordinal_unique" UNIQUE("ordinal")
);
--> statement-breakpoint
CREATE TABLE "practices" (
	"id" text PRIMARY KEY NOT NULL,
	"realm_id" text,
	"title" text NOT NULL,
	"body" text
);
--> statement-breakpoint
CREATE TABLE "realm_source_variants" (
	"id" serial PRIMARY KEY NOT NULL,
	"realm_id" text NOT NULL,
	"source_record_id" text NOT NULL,
	"raw_name" text,
	"raw_description" text,
	"raw_gate_ordinal" integer,
	"raw_metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "realms" (
	"id" text PRIMARY KEY NOT NULL,
	"realm_number" integer NOT NULL,
	"gate_id" text NOT NULL,
	"canonical_name" text,
	"canonical_description" text,
	CONSTRAINT "realms_realm_number_unique" UNIQUE("realm_number")
);
--> statement-breakpoint
CREATE TABLE "content_releases" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"status" "canon_status" DEFAULT 'DRAFT' NOT NULL,
	"released_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" text PRIMARY KEY NOT NULL,
	"asset_type" text NOT NULL,
	"storage_provider" text NOT NULL,
	"storage_key" text NOT NULL,
	"mime_type" text,
	"duration_seconds" integer,
	"sha256" text,
	"version" integer DEFAULT 1 NOT NULL,
	"publication_status" "canon_status" DEFAULT 'DRAFT' NOT NULL,
	"availability" "media_availability" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meditations" (
	"id" text PRIMARY KEY NOT NULL,
	"realm_id" text,
	"title" text NOT NULL,
	"script" text,
	"duration_seconds" integer
);
--> statement-breakpoint
CREATE TABLE "realm_media" (
	"realm_id" text NOT NULL,
	"media_asset_id" text NOT NULL,
	CONSTRAINT "realm_media_realm_id_media_asset_id_pk" PRIMARY KEY("realm_id","media_asset_id")
);
--> statement-breakpoint
CREATE TABLE "teachings" (
	"id" text PRIMARY KEY NOT NULL,
	"realm_id" text,
	"title" text NOT NULL,
	"body" text,
	"week_number" integer
);
--> statement-breakpoint
CREATE TABLE "achievements" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"unlock_rule" text NOT NULL,
	CONSTRAINT "achievements_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "bookmarks" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"object_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "discoveries" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"object_id" text NOT NULL,
	"discovery_type" text NOT NULL,
	"xp_awarded" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "journal_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"realm_id" text,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ranks" (
	"id" text PRIMARY KEY NOT NULL,
	"ordinal" integer NOT NULL,
	"name" text NOT NULL,
	"unlock_rule" text NOT NULL,
	CONSTRAINT "ranks_ordinal_unique" UNIQUE("ordinal"),
	CONSTRAINT "ranks_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "user_achievements" (
	"user_id" text NOT NULL,
	"achievement_id" text NOT NULL,
	"unlocked_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_achievements_user_id_achievement_id_pk" PRIMARY KEY("user_id","achievement_id")
);
--> statement-breakpoint
CREATE TABLE "user_gate_progress" (
	"user_id" text NOT NULL,
	"gate_id" text NOT NULL,
	"completed_realms" integer DEFAULT 0 NOT NULL,
	"completed_at" timestamp with time zone,
	CONSTRAINT "user_gate_progress_user_id_gate_id_pk" PRIMARY KEY("user_id","gate_id")
);
--> statement-breakpoint
CREATE TABLE "user_progress" (
	"user_id" text PRIMARY KEY NOT NULL,
	"xp" integer DEFAULT 0 NOT NULL,
	"rank_id" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_rank_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"rank_id" text NOT NULL,
	"achieved_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_realm_progress" (
	"user_id" text NOT NULL,
	"realm_id" text NOT NULL,
	"status" text DEFAULT 'NOT_STARTED' NOT NULL,
	"completed_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_realm_progress_user_id_realm_id_pk" PRIMARY KEY("user_id","realm_id")
);
--> statement-breakpoint
ALTER TABLE "canon_pins" ADD CONSTRAINT "canon_pins_object_id_canon_objects_id_fk" FOREIGN KEY ("object_id") REFERENCES "public"."canon_objects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "canon_pins" ADD CONSTRAINT "canon_pins_version_id_canon_versions_id_fk" FOREIGN KEY ("version_id") REFERENCES "public"."canon_versions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "canon_reviews" ADD CONSTRAINT "canon_reviews_object_id_canon_objects_id_fk" FOREIGN KEY ("object_id") REFERENCES "public"."canon_objects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "canon_reviews" ADD CONSTRAINT "canon_reviews_version_id_canon_versions_id_fk" FOREIGN KEY ("version_id") REFERENCES "public"."canon_versions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "canon_versions" ADD CONSTRAINT "canon_versions_object_id_canon_objects_id_fk" FOREIGN KEY ("object_id") REFERENCES "public"."canon_objects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "citations" ADD CONSTRAINT "citations_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "concepts" ADD CONSTRAINT "concepts_tradition_id_traditions_id_fk" FOREIGN KEY ("tradition_id") REFERENCES "public"."traditions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deities" ADD CONSTRAINT "deities_tradition_id_traditions_id_fk" FOREIGN KEY ("tradition_id") REFERENCES "public"."traditions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deities" ADD CONSTRAINT "deities_era_id_eras_id_fk" FOREIGN KEY ("era_id") REFERENCES "public"."eras"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deity_aliases" ADD CONSTRAINT "deity_aliases_deity_id_deities_id_fk" FOREIGN KEY ("deity_id") REFERENCES "public"."deities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mapping_claim_evidence" ADD CONSTRAINT "mapping_claim_evidence_claim_id_mapping_claims_id_fk" FOREIGN KEY ("claim_id") REFERENCES "public"."mapping_claims"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mapping_claim_evidence" ADD CONSTRAINT "mapping_claim_evidence_citation_id_citations_id_fk" FOREIGN KEY ("citation_id") REFERENCES "public"."citations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "glyphs" ADD CONSTRAINT "glyphs_realm_id_realms_id_fk" FOREIGN KEY ("realm_id") REFERENCES "public"."realms"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practices" ADD CONSTRAINT "practices_realm_id_realms_id_fk" FOREIGN KEY ("realm_id") REFERENCES "public"."realms"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "realm_source_variants" ADD CONSTRAINT "realm_source_variants_realm_id_realms_id_fk" FOREIGN KEY ("realm_id") REFERENCES "public"."realms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "realm_source_variants" ADD CONSTRAINT "realm_source_variants_source_record_id_canon_source_records_id_fk" FOREIGN KEY ("source_record_id") REFERENCES "public"."canon_source_records"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "realms" ADD CONSTRAINT "realms_gate_id_gates_id_fk" FOREIGN KEY ("gate_id") REFERENCES "public"."gates"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meditations" ADD CONSTRAINT "meditations_realm_id_realms_id_fk" FOREIGN KEY ("realm_id") REFERENCES "public"."realms"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "realm_media" ADD CONSTRAINT "realm_media_realm_id_realms_id_fk" FOREIGN KEY ("realm_id") REFERENCES "public"."realms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "realm_media" ADD CONSTRAINT "realm_media_media_asset_id_media_assets_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teachings" ADD CONSTRAINT "teachings_realm_id_realms_id_fk" FOREIGN KEY ("realm_id") REFERENCES "public"."realms"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discoveries" ADD CONSTRAINT "discoveries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_realm_id_realms_id_fk" FOREIGN KEY ("realm_id") REFERENCES "public"."realms"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_achievements_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_gate_progress" ADD CONSTRAINT "user_gate_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_gate_progress" ADD CONSTRAINT "user_gate_progress_gate_id_gates_id_fk" FOREIGN KEY ("gate_id") REFERENCES "public"."gates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_rank_id_ranks_id_fk" FOREIGN KEY ("rank_id") REFERENCES "public"."ranks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_rank_history" ADD CONSTRAINT "user_rank_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_rank_history" ADD CONSTRAINT "user_rank_history_rank_id_ranks_id_fk" FOREIGN KEY ("rank_id") REFERENCES "public"."ranks"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_realm_progress" ADD CONSTRAINT "user_realm_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_realm_progress" ADD CONSTRAINT "user_realm_progress_realm_id_realms_id_fk" FOREIGN KEY ("realm_id") REFERENCES "public"."realms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "canon_source_records_origin_uq" ON "canon_source_records" USING btree ("package_id","source_path","source_record_id");--> statement-breakpoint
CREATE UNIQUE INDEX "canon_versions_object_version_uq" ON "canon_versions" USING btree ("object_id","version");--> statement-breakpoint
CREATE UNIQUE INDEX "deity_aliases_deity_alias_uq" ON "deity_aliases" USING btree ("deity_id","alias");--> statement-breakpoint
CREATE UNIQUE INDEX "mapping_claim_evidence_uq" ON "mapping_claim_evidence" USING btree ("claim_id","citation_id");--> statement-breakpoint
CREATE UNIQUE INDEX "realm_source_variants_source_record_uq" ON "realm_source_variants" USING btree ("source_record_id");