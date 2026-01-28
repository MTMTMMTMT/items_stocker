CREATE TABLE `items` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`category` text DEFAULT 'uncategorized',
	`memo` text,
	`status` integer DEFAULT 0 NOT NULL,
	`is_shared` integer DEFAULT true,
	`is_memo_only` integer DEFAULT false,
	`owner_id` text,
	`group_id` text,
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_by` text
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`group_id` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);