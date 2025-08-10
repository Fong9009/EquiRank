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

-- Password reset tokens table for forgot password functionality
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL COMMENT 'Secure random token for password reset',
    expires_at TIMESTAMP NOT NULL COMMENT 'Token expiration timestamp',
    used BOOLEAN DEFAULT FALSE COMMENT 'Whether token has been used',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key to users table
    CONSTRAINT fk_password_reset_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    -- Token should be at least 32 characters
    CONSTRAINT chk_token_length CHECK (LENGTH(token) >= 32)
);

-- Contact Messages table for storing contact form submissions
CREATE TABLE IF NOT EXISTS contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id VARCHAR(36) NOT NULL COMMENT 'UUID for conversation threading',
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    message_type ENUM('user_message', 'admin_reply') DEFAULT 'user_message' COMMENT 'Type of message in conversation',
    parent_message_id INT NULL COMMENT 'Reference to parent message for replies',
    status ENUM('new', 'read', 'replied', 'closed') DEFAULT 'new',
    ip_address VARCHAR(45) COMMENT 'Store IP for rate limiting',
    user_agent TEXT COMMENT 'Store user agent for security',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Email format validation
    CONSTRAINT chk_contact_email_format CHECK (email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    -- Foreign key for parent message (self-referencing)
    CONSTRAINT fk_parent_message FOREIGN KEY (parent_message_id) REFERENCES contact_messages(id) ON DELETE SET NULL
);

-- Essential indexes for performance and security
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_is_approved ON users(is_approved);
CREATE INDEX IF NOT EXISTS idx_users_failed_login_attempts ON users(failed_login_attempts);
CREATE INDEX IF NOT EXISTS idx_users_account_locked_until ON users(account_locked_until);

-- Password reset tokens indexes
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_used ON password_reset_tokens(used);

-- Contact messages indexes
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_messages_conversation_id ON contact_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_message_type ON contact_messages(message_type);
CREATE INDEX IF NOT EXISTS idx_contact_messages_parent_message_id ON contact_messages(parent_message_id);

-- Sample users with bcrypt hashed passwords (12 rounds)
-- Password for all users is: Test123!
INSERT IGNORE INTO users (email, password_hash, first_name, last_name, user_type, entity_type, company, phone, address, is_approved, is_active) VALUES
('admin@equirank.com', '$2b$12$gvpowO.QzOeSMOXl58X17ebpyF5/AZEZbXQf77x5wWkS8y.cOeZBW', 'Admin', 'User', 'admin', 'company', 'EquiRank Admin', '+1234567890', '123 Admin St, Admin City', true, true),
('borrower1@company.com', '$2b$12$gvpowO.QzOeSMOXl58X17ebpyF5/AZEZbXQf77x5wWkS8y.cOeZBW', 'John', 'Smith', 'borrower', 'company', 'Tech Startup Inc', '+1234567891', '456 Business Ave, Tech City', true, true),
('lender1@bank.com', '$2b$12$gvpowO.QzOeSMOXl58X17ebpyF5/AZEZbXQf77x5wWkS8y.cOeZBW', 'Jane', 'Doe', 'lender', 'company', 'Investment Bank Ltd', '+1234567892', '789 Finance Blvd, Bank City', true, true),
('borrower2@individual.com', '$2b$12$gvpowO.QzOeSMOXl58X17ebpyF5/AZEZbXQf77x5wWkS8y.cOeZBW', 'Mike', 'Johnson', 'borrower', 'individual', NULL, '+1234567893', '321 Personal St, Individual City', true, true),
('lender2@investor.com', '$2b$12$gvpowO.QzOeSMOXl58X17ebpyF5/AZEZbXQf77x5wWkS8y.cOeZBW', 'Sarah', 'Wilson', 'lender', 'individual', NULL, '+1234567894', '654 Investor Ave, Investment City', false, false);

-- Success message
SELECT 'Database schema created successfully!' as status;
