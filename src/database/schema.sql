-- EquiRank Database Schema

CREATE DATABASE IF NOT EXISTS equirank;
USE equirank;

-- Users table 
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    user_type ENUM('borrower', 'lender', 'admin') NOT NULL,
    entity_type ENUM('company', 'individual') NOT NULL,
    company VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Sample data
INSERT INTO users (email, password_hash, first_name, last_name, user_type, entity_type, company, phone, address, is_approved) VALUES
('admin@equirank.com', 'admin123', 'Admin', 'User', 'admin', 'company', 'EquiRank Admin', '+1234567890', '123 Admin St, Admin City', true),
('borrower1@company.com', 'borrower123', 'John', 'Smith', 'borrower', 'company', 'Tech Startup Inc', '+1234567891', '456 Business Ave, Tech City', true),
('lender1@bank.com', 'lender123', 'Jane', 'Doe', 'lender', 'company', 'Investment Bank Ltd', '+1234567892', '789 Finance Blvd, Bank City', true),
('borrower2@individual.com', 'borrower456', 'Mike', 'Johnson', 'borrower', 'individual', NULL, '+1234567893', '321 Personal St, Individual City', false),
('lender2@investor.com', 'lender456', 'Sarah', 'Wilson', 'lender', 'individual', NULL, '+1234567894', '654 Investor Ave, Investment City', false);

-- Indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_entity_type ON users(entity_type);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_is_approved ON users(is_approved);

-- Contact Messages table for storing contact form submissions
CREATE TABLE IF NOT EXISTS contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('new', 'read', 'replied') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Index for contact messages
CREATE INDEX idx_contact_messages_status ON contact_messages(status);
CREATE INDEX idx_contact_messages_created_at ON contact_messages(created_at);
