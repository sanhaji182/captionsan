CREATE TABLE "prompt_drafts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"prompt_original" text NOT NULL,
	"prompt_current" text NOT NULL,
	"prompt_approved" boolean DEFAULT false NOT NULL,
	"prompt_status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prompt_revisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prompt_draft_id" uuid NOT NULL,
	"actor_type" text NOT NULL,
	"instruction_text" text NOT NULL,
	"resulting_prompt" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "generations" ADD COLUMN "prompt_draft_id" uuid;--> statement-breakpoint
ALTER TABLE "prompt_drafts" ADD CONSTRAINT "prompt_drafts_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompt_revisions" ADD CONSTRAINT "prompt_revisions_prompt_draft_id_prompt_drafts_id_fk" FOREIGN KEY ("prompt_draft_id") REFERENCES "public"."prompt_drafts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generations" ADD CONSTRAINT "generations_prompt_draft_id_prompt_drafts_id_fk" FOREIGN KEY ("prompt_draft_id") REFERENCES "public"."prompt_drafts"("id") ON DELETE no action ON UPDATE no action;