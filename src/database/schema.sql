-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Aug 17, 2025 at 07:10 AM
-- Server version: 9.3.0
-- PHP Version: 8.4.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `equirank`
--

-- --------------------------------------------------------

--
-- Table structure for table `contact_messages`
--

CREATE TABLE `contact_messages` (
  `id` int NOT NULL,
  `conversation_id` varchar(36) NOT NULL COMMENT 'UUID for conversation threading',
  `name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `message_type` enum('user_message','admin_reply') DEFAULT 'user_message' COMMENT 'Type of message in conversation',
  `parent_message_id` int DEFAULT NULL COMMENT 'Reference to parent message for replies',
  `status` enum('new','read','replied','closed') DEFAULT 'new',
  `ip_address` varchar(45) DEFAULT NULL COMMENT 'Store IP for rate limiting',
  `user_agent` text COMMENT 'Store user agent for security',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `archived` tinyint(1) DEFAULT '0' COMMENT 'Whether the message is archived'
) ;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sql_content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `executed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `token` varchar(255) NOT NULL COMMENT 'Secure random token for password reset',
  `expires_at` timestamp NOT NULL COMMENT 'Token expiration timestamp',
  `used` tinyint(1) DEFAULT '0' COMMENT 'Whether token has been used',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ;

--
-- Dumping data for table `password_reset_tokens`
--

INSERT INTO `password_reset_tokens` (`id`, `user_id`, `token`, `expires_at`, `used`, `created_at`) VALUES
(1, 1, 'dc9f77094ac6f92ba43873bb2f4a76b2eb2f14595624161e936671c33b7e380c', '2025-08-16 06:35:24', 0, '2025-08-16 05:35:24');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL COMMENT 'bcrypt hashed password (min 60 chars)',
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `user_type` enum('borrower','lender','admin') NOT NULL,
  `entity_type` enum('company','individual') NOT NULL,
  `company` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text,
  `is_active` tinyint(1) DEFAULT '1',
  `is_approved` tinyint(1) DEFAULT '0',
  `is_super_admin` tinyint(1) NOT NULL DEFAULT '0',
  `failed_login_attempts` int DEFAULT '0' COMMENT 'Track failed login attempts',
  `account_locked_until` timestamp NULL DEFAULT NULL COMMENT 'Account lockout until timestamp',
  `profile_picture` varchar(500) DEFAULT NULL COMMENT 'URL to profile picture',
  `bio` text COMMENT 'User biography/description',
  `website` varchar(255) DEFAULT NULL COMMENT 'Personal or company website',
  `linkedin` varchar(255) DEFAULT NULL COMMENT 'LinkedIn profile URL',
  `preferences` json DEFAULT NULL COMMENT 'User preferences and settings',
  `theme` enum('light','dark','auto') DEFAULT 'auto' COMMENT 'UI theme preference',
  `language` varchar(10) DEFAULT 'en' COMMENT 'Language preference (ISO 639-1)',
  `timezone` varchar(50) DEFAULT 'UTC' COMMENT 'Timezone preference',
  `notifications` json DEFAULT NULL COMMENT 'Notification preferences',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password_hash`, `first_name`, `last_name`, `user_type`, `entity_type`, `company`, `phone`, `address`, `is_active`, `is_approved`, `is_super_admin`, `failed_login_attempts`, `account_locked_until`, `created_at`, `updated_at`) VALUES
(1, 'admin@equirank.com', '$2b$12$gvpowO.QzOeSMOXl58X17ebpyF5/AZEZbXQf77x5wWkS8y.cOeZBW', 'Admin', 'User', 'admin', 'company', 'EquiRank Admin', '+1234567890', '123 Admin St, Admin City', 1, 1, 1, 0, NULL, '2025-08-10 11:54:38', '2025-08-17 06:38:47'),
(2, 'borrower1@company.com', '$2b$12$gvpowO.QzOeSMOXl58X17ebpyF5/AZEZbXQf77x5wWkS8y.cOeZBW', 'John', 'Smith', 'borrower', 'company', 'Tech Startup Inc', '+1234567891', '456 Business Ave, Tech City', 1, 1, 0, 0, NULL, '2025-08-10 11:54:38', '2025-08-10 15:19:37'),
(3, 'lender1@bank.com', '$2b$12$gvpowO.QzOeSMOXl58X17ebpyF5/AZEZbXQf77x5wWkS8y.cOeZBW', 'Jane', 'Doe', 'lender', 'company', 'Investment Bank Ltd', '+1234567892', '789 Finance Blvd, Bank City', 1, 1, 0, 0, NULL, '2025-08-10 11:54:38', '2025-08-10 15:19:37'),
(4, 'borrower2@individual.com', '$2b$12$gvpowO.QzOeSMOXl58X17ebpyF5/AZEZbXQf77x5wWkS8y.cOeZBW', 'Mike', 'Johnson', 'borrower', 'individual', NULL, '+1234567893', '321 Personal St, Individual City', 1, 1, 0, 0, NULL, '2025-08-10 11:54:38', '2025-08-10 15:19:37'),
(5, 'lender2@investor.com', '$2b$12$gvpowO.QzOeSMOXl58X17ebpyF5/AZEZbXQf77x5wWkS8y.cOeZBW', 'Sarah', 'Wilson', 'lender', 'individual', NULL, '+1234567894', '654 Investor Ave, Investment City', 0, 0, 0, 0, NULL, '2025-08-10 11:54:38', '2025-08-10 15:19:37');

-- --------------------------------------------------------

--
-- Table structure for table `loan_requests`
--

CREATE TABLE `loan_requests` (
  `id` int NOT NULL,
  `borrower_id` int NOT NULL COMMENT 'Foreign key to users table',
  `amount_requested` decimal(15,2) NOT NULL COMMENT 'Amount of money requested',
  `currency` enum('USD','EUR','GBP','CAD','AUD','JPY','CHF','CNY') DEFAULT 'USD' COMMENT 'Currency of the loan',

  `company_description` text COMMENT 'Description of the company',
  `social_media_links` json DEFAULT NULL COMMENT 'JSON object containing social media links',
  `loan_purpose` text NOT NULL COMMENT 'Reason for loan requirement',
  `loan_type` enum('equipment','expansion','working_capital','inventory','real_estate','startup','other') NOT NULL COMMENT 'Type of loan',
  `status` enum('pending','active','funded','closed','expired') DEFAULT 'pending' COMMENT 'Current status of the loan request',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `expires_at` timestamp NULL DEFAULT NULL COMMENT 'When the request expires'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `company_statistics`
--

CREATE TABLE `company_statistics` (
  `id` int NOT NULL,
  `user_id` int NOT NULL COMMENT 'Foreign key to users table',
  `annual_revenue` decimal(15,2) DEFAULT NULL COMMENT 'Annual revenue of the company',
  `employee_count` int DEFAULT NULL COMMENT 'Number of employees',
  `years_in_business` int DEFAULT NULL COMMENT 'Years the company has been in business',
  `credit_score` int DEFAULT NULL COMMENT 'Credit score (300-850)',
  `industry` varchar(100) DEFAULT NULL COMMENT 'Industry sector',
  `financial_ratios` json DEFAULT NULL COMMENT 'JSON object containing financial ratios',
  `last_updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_contact_messages_status` (`status`),
  ADD KEY `idx_contact_messages_created_at` (`created_at`),
  ADD KEY `idx_contact_messages_conversation_id` (`conversation_id`),
  ADD KEY `idx_contact_messages_message_type` (`message_type`),
  ADD KEY `idx_contact_messages_parent_message_id` (`parent_message_id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `idx_name` (`name`),
  ADD KEY `idx_executed_at` (`executed_at`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `idx_password_reset_tokens_token` (`token`),
  ADD KEY `idx_password_reset_tokens_user_id` (`user_id`),
  ADD KEY `idx_password_reset_tokens_expires_at` (`expires_at`),
  ADD KEY `idx_password_reset_tokens_used` (`used`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `loan_requests`
--
ALTER TABLE `loan_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_loan_requests_borrower_id` (`borrower_id`),
  ADD KEY `idx_loan_requests_status` (`status`),
  ADD KEY `idx_loan_requests_loan_type` (`loan_type`),
  ADD KEY `idx_loan_requests_created_at` (`created_at`),
  ADD KEY `idx_loan_requests_expires_at` (`expires_at`);

--
-- Indexes for table `company_statistics`
--
ALTER TABLE `company_statistics`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD KEY `idx_company_statistics_industry` (`industry`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `loan_requests`
--
ALTER TABLE `loan_requests`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `company_statistics`
--
ALTER TABLE `company_statistics`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `contact_messages`
--
ALTER TABLE `contact_messages`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD CONSTRAINT `fk_parent_message` FOREIGN KEY (`parent_message_id`) REFERENCES `contact_messages` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD CONSTRAINT `fk_password_reset_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `loan_requests`
--
ALTER TABLE `loan_requests`
  ADD CONSTRAINT `fk_loan_requests_borrower` FOREIGN KEY (`borrower_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `company_statistics`
--
ALTER TABLE `company_statistics`
  ADD CONSTRAINT `fk_company_statistics_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
