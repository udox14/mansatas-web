CREATE TABLE `achievements` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`rank` text,
	`organizer` text,
	`location` text,
	`date` text,
	`year` integer NOT NULL,
	`image_url` text,
	`article_id` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON UPDATE no action ON DELETE no action
);
