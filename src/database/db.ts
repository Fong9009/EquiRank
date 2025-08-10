import mysql from 'mysql2/promise';
import crypto from 'crypto';

/* DATABASE CONNECTION & CONFIGURATION */

interface DatabaseConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port: number;
  waitForConnections: boolean;
  connectionLimit: number;
  queueLimit: number;
}

// Validate required environment variables
function validateEnvironmentVariables() {
  const required = ['DB_HOST', 'DB_USER', 'DB_NAME'];
  const missing = required.filter(key => !process.env[key]);
  
  // DB_PASSWORD can be empty (no password)
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  // Check if DB_PASSWORD exists (even if empty)
  if (process.env.DB_PASSWORD === undefined) {
    throw new Error('Missing required environment variables: DB_PASSWORD');
  }
}

// Validate before creating config
validateEnvironmentVariables();

const defaultConfig: DatabaseConfig = {
  host: process.env.DB_HOST!,
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Create connection pool
const pool = mysql.createPool(defaultConfig);

/* CORE DATABASE FUNCTIONS */

// Test database connection
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Execute a query with parameters
export async function executeQuery<T = any>(
  query: string,
  params?: any[]
): Promise<T[]> {
  try {
    const [rows] = await pool.execute(query, params);
    return rows as T[];
  } catch (error) {
    console.error('Query execution failed:', error);
    throw error;
  }
}

// Execute a single query (for INSERT, UPDATE, DELETE)
export async function executeSingleQuery(
  query: string,
  params?: any[]
): Promise<any> {
  try {
    const [result] = await pool.execute(query, params);
    return result;
  } catch (error) {
    console.error('Single query execution failed:', error);
    throw error;
  }
}

// Get a connection from the pool
export async function getConnection() {
  return await pool.getConnection();
}

// Close the connection pool
export async function closePool() {
  await pool.end();
}

/* USER OPERATIONS */

export interface User {
  id: number;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  user_type: 'borrower' | 'lender' | 'admin';
  entity_type: 'company' | 'individual';
  company?: string;
  phone?: string;
  address?: string;
  is_active: boolean;
  is_approved: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ContactMessage {
  id: number;
  conversation_id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  message_type: 'user_message' | 'admin_reply';
  parent_message_id?: number;
  status: 'new' | 'read' | 'replied' | 'closed';
  created_at: Date;
  updated_at: Date;
}

export async function createUser(
  email: string,
  passwordHash: string,
  firstName: string,
  lastName: string,
  userType: 'borrower' | 'lender' | 'admin',
  entityType: 'company' | 'individual',
  company?: string,
  phone?: string,
  address?: string
): Promise<number> {
  const query = `
    INSERT INTO users (email, password_hash, first_name, last_name, user_type, entity_type, company, phone, address, is_approved)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, false)
  `;
  const result = await executeSingleQuery(query, [email, passwordHash, firstName, lastName, userType, entityType, company, phone, address]);
  return result.insertId;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const query = `
    SELECT * FROM users 
    WHERE email = ? AND is_active = true
  `;
  const results = await executeQuery<User>(query, [email]);
  return results.length > 0 ? results[0] : null;
}

// Check if email exists (including inactive users)
export async function emailExists(email: string): Promise<boolean> {
  const query = `
    SELECT COUNT(*) as count FROM users 
    WHERE email = ?
  `;
  const results = await executeQuery<{count: number}>(query, [email]);
  return results[0]?.count > 0;
}

// Check if email exists for active users only
export async function activeEmailExists(email: string): Promise<boolean> {
  const query = `
    SELECT COUNT(*) as count FROM users 
    WHERE email = ? AND is_active = true
  `;
  const results = await executeQuery<{count: number}>(query, [email]);
  return results[0]?.count > 0;
}

export async function getUserById(id: number): Promise<User | null> {
  const query = `
    SELECT * FROM users 
    WHERE id = ? AND is_active = true
  `;
  const results = await executeQuery<User>(query, [id]);
  return results.length > 0 ? results[0] : null;
}

export async function updateUser(
  id: number,
  updates: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>
): Promise<boolean> {
  const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
  const values = Object.values(updates);
  
  const query = `
    UPDATE users 
    SET ${fields}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  
  const result = await executeSingleQuery(query, [...values, id]);
  return result.affectedRows > 0;
}

export async function deactivateUser(id: number): Promise<boolean> {
  const query = `
    UPDATE users 
    SET is_active = false, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  
  const result = await executeSingleQuery(query, [id]);
  return result.affectedRows > 0;
}

export async function getAllUsers(): Promise<User[]> {
  const query = `
    SELECT * FROM users 
    ORDER BY created_at DESC
  `;
  return await executeQuery<User>(query);
}

export async function getUsersByType(userType: 'borrower' | 'lender' | 'admin'): Promise<User[]> {
  const query = `
    SELECT * FROM users 
    WHERE user_type = ? AND is_active = true
    ORDER BY created_at DESC
  `;
  return await executeQuery<User>(query, [userType]);
}

export async function getBorrowers(): Promise<User[]> {
  return await getUsersByType('borrower');
}

export async function getLenders(): Promise<User[]> {
  return await getUsersByType('lender');
}

export async function getAdmins(): Promise<User[]> {
  return await getUsersByType('admin');
}

// Get users pending approval
export async function getPendingApprovals(): Promise<User[]> {
  const query = `
    SELECT * FROM users 
    WHERE is_approved = false AND is_active = true AND user_type != 'admin'
    ORDER BY created_at ASC
  `;
  return await executeQuery<User>(query);
}

// Approve a user
export async function approveUser(userId: number): Promise<boolean> {
  const query = `
    UPDATE users 
    SET is_approved = true, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  const result = await executeSingleQuery(query, [userId]);
  return result.affectedRows > 0;
}

// Reject a user (deactivate)
export async function rejectUser(userId: number): Promise<boolean> {
  const query = `
    UPDATE users 
    SET is_active = false, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  const result = await executeSingleQuery(query, [userId]);
  return result.affectedRows > 0;
}

// Contact Message Functions
export async function createContactMessage(
  name: string,
  email: string,
  subject: string,
  message: string
): Promise<number> {
  const conversationId = crypto.randomUUID();
  const query = `
    INSERT INTO contact_messages (conversation_id, name, email, subject, message, message_type)
    VALUES (?, ?, ?, ?, ?, 'user_message')
  `;
  const result = await executeSingleQuery(query, [conversationId, name, email, subject, message]);
  return result.insertId;
}

export async function getAllContactMessages(): Promise<ContactMessage[]> {
  const query = `
    SELECT * FROM contact_messages 
    ORDER BY created_at DESC
  `;
  return await executeQuery<ContactMessage>(query);
}

export async function getContactMessagesByStatus(status: 'new' | 'read' | 'replied' | 'closed'): Promise<ContactMessage[]> {
  const query = `
    SELECT * FROM contact_messages 
    WHERE status = ?
    ORDER BY created_at DESC
  `;
  return await executeQuery<ContactMessage>(query, [status]);
}

export async function getContactMessageById(messageId: number): Promise<ContactMessage | null> {
  const query = `
    SELECT * FROM contact_messages 
    WHERE id = ?
  `;
  const messages = await executeQuery<ContactMessage>(query, [messageId]);
  return messages.length > 0 ? messages[0] : null;
}

export async function updateContactMessageStatus(
  messageId: number,
  status: 'new' | 'read' | 'replied' | 'closed'
): Promise<boolean> {
  const query = `
    UPDATE contact_messages 
    SET status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  const result = await executeSingleQuery(query, [status, messageId]);
  return result.affectedRows > 0;
}

export async function deleteContactMessage(messageId: number): Promise<boolean> {
  const query = `
    DELETE FROM contact_messages 
    WHERE id = ?
  `;
  const result = await executeSingleQuery(query, [messageId]);
  return result.affectedRows > 0;
}

// Conversation Management Functions
export async function createAdminReply(
  conversationId: string,
  adminName: string,
  adminEmail: string,
  subject: string,
  message: string,
  parentMessageId: number
): Promise<number> {
  const query = `
    INSERT INTO contact_messages (conversation_id, name, email, subject, message, message_type, parent_message_id)
    VALUES (?, ?, ?, ?, ?, 'admin_reply', ?)
  `;
  const result = await executeSingleQuery(query, [conversationId, adminName, adminEmail, subject, message, parentMessageId]);
  return result.insertId;
}

export async function getConversationThread(conversationId: string): Promise<ContactMessage[]> {
  const query = `
    SELECT * FROM contact_messages 
    WHERE conversation_id = ?
    ORDER BY created_at ASC
  `;
  return await executeQuery<ContactMessage>(query, [conversationId]);
}

export async function getConversations(): Promise<{ conversation_id: string; subject: string; last_message: Date; status: string; message_count: number }[]> {
  const query = `
    SELECT 
      cm1.conversation_id,
      cm1.subject,
      MAX(cm1.created_at) as last_message,
      cm1.status,
      COUNT(*) as message_count
    FROM contact_messages cm1
    GROUP BY cm1.conversation_id, cm1.subject, cm1.status
    ORDER BY last_message DESC
  `;
  return await executeQuery(query);
}

// Export the pool as default
export default pool;
