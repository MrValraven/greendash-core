CREATE TYPE "public"."account_status" AS ENUM('pending', 'active', 'inactive', 'banned');--> statement-breakpoint
CREATE TYPE "public"."roles" AS ENUM('user', 'admin', 'organization');--> statement-breakpoint
CREATE TYPE "public"."subscription_tier" AS ENUM('free', 'pro', 'enterprise');--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(256),
	"email" varchar NOT NULL,
	"hashed_password" varchar NOT NULL,
	"account_status" "account_status" DEFAULT 'pending',
	"email_verified" boolean DEFAULT false,
	"role" "roles" DEFAULT 'user' NOT NULL,
	"failed_login_attempts" integer DEFAULT 0,
	"locked_until" timestamp,
	"password_reset_token" varchar(512),
	"password_reset_expires" timestamp,
	"two_factor_auth_enabled" boolean DEFAULT false,
	"subscription_tier" "subscription_tier" DEFAULT 'free',
	"subscription_expires_at" timestamp,
	"gdpr_consent_given_at" timestamp,
	"data_retention_period" integer DEFAULT 365,
	"export_requested_at" timestamp,
	"last_login" timestamp,
	"terms_accepted_at" timestamp,
	"updated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
