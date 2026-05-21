CREATE TABLE "review_callback_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"platform_output_id" uuid NOT NULL,
	"external_job_id" text,
	"previous_status" text NOT NULL,
	"new_status" text NOT NULL,
	"reviewer_identifier" text,
	"notes" text,
	"source" text DEFAULT 'n8n' NOT NULL,
	"applied" text DEFAULT 'success' NOT NULL,
	"rejection_reason" text,
	"provider_payload" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "review_callback_events" ADD CONSTRAINT "review_callback_events_platform_output_id_platform_outputs_id_fk" FOREIGN KEY ("platform_output_id") REFERENCES "public"."platform_outputs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_review_callback_output" ON "review_callback_events" USING btree ("platform_output_id");--> statement-breakpoint
CREATE INDEX "idx_review_callback_external_job" ON "review_callback_events" USING btree ("external_job_id");--> statement-breakpoint
CREATE INDEX "idx_review_callback_created" ON "review_callback_events" USING btree ("created_at");