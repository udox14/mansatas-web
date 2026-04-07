CREATE TABLE `article_comments` (
	`id` text PRIMARY KEY NOT NULL,
	`article_id` text NOT NULL,
	`user_name` text NOT NULL,
	`user_ig` text,
	`content` text NOT NULL,
	`is_approved` integer DEFAULT false NOT NULL,
	`is_deleted` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON UPDATE no action ON DELETE no action
);
