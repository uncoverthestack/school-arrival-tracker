CREATE TABLE "sms_deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" text NOT NULL,
	"message_id" text,
	"brand" text,
	"phone" text NOT NULL,
	"kind" text,
	"status" text DEFAULT 'submitted' NOT NULL,
	"provider_status" text,
	"failure_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sms_deliveries_message_id_unique" UNIQUE("message_id")
);
