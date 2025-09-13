-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Sep 13, 2025 at 08:22 AM
-- Server version: 8.4.3
-- PHP Version: 8.3.16

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
-- Table structure for table `admin_profiles`
--

CREATE TABLE `admin_profiles` (
  `id` int NOT NULL,
  `user_id` int NOT NULL COMMENT 'Foreign key to users table',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `admin_level` enum('super_admin','admin','moderator') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'admin' COMMENT 'Admin permission level',
  `website` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Personal or company website',
  `linkedin` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'LinkedIn profile URL',
  `preferences` json DEFAULT NULL COMMENT 'User preferences and settings'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admin_profiles`
--

INSERT INTO `admin_profiles` (`id`, `user_id`, `created_at`, `updated_at`, `admin_level`, `website`, `linkedin`, `preferences`) VALUES
(1, 1, '2025-09-08 04:10:30', '2025-09-08 04:10:30', 'admin', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `borrower_profiles`
--

CREATE TABLE `borrower_profiles` (
  `id` int NOT NULL,
  `user_id` int NOT NULL COMMENT 'Foreign key to users table',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `industry` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Industry sector for risk assessment',
  `location` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Geographic location for risk assessment',
  `capabilities` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Company capabilities and expertise',
  `years_in_business` int DEFAULT NULL COMMENT 'Years the company has been in business',
  `employee_count` int DEFAULT NULL COMMENT 'Number of employees',
  `revenue_range` enum('0-50k','50k-100k','100k-500k','500k-1m','1m-5m','5m-10m','10m-50m','50m+') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Annual revenue range',
  `profile_completion_percentage` int DEFAULT '0' COMMENT 'Profile completion percentage (0-100)',
  `profile_completed_at` timestamp NULL DEFAULT NULL COMMENT 'When profile was completed',
  `profile_completion_required` tinyint(1) DEFAULT '1' COMMENT 'Whether profile completion is required for loan requests',
  `website` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Personal or company website',
  `linkedin` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'LinkedIn profile URL',
  `preferences` json DEFAULT NULL COMMENT 'User preferences and settings',
  `qa_rating` decimal(3,2) DEFAULT NULL COMMENT 'Quality assurance rating (0.00-5.00)',
  `company_logo` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'URL to company logo image',
  `qa_rating_updated_at` timestamp NULL DEFAULT NULL COMMENT 'When QA rating was last updated'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `borrower_profiles`
--

INSERT INTO `borrower_profiles` (`id`, `user_id`, `created_at`, `updated_at`, `industry`, `location`, `capabilities`, `years_in_business`, `employee_count`, `revenue_range`, `profile_completion_percentage`, `profile_completed_at`, `profile_completion_required`, `website`, `linkedin`, `preferences`, `qa_rating`, `company_logo`, `qa_rating_updated_at`) VALUES
(1, 2, '2025-09-08 04:10:30', '2025-09-09 12:29:10', 'Technology', 'San Francisco, CA', 'AI/ML development, Cloud architecture, Mobile app development, Data analytics', 7, 50, '5m-10m', 100, '2025-09-09 12:29:10', 0, 'https://www.completetech.com', 'https://linkedin.com/in/completeborrower', '{\"marketing\": false, \"notifications\": true}', 4.85, 'https://www.completetech.com/logo.png', NULL),
(2, 4, '2025-09-08 04:10:30', '2025-09-08 04:11:27', NULL, NULL, NULL, NULL, NULL, NULL, 20, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL),
(4, 6, '2025-09-09 12:21:17', '2025-09-09 12:21:17', 'Technology', 'San Francisco, CA', 'AI/ML development, Cloud architecture, Mobile app development, Data analytics, Product management, Team leadership', 7, 50, '5m-10m', 100, '2025-09-09 12:21:17', 0, 'https://www.completetech.com', 'https://linkedin.com/in/completeborrower', '{\"marketing\": false, \"email_updates\": true, \"notifications\": true}', 4.85, 'https://www.completetech.com/logo.png', NULL);

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
  `industry` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Industry sector',
  `financial_ratios` json DEFAULT NULL COMMENT 'JSON object containing financial ratios',
  `last_updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `company_statistics`
--

INSERT INTO `company_statistics` (`id`, `user_id`, `annual_revenue`, `employee_count`, `years_in_business`, `credit_score`, `industry`, `financial_ratios`, `last_updated`) VALUES
(1, 2, 2500000.00, 25, 5, 720, 'Manufacturing', '{\"current_ratio\": 1.8, \"profit_margin\": 0.15, \"debt_to_equity\": 0.45}', '2025-08-29 11:50:04');

-- --------------------------------------------------------

--
-- Table structure for table `company_values`
--

CREATE TABLE `company_values` (
  `id` int NOT NULL,
  `borrower_id` int NOT NULL COMMENT 'foreign key to borrower profile',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `company_name` varchar(100) COLLATE utf8mb3_unicode_ci DEFAULT NULL COMMENT 'Name of company',
  `industry` varchar(100) COLLATE utf8mb3_unicode_ci DEFAULT NULL COMMENT 'Industry of Company',
  `revenue_range` enum('0-50k','50k-100k','100k-500k','500k-1m','1m-5m','5m-10m','10m-50m','50m+') COLLATE utf8mb3_unicode_ci DEFAULT NULL COMMENT 'Annual revenue range',
  `covenant_statistic` json DEFAULT NULL COMMENT 'The Covenant Statistics',
  `abs_benchmark` json DEFAULT NULL,
  `financial_summary` json DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Dumping data for table `company_values`
--

INSERT INTO `company_values` (`id`, `borrower_id`, `created_at`, `updated_at`, `company_name`, `industry`, `revenue_range`, `covenant_statistic`, `abs_benchmark`, `financial_summary`) VALUES
(1, 1, '2025-09-09 23:26:37', '2025-09-09 23:26:37', 'Tech Builders', 'Household', '50k-100k', '{\"debt_ratio\": 47.52, \"quick_ratio\": 0.96, \"equity_ratio\": 52.48, \"current_ratio\": 1.93, \"dividend_ratio\": 1, \"interest_cover\": 17.2, \"operating_cycle\": 53.92, \"net_profit_margin\": 4.02, \"avg_payment_period\": 28.59, \"creditors_turnover\": 12.77, \"inventory_turnover\": 0.0, \"quasi_equity_ratio\": 63.93, \"gross_profit_margin\": 22.15, \"capitalisation_ratio\": 190.55, \"receivables_turnover\": 8.79, \"avg_collection_period\": 41.57, \"return_on_total_assets\": 8.2, \"inventory_turnover_days\": 40.94}', '[{\"name\": \"Wages and Salaries/Revenue\", \"benchmarkValue\": 14, \"calculatedValue\": 7.44}, {\"name\": \"Total Expenses/Total Income\", \"benchmarkValue\": 94, \"calculatedValue\": 83.61}, {\"name\": \"Total Expenses/Revenue\", \"benchmarkValue\": 96, \"calculatedValue\": 20.5}, {\"name\": \"Operating Profit Before Tax/Total Income\", \"benchmarkValue\": 6, \"calculatedValue\": 16.39}, {\"name\": \"Net Profit/Loss (-) Margin\", \"benchmarkValue\": 6, \"calculatedValue\": 4.02}, {\"name\": \"EBITDA/Net Revenue\", \"benchmarkValue\": 7, \"calculatedValue\": 6.07}, {\"name\": \"Interest Cover\", \"benchmarkValue\": 7.5, \"calculatedValue\": 17.2}, {\"name\": \"EBITDA Margin\", \"benchmarkValue\": 7, \"calculatedValue\": 24.77}, {\"name\": \"Total Other Income/Revenue\", \"benchmarkValue\": 1, \"calculatedValue\": 2.37}, {\"name\": \"Total Other Income/Net Profit/Loss Before Tax\", \"benchmarkValue\": 20, \"calculatedValue\": 58.88}, {\"name\": \"Depreciation and Amortisation/Net Revenue\", \"benchmarkValue\": 1, \"calculatedValue\": 1.81}, {\"name\": \"Interest/Revenue\", \"benchmarkValue\": 1, \"calculatedValue\": 0.25}]', '{\"financialStatements\": {\"2023\": {\"date\": \"2023-06-30\", \"ebitda\": 964131, \"equity\": 3184167, \"interest\": 17661, \"netRevenue\": 15766553, \"profitLoss\": 812712, \"grossProfit\": 3440466, \"otherIncome\": 232860, \"totalAssets\": 5252202, \"depreciation\": 133758, \"currentAssets\": 3729525, \"otherExpenses\": 2709194, \"costOfGoodsSold\": 12326088, \"nonCurrentAssets\": 1522677, \"totalLiabilities\": 2068035, \"currentLiabilities\": 1137720, \"nonCurrentLiabilities\": 930315}, \"2024\": {\"date\": \"2024-06-30\", \"ebitda\": 499261, \"equity\": 2519795, \"interest\": 78, \"netRevenue\": 13736093, \"profitLoss\": 326782, \"grossProfit\": 2612688, \"otherIncome\": 319437, \"totalAssets\": 5014341, \"depreciation\": 172402, \"currentAssets\": 3019410, \"otherExpenses\": 2432864, \"costOfGoodsSold\": 11123405, \"nonCurrentAssets\": 1994932, \"totalLiabilities\": 2494547, \"currentLiabilities\": 966396, \"nonCurrentLiabilities\": 1528151}, \"2025\": {\"date\": \"2025-06-30\", \"ebitda\": 953459, \"equity\": 4286355, \"interest\": 38939, \"netRevenue\": 15699648, \"profitLoss\": 630973, \"grossProfit\": 3477211, \"otherIncome\": 371514, \"totalAssets\": 8167863, \"depreciation\": 283548, \"currentAssets\": 3704382, \"otherExpenses\": 2895266, \"costOfGoodsSold\": 12222437, \"nonCurrentAssets\": 4463481, \"totalLiabilities\": 3881508, \"currentLiabilities\": 1917820, \"nonCurrentLiabilities\": 1963688}}}'),
(2, 1, '2025-09-10 00:58:48', '2025-09-10 00:58:48', 'Test Company', 'Some industry', '50k-100k', NULL, NULL, NULL);

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `contact_messages`
--

INSERT INTO `contact_messages` (`id`, `conversation_id`, `name`, `email`, `subject`, `message`, `message_type`, `parent_message_id`, `status`, `ip_address`, `user_agent`, `created_at`, `updated_at`, `archived`) VALUES
(1, '44e1bb16-2b47-4d8e-8e09-9e691cfaeb8b', 'Chay Fong Hong', 'chayfong9009@gmail.com', 'general', 'rfqerfgqergqergq', 'user_message', NULL, 'new', NULL, NULL, '2025-08-25 05:36:06', '2025-08-25 05:36:58', 1),
(2, 'd69c86fc-0f56-433a-a72f-a491a7863c09', 'Chay Fong Hong', 'chayfong9009@iojergijerijgrqojigroij.com', 'support', '13iough3oiue4rgoqeirgio34gq3e4r5giuh', 'user_message', NULL, 'new', NULL, NULL, '2025-09-01 05:29:02', '2025-09-01 05:29:02', 0);

-- --------------------------------------------------------

--
-- Table structure for table `lender_profiles`
--

CREATE TABLE `lender_profiles` (
  `id` int NOT NULL,
  `user_id` int NOT NULL COMMENT 'Foreign key to users table',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `institution_type` enum('bank','credit_union','investment_firm','private_lender','peer_to_peer','other') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Type of lending institution',
  `risk_appetite` enum('conservative','moderate','aggressive') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Risk tolerance level',
  `target_industries` json DEFAULT NULL COMMENT 'JSON array of target industries',
  `target_markets` json DEFAULT NULL COMMENT 'JSON array of target geographic markets',
  `min_loan_amount` decimal(15,2) DEFAULT NULL COMMENT 'Minimum loan amount preference',
  `max_loan_amount` decimal(15,2) DEFAULT NULL COMMENT 'Maximum loan amount preference',
  `website` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Personal or company website',
  `linkedin` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'LinkedIn profile URL',
  `preferences` json DEFAULT NULL COMMENT 'User preferences and settings'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lender_profiles`
--

INSERT INTO `lender_profiles` (`id`, `user_id`, `created_at`, `updated_at`, `institution_type`, `risk_appetite`, `target_industries`, `target_markets`, `min_loan_amount`, `max_loan_amount`, `website`, `linkedin`, `preferences`) VALUES
(1, 3, '2025-09-08 04:10:30', '2025-09-08 04:11:27', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(2, 5, '2025-09-08 04:10:30', '2025-09-08 04:11:27', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `loan_requests`
--

CREATE TABLE `loan_requests` (
  `id` int NOT NULL,
  `borrower_id` int NOT NULL COMMENT 'Foreign key to users table',
  `company_id` int DEFAULT NULL,
  `amount_requested` decimal(15,2) NOT NULL COMMENT 'Amount of money requested',
  `currency` enum('USD','EUR','GBP','CAD','AUD','JPY','CHF','CNY') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'USD' COMMENT 'Currency of the loan',
  `company_description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Description of the company',
  `social_media_links` json DEFAULT NULL COMMENT 'JSON object containing social media links',
  `loan_purpose` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Reason for loan requirement',
  `loan_type` enum('equipment','expansion','working_capital','inventory','real_estate','startup','other') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Type of loan',
  `status` enum('pending','active','funded','closed','expired') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending' COMMENT 'Current status of the loan request',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `expires_at` timestamp NULL DEFAULT NULL COMMENT 'When the request expires',
  `archived` tinyint(1) DEFAULT '0' COMMENT 'Whether the loan request is archived by admin',
  `archived_by` int DEFAULT NULL COMMENT 'Admin who archived this request',
  `archived_at` timestamp NULL DEFAULT NULL COMMENT 'When the request was archived',
  `original_status` enum('pending','active','funded','closed','expired') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'The status before it was closed',
  `closed_by` int DEFAULT NULL COMMENT 'Admin who closed this request',
  `closed_at` timestamp NULL DEFAULT NULL COMMENT 'When the request was closed',
  `closed_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Reason for closing the request',
  `funded_by` int DEFAULT NULL COMMENT 'Lender who funded this request',
  `funded_at` timestamp NULL DEFAULT NULL COMMENT 'When the request was funded'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `loan_requests`
--

INSERT INTO `loan_requests` (`id`, `borrower_id`, `company_id`, `amount_requested`, `currency`, `company_description`, `social_media_links`, `loan_purpose`, `loan_type`, `status`, `created_at`, `updated_at`, `expires_at`, `archived`, `archived_by`, `archived_at`, `original_status`, `closed_by`, `closed_at`, `closed_reason`, `funded_by`, `funded_at`) VALUES
(8, 2, 1, 10000.00, 'USD', 'iuogyvyuvyuvyuvyuvuyv', '{\"twitter\": \"\", \"website\": \"\", \"facebook\": \"\", \"linkedin\": \"\", \"instagram\": \"\"}', 'ygfovouyvyvyuygfovouyvyvyuygfovouyvyvyuygfovouyvyvyuygfovouyvyvyuygfovouyvyvyuygfovouyvyvyuygfovouyvyvyuygfovouyvyvyuygfovouyvyvyuygfovouyvy', 'working_capital', 'pending', '2025-08-29 12:31:55', '2025-09-10 00:02:46', '2025-09-07 10:00:00', 0, NULL, NULL, 'funded', NULL, NULL, NULL, NULL, NULL),
(10, 2, 1, 5000.00, 'AUD', '314f134g134g134g', NULL, '134g134g134g134g', 'working_capital', 'closed', '2025-09-01 04:57:35', '2025-09-10 00:02:46', '2025-09-07 10:00:00', 0, NULL, NULL, 'funded', 1, '2025-09-01 05:39:50', 'erinougeqroginqeoirgjnioqenriogqoier', NULL, NULL),
(12, 2, 1, 100.00, 'AUD', NULL, NULL, 'weasea', 'equipment', 'pending', '2025-09-10 01:24:00', '2025-09-10 01:24:00', '2025-09-11 00:00:00', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(15, 2, 1, 213121.00, 'AUD', NULL, NULL, '123132', 'equipment', 'pending', '2025-09-10 02:02:09', '2025-09-10 02:02:09', '2025-09-25 00:00:00', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sql_content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `executed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `checksum` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `name`, `sql_content`, `executed_at`, `checksum`) VALUES
(1, '001_add_loan_system', 'Migration for loan request system and company statistics tables', '2025-08-26 05:32:15', 'abc123');

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  `theme` enum('light','dark','auto') DEFAULT 'auto' COMMENT 'UI theme preference',
  `language` varchar(10) DEFAULT 'en' COMMENT 'Language preference (ISO 639-1)',
  `timezone` varchar(50) DEFAULT 'UTC' COMMENT 'Timezone preference',
  `notifications` json DEFAULT NULL COMMENT 'Notification preferences',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password_hash`, `first_name`, `last_name`, `user_type`, `company`, `phone`, `address`, `is_active`, `is_approved`, `is_super_admin`, `failed_login_attempts`, `account_locked_until`, `profile_picture`, `bio`, `theme`, `language`, `timezone`, `notifications`, `created_at`, `updated_at`) VALUES
(1, 'admin@equirank.com', '$2b$12$gvpowO.QzOeSMOXl58X17ebpyF5/AZEZbXQf77x5wWkS8y.cOeZBW', 'Admin', 'User', 'admin', 'EquiRank Admin', '+1234567890', '123 Admin St, Admin City', 1, 1, 1, 0, NULL, NULL, NULL, 'auto', 'en', 'UTC', NULL, '2025-08-10 11:54:38', '2025-08-17 06:38:47'),
(2, 'borrower1@company.com', '$2b$12$gvpowO.QzOeSMOXl58X17ebpyF5/AZEZbXQf77x5wWkS8y.cOeZBW', 'John', 'Smith', 'borrower', 'Tech Startup Inc', '+1234567891', '456 Business Ave, Tech City', 1, 1, 0, 0, NULL, NULL, NULL, 'dark', 'en', 'UTC', NULL, '2025-08-10 11:54:38', '2025-09-01 13:33:56'),
(3, 'lender1@bank.com', '$2b$12$gvpowO.QzOeSMOXl58X17ebpyF5/AZEZbXQf77x5wWkS8y.cOeZBW', 'Jane', 'Doe', 'lender', 'Investment Bank Ltd', '+1234567892', '789 Finance Blvd, Bank City', 1, 1, 0, 0, NULL, NULL, NULL, 'auto', 'en', 'UTC', NULL, '2025-08-10 11:54:38', '2025-08-10 15:19:37'),
(4, 'borrower2@individual.com', '$2b$12$gvpowO.QzOeSMOXl58X17ebpyF5/AZEZbXQf77x5wWkS8y.cOeZBW', 'Mike', 'Johnson', 'borrower', NULL, '+1234567893', '321 Personal St, Individual City', 1, 1, 0, 0, NULL, NULL, NULL, 'auto', 'en', 'UTC', NULL, '2025-08-10 11:54:38', '2025-09-08 04:11:54'),
(5, 'lender2@investor.com', '$2b$12$gvpowO.QzOeSMOXl58X17ebpyF5/AZEZbXQf77x5wWkS8y.cOeZBW', 'Sarah', 'Wilson', 'lender', NULL, '+1234567894', '654 Investor Ave, Investment City', 0, 0, 0, 0, NULL, NULL, NULL, 'auto', 'en', 'UTC', NULL, '2025-08-10 11:54:38', '2025-09-08 04:11:58'),
(6, 'complete.borrower@test.com', '$2b$12$gvpowO.QzOeSMOXl58X17ebpyF5/AZEZbXQf77x5wWkS8y.cOeZBW', 'Complete', 'Borrower', 'borrower', 'Complete Tech Solutions Inc', '+1555123456', '456 Innovation Drive, Silicon Valley, CA 94000', 1, 1, 0, 0, NULL, NULL, 'Experienced entrepreneur with 7+ years in the tech industry, specializing in AI/ML solutions.', 'auto', 'en', 'UTC', '{\"sms\": false, \"push\": true, \"email\": true}', '2025-09-09 12:21:17', '2025-09-09 12:21:17');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_profiles`
--
ALTER TABLE `admin_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD KEY `idx_admin_level` (`admin_level`);

--
-- Indexes for table `borrower_profiles`
--
ALTER TABLE `borrower_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD KEY `idx_borrower_industry` (`industry`),
  ADD KEY `idx_borrower_location` (`location`),
  ADD KEY `idx_borrower_years_in_business` (`years_in_business`),
  ADD KEY `idx_borrower_employee_count` (`employee_count`),
  ADD KEY `idx_borrower_revenue_range` (`revenue_range`),
  ADD KEY `idx_borrower_profile_completion` (`profile_completion_percentage`),
  ADD KEY `idx_borrower_qa_rating` (`qa_rating`),
  ADD KEY `idx_borrower_qa_rating_updated` (`qa_rating_updated_at`);

--
-- Indexes for table `company_statistics`
--
ALTER TABLE `company_statistics`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD KEY `idx_company_statistics_industry` (`industry`);

--
-- Indexes for table `company_values`
--
ALTER TABLE `company_values`
  ADD PRIMARY KEY (`id`),
  ADD KEY `borrowerForeignKey` (`borrower_id`);

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
-- Indexes for table `lender_profiles`
--
ALTER TABLE `lender_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD KEY `idx_lender_institution_type` (`institution_type`),
  ADD KEY `idx_lender_risk_appetite` (`risk_appetite`);

--
-- Indexes for table `loan_requests`
--
ALTER TABLE `loan_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_loan_requests_borrower_id` (`borrower_id`),
  ADD KEY `idx_loan_requests_status` (`status`),
  ADD KEY `idx_loan_requests_loan_type` (`loan_type`),
  ADD KEY `idx_loan_requests_created_at` (`created_at`),
  ADD KEY `idx_loan_requests_expires_at` (`expires_at`),
  ADD KEY `fk_loan_requests_archived_by` (`archived_by`),
  ADD KEY `fk_loan_requests_closed_by` (`closed_by`),
  ADD KEY `fk_loan_requests_funded_by` (`funded_by`),
  ADD KEY `fk_company_key` (`company_id`);

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
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin_profiles`
--
ALTER TABLE `admin_profiles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `borrower_profiles`
--
ALTER TABLE `borrower_profiles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `company_statistics`
--
ALTER TABLE `company_statistics`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `company_values`
--
ALTER TABLE `company_values`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `contact_messages`
--
ALTER TABLE `contact_messages`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `lender_profiles`
--
ALTER TABLE `lender_profiles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `loan_requests`
--
ALTER TABLE `loan_requests`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `admin_profiles`
--
ALTER TABLE `admin_profiles`
  ADD CONSTRAINT `fk_admin_profiles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `borrower_profiles`
--
ALTER TABLE `borrower_profiles`
  ADD CONSTRAINT `fk_borrower_profiles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `company_statistics`
--
ALTER TABLE `company_statistics`
  ADD CONSTRAINT `fk_company_statistics_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `company_values`
--
ALTER TABLE `company_values`
  ADD CONSTRAINT `borrowerForeignKey` FOREIGN KEY (`borrower_id`) REFERENCES `borrower_profiles` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD CONSTRAINT `fk_parent_message` FOREIGN KEY (`parent_message_id`) REFERENCES `contact_messages` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `lender_profiles`
--
ALTER TABLE `lender_profiles`
  ADD CONSTRAINT `fk_lender_profiles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `loan_requests`
--
ALTER TABLE `loan_requests`
  ADD CONSTRAINT `fk_company_key` FOREIGN KEY (`company_id`) REFERENCES `company_values` (`id`) ON DELETE SET NULL ON UPDATE SET NULL,
  ADD CONSTRAINT `fk_loan_requests_archived_by` FOREIGN KEY (`archived_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_loan_requests_borrower` FOREIGN KEY (`borrower_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_loan_requests_closed_by` FOREIGN KEY (`closed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_loan_requests_funded_by` FOREIGN KEY (`funded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD CONSTRAINT `fk_password_reset_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
