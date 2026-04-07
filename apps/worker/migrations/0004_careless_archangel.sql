CREATE TABLE `gallery_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`thumbnail_url` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `gallery_categories_slug_unique` ON `gallery_categories` (`slug`);--> statement-breakpoint
ALTER TABLE `gallery` ADD `category_id` text REFERENCES gallery_categories(id);--> statement-breakpoint
ALTER TABLE `gallery` ADD `is_featured` integer DEFAULT false NOT NULL;