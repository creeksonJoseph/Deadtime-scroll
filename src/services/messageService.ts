import { supabase } from '../lib/supabase';

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: {
    id: string;
    username: string;
    avatar_url: string;
    wallet_address: string;
  };
  recipient?: {
    id: string;
    username: string;
    avatar_url: string;
    wallet_address: string;
  };
}

export interface Conversation {
  user: {
    id: string;
    username: string;
    avatar_url: string;
    wallet_address: string;
  };
  lastMessage: Message;
  unreadCount: number;
}

export const messageService = {
  async getConversations(userId: string): Promise<Conversation[]> {
    // Get all messages where user is sender or recipient
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(id, username, avatar_url, wallet_address),
        recipient:profiles!messages_recipient_id_fkey(id, username, avatar_url, wallet_address)
      `)
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Group messages by conversation partner
    const conversationMap = new Map<string, Conversation>();

    messages?.forEach((message) => {
      const isFromUser = message.sender_id === userId;
      const partner = isFromUser ? message.recipient : message.sender;
      
      if (!partner) return;

      const existing = conversationMap.get(partner.id);
      if (!existing || new Date(message.created_at) > new Date(existing.lastMessage.created_at)) {
        conversationMap.set(partner.id, {
          user: partner,
          lastMessage: message,
          unreadCount: 0 // Will be calculated separately
        });
      }
    });

    // Calculate unread counts
    for (const [partnerId, conversation] of conversationMap) {
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('sender_id', partnerId)
        .eq('recipient_id', userId)
        .eq('is_read', false);
      
      conversation.unreadCount = count || 0;
    }

    return Array.from(conversationMap.values())
      .sort((a, b) => new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime());
  },

  async getMessages(userId: string, partnerId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(id, username, avatar_url, wallet_address),
        recipient:profiles!messages_recipient_id_fkey(id, username, avatar_url, wallet_address)
      `)
      .or(`and(sender_id.eq.${userId},recipient_id.eq.${partnerId}),and(sender_id.eq.${partnerId},recipient_id.eq.${userId})`)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async sendMessage(senderId: string, recipientId: string, content: string): Promise<Message> {
    // Verify both users exist
    const { data: users, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .in('id', [senderId, recipientId]);
    
    if (userError || !users || users.length !== 2) {
      throw new Error('Invalid sender or recipient');
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: senderId,
        recipient_id: recipientId,
        content: content.trim(),
        is_read: false
      })
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(id, username, avatar_url, wallet_address),
        recipient:profiles!messages_recipient_id_fkey(id, username, avatar_url, wallet_address)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async markAsRead(messageIds: string[]): Promise<void> {
    if (messageIds.length === 0) return;
    
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .in('id', messageIds);

    if (error) throw error;
  }
};