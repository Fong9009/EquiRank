import { executeQuery, executeSingleQuery } from './index';
import crypto from "crypto";
import {RowDataPacket} from "mysql2";

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

export async function getAllArchivedMessages(): Promise<ContactMessage[]> {
    const query = `
    SELECT * FROM contact_messages 
    WHERE archived = TRUE 
    ORDER BY created_at DESC`;

    return await executeQuery<ContactMessage>(query);
}

export async function getMessageStatus(status?: string): Promise<ContactMessage[]> {
    let query = `
        SELECT * FROM contact_messages 
        WHERE archived = FALSE
    `;

    const params: (string | boolean)[] = [];

    if (status && status !== 'all') {
        query += ' AND status = ?';
        params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    return await executeQuery<ContactMessage>(query, params);
}

export async function getContactMessageId(conversation_id: string): Promise<ContactMessage | null> {
    const query = `
    SELECT id FROM contact_messages 
    WHERE conversation_id = ?
  `;
    const message = await executeQuery<ContactMessage>(query, [conversation_id]);
    return message.length > 0 ? message[0] : null;
}

export async function updateContactMessageArchive(archived: boolean, conversationId: string): Promise<boolean> {
    const query = `UPDATE contact_messages SET archived = ? WHERE conversation_id = ?`
    const result = await executeSingleQuery(query, [archived, conversationId]);
    return result.affectedRows > 0;
}

export async function deleteContactViaConversationId(conversationId: string): Promise<boolean> {
    const query = `DELETE FROM contact_messages WHERE conversation_id = ?`;
    const result = await executeSingleQuery(query, [conversationId]);

    return result.affectedRows > 0;
}