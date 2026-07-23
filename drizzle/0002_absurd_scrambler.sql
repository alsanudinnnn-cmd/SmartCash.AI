CREATE TABLE `receipt_items` (
	`id` text PRIMARY KEY NOT NULL,
	`transaction_id` text NOT NULL,
	`user_id` text NOT NULL,
	`item_name` text NOT NULL,
	`quantity` real DEFAULT 1 NOT NULL,
	`unit_price` real DEFAULT 0 NOT NULL,
	`total` real NOT NULL,
	`created_at` integer NOT NULL
);
