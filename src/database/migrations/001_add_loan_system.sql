-- Migration: Add loan request system tables
-- Date: 2025-01-25
-- Description: Creates tables for loan requests and company statistics

-- Create loan_requests table
CREATE TABLE IF NOT EXISTS `loan_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
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
  `expires_at` timestamp NULL DEFAULT NULL COMMENT 'When the request expires',
  PRIMARY KEY (`id`),
  KEY `idx_loan_requests_borrower_id` (`borrower_id`),
  KEY `idx_loan_requests_status` (`status`),
  KEY `idx_loan_requests_loan_type` (`loan_type`),
  KEY `idx_loan_requests_created_at` (`created_at`),
  KEY `idx_loan_requests_expires_at` (`expires_at`),
  CONSTRAINT `fk_loan_requests_borrower` FOREIGN KEY (`borrower_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create company_statistics table
CREATE TABLE IF NOT EXISTS `company_statistics` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL COMMENT 'Foreign key to users table',
  `annual_revenue` decimal(15,2) DEFAULT NULL COMMENT 'Annual revenue of the company',
  `employee_count` int DEFAULT NULL COMMENT 'Number of employees',
  `years_in_business` int DEFAULT NULL COMMENT 'Years the company has been in business',
  `credit_score` int DEFAULT NULL COMMENT 'Credit score (300-850)',
  `industry` varchar(100) DEFAULT NULL COMMENT 'Industry sector',
  `financial_ratios` json DEFAULT NULL COMMENT 'JSON object containing financial ratios',
  `last_updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `idx_company_statistics_industry` (`industry`),
  CONSTRAINT `fk_company_statistics_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data for testing (optional)
-- INSERT INTO loan_requests (borrower_id, amount_requested, currency, loan_purpose, loan_type, status) 
-- VALUES (2, 50000.00, 'USD', 'Equipment purchase for manufacturing expansion', 'equipment', 'pending');

-- INSERT INTO company_statistics (user_id, annual_revenue, employee_count, years_in_business, industry) 
-- VALUES (2, 2500000.00, 25, 5, 'Manufacturing');
