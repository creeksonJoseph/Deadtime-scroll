import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageCircle, Users, Send, ArrowLeft } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { messageService, Message, Conversation } from '../services/messageService';
import { profileService } from '../services/profileService';


export default function ChatPage() {
  const { partnerId } = useParams();
  const navigate = useNavigate();
  const { profile } = useWallet();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [partnerProfile, setPartnerProfile] = useState<any>(null);

  useEffect(() => {
    if (profile?.id) {
      if (partnerId) {
        loadPartnerProfile();
        loadMessages();
      } else {
        loadConversations();
      }
    }
  }, [profile?.id, partnerId]);

  const loadPartnerProfile = async () => {
    if (!partnerId) return;
    try {
      const data = await profileService.getById(partnerId);
      setPartnerProfile(data);
    } catch (error) {
      console.error('Error loading partner profile:', error);
    }
  };

  const loadConversations = async () => {
    if (!profile?.id) return;
    try {
      const data = await messageService.getConversations(profile.id);
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!profile?.id || !partnerId) return;
    try {
      const data = await messageService.getMessages(profile.id, partnerId);
      setMessages(data);
      
      // Mark messages as read
      const unreadMessages = data.filter(m => m.recipient_id === profile.id && !m.is_read);
      if (unreadMessages.length > 0) {
        await messageService.markAsRead(unreadMessages.map(m => m.id));
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !profile?.id || !partnerId) return;
    
    try {
      const message = await messageService.sendMessage(profile.id, partnerId, newMessage);
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const selectConversation = (conversation: Conversation) => {
    navigate(`/chat/${conversation.user.id}`);
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-zinc-400 text-xl">Please connect your wallet to access messages</p>
      </div>
    );
  }

  // Direct chat with specific user
  if (partnerId) {
    return (
      <div className="bg-background-dark min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={() => navigate('/chat')}
              className="text-zinc-400 hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <MessageCircle className="w-10 h-10 text-primary" />
            <h1 className="text-white text-4xl font-bold">
              {partnerProfile ? `Chat with ${partnerProfile.username}` : 'Chat'}
            </h1>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg h-[600px] flex flex-col">
            {/* Chat Header */}
            {partnerProfile && (
              <div className="p-4 border-b border-zinc-800">
                <button
                  onClick={() => navigate(`/profile/${partnerProfile.wallet_address}`)}
                  className="flex items-center gap-3 hover:bg-zinc-800 rounded-lg p-2 -m-2 transition-colors w-full text-left"
                >
                  <img
                    src={partnerProfile.avatar_url || 'https://via.placeholder.com/40'}
                    alt={partnerProfile.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-white font-semibold">{partnerProfile.username}</p>
                    <p className="text-zinc-400 text-sm">@{partnerProfile.username}</p>
                  </div>
                </button>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-zinc-400">Loading messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-zinc-400">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => {
                  const isOwn = message.sender_id === profile.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isOwn
                            ? 'bg-primary text-black'
                            : 'bg-zinc-800 text-white'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            isOwn ? 'text-black/70' : 'text-zinc-400'
                          }`}
                        >
                          {new Date(message.created_at).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-zinc-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-primary"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-primary text-black px-4 py-2 rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Conversations list view
  return (
    <div className="bg-background-dark min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <MessageCircle className="w-10 h-10 text-primary" />
          <h1 className="text-white text-4xl font-bold">Messages</h1>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="p-4 border-b border-zinc-800">
            <h2 className="text-white font-bold flex items-center gap-2">
              <Users className="w-5 h-5" />
              Conversations
            </h2>
          </div>
          <div className="divide-y divide-zinc-800">
            {loading ? (
              <div className="p-8 text-zinc-400 text-center">Loading...</div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-zinc-400 text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
                <p>No conversations yet</p>
                <p className="text-sm mt-2">Visit a user's profile and click "Message" to start chatting!</p>
              </div>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.user.id}
                  onClick={() => selectConversation(conversation)}
                  className="p-4 hover:bg-zinc-800 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={conversation.user.avatar_url || 'https://via.placeholder.com/40'}
                      alt={conversation.user.username}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold">{conversation.user.username}</p>
                      <p className="text-zinc-400 text-sm truncate">
                        {conversation.lastMessage.content}
                      </p>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <div className="bg-primary text-black text-xs px-2 py-1 rounded-full font-bold">
                        {conversation.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}