CREATE TABLE IF NOT EXISTS `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `categories_slug_unique` ON `categories` (`slug`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `gtk` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`nip` text,
	`gender` text DEFAULT 'L' NOT NULL,
	`position` text NOT NULL,
	`subject` text,
	`image_url` text,
	`is_featured` integer DEFAULT false NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
-- ALTER TABLE `articles` ADD `category_id` text REFERENCES categories(id);