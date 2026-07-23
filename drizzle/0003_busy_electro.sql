CREATE TABLE `registration_verifications` (
	`id` text PRIMARY KEY NOT NULL,
	`full_name` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`password_salt` text NOT NULL,
	`business_name` text NOT NULL,
	`business_type` text NOT NULL,
	`phone` text,
	`code_hash` text NOT NULL,
	`expires_at` integer NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`last_sent_at` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `registration_verifications_email_idx` ON `registration_verifications` (`email`);