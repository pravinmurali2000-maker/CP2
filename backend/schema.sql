-- Sports Tournament Manager SQL Schema (MySQL)

-- Users Table for Authentication and RBAC
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'manager', 'viewer') NOT NULL,
  `team_id` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Tournaments Table
CREATE TABLE `tournaments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `format` VARCHAR(100) NOT NULL, -- e.g., 'Round Robin', 'Knockout'
  `start_date` DATE,
  `end_date` DATE,
  `status` ENUM('draft', 'live', 'completed') NOT NULL DEFAULT 'draft',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Teams Table
CREATE TABLE `teams` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tournament_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `manager_name` VARCHAR(255),
  `manager_email` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE (`tournament_id`, `name`),
  FOREIGN KEY (`tournament_id`) REFERENCES `tournaments`(`id`) ON DELETE CASCADE
);

-- Players Table
CREATE TABLE `players` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `team_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `number` INT,
  `position` VARCHAR(100),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON DELETE CASCADE
);

-- Matches Table
CREATE TABLE `matches` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tournament_id` INT NOT NULL,
  `home_team_id` INT NOT NULL,
  `away_team_id` INT NOT NULL,
  `date` DATE,
  `time` TIME,
  `venue` VARCHAR(255),
  `home_score` INT,
  `away_score` INT,
  `status` ENUM('scheduled', 'in_progress', 'completed', 'postponed') NOT NULL DEFAULT 'scheduled',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`tournament_id`) REFERENCES `tournaments`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`home_team_id`) REFERENCES `teams`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`away_team_id`) REFERENCES `teams`(`id`) ON DELETE CASCADE
);

-- Notifications Table
CREATE TABLE `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tournament_id` INT NOT NULL,
  `message` TEXT NOT NULL,
  `priority` ENUM('normal', 'urgent') DEFAULT 'normal',
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`tournament_id`) REFERENCES `tournaments`(`id`) ON DELETE CASCADE
);