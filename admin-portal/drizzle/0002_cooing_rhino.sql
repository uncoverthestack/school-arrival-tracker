ALTER TABLE "schools" ADD COLUMN "code_prefix" text;--> statement-breakpoint
ALTER TABLE "schools" ADD CONSTRAINT "schools_code_prefix_unique" UNIQUE("code_prefix");