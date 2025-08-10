-- EquiRank Database Schema - Simplified Version
-- Essential tables and security features only

CREATE DATABASE IF NOT EXISTS equirank;
USE equirank;

-- Users table with essential security
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL COMMENT 'bcrypt hashed password (min 60 chars)',
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    user_type ENUM('borrower', 'lender', 'admin') NOT NULL,
    entity_type ENUM('company', 'individual') NOT NULL,
    company VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_approved BOOLEAN DEFAULT FALSE,
    failed_login_attempts INT DEFAULT 0 COMMENT 'Track failed login attempts',
    account_locked_until TIMESTAMP NULL COMMENT 'Account lockout until timestamp',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Essential security constraints
    CONSTRAINT chk_password_length CHECK (LENGTH(password_hash) >= 60),
    CONSTRAINT chk_email_format CHECK (email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Contact Messages table for storing contact form submissions
CREATE TABLE IF NOT EXISTS contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('new', 'read', 'replied') DEFAULT 'new',
    ip_address VARCHAR(45) COMMENT 'Store IP for rate limiting',
    user_agent TEXT COMMENT 'Store user agent for security',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Email format validation
    CONSTRAINT chk_contact_email_format CHECK (email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Essential indexes for performance and security
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_is_approved ON users(is_approved);
CREATE INDEX IF NOT EXISTS idx_users_failed_login_attempts ON users(failed_login_attempts);
CREATE INDEX IF NOT EXISTS idx_users_account_locked_until ON users(account_locked_until);

-- Contact messages indexes
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at);

-- Sample users with bcrypt hashed passwords (12 rounds)
-- Password for all users is: Test123!
INSERT IGNORE INTO users (email, password_hash, first_name, last_name, user_type, entity_type, company, phone, address, is_approved, is_active) VALUES
('admin@equirank.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KqHh6O', 'Admin', 'User', 'admin', 'company', 'EquiRank Admin', '+1234567890', '123 Admin St, Admin City', true, true),
('borrower1@company.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KqHh6O', 'John', 'Smith', 'borrower', 'company', 'Tech Startup Inc', '+1234567891', '456 Business Ave, Tech City', true, true),
('lender1@bank.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KqHh6O', 'Jane', 'Doe', 'lender', 'company', 'Investment Bank Ltd', '+1234567892', '789 Finance Blvd, Bank City', true, true),
('borrower2@individual.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KqHh6O', 'Mike', 'Johnson', 'borrower', 'individual', NULL, '+1234567893', '321 Personal St, Individual City', false, true),
('lender2@investor.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KqHh6O', 'Sarah', 'Wilson', 'lender', 'individual', NULL, '+1234567894', '654 Investor Ave, Investment City', false, true);

-- Success message
SELECT 'Database schema created successfully!' as status;
