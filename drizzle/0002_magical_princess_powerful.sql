CREATE TABLE "console_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"applicant_user_id" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"requested_role" text NOT NULL,
	"terms_version" text NOT NULL,
	"accepted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" text DEFAULT 'PENDING_REVIEW' NOT NULL,
	CONSTRAINT "console_applications_applicant_user_id_unique" UNIQUE("applicant_user_id")
);
--> statement-breakpoint
ALTER TABLE "console_applications" ADD CONSTRAINT "console_applications_applicant_user_id_users_id_fk" FOREIGN KEY ("applicant_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;