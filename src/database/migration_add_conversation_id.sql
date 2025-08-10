-- Migration: Add conversation threading to contact_messages table
-- Run this script on existing databases to add conversation support

USE equirank;

-- Add new columns
ALTER TABLE contact_messages 
ADD COLUMN conversation_id VARCHAR(36) NOT NULL DEFAULT (UUID()) COMMENT 'UUID for conversation threading',
ADD COLUMN message_type ENUM('user_message', 'admin_reply') DEFAULT 'user_message' COMMENT 'Type of message in conversation',
ADD COLUMN parent_message_id INT NULL COMMENT 'Reference to parent message for replies';

-- Update existing messages to have unique conversation IDs
UPDATE contact_messages SET conversation_id = UUID() WHERE conversation_id = '';

-- Add foreign key constraint (after ensuring all parent_message_id values are valid)
ALTER TABLE contact_messages 
ADD CONSTRAINT fk_parent_message 
FOREIGN KEY (parent_message_id) REFERENCES contact_messages(id) ON DELETE SET NULL;

-- Add new indexes
CREATE INDEX idx_contact_messages_conversation_id ON contact_messages(conversation_id);
CREATE INDEX idx_contact_messages_message_type ON contact_messages(message_type);
CREATE INDEX idx_contact_messages_parent_message_id ON contact_messages(parent_message_id);

-- Update status enum to include 'closed'
ALTER TABLE contact_messages 
MODIFY COLUMN status ENUM('new', 'read', 'replied', 'closed') DEFAULT 'new';

-- Success message
SELECT 'Migration completed successfully! Conversation threading is now enabled.' as status;
