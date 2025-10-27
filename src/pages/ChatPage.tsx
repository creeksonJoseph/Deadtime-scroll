import { useState, useEffect } from 'react';
import { Send, PlusCircle } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { supabase, Message } from '../lib/supabase';

export default function ChatPage() {
  const { profile } = useWallet();
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      loadMessages();
    }
  }, [profile]);

  const loadMessages = async () => {
    if (!profile) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*, sender:sender_id(*), recipient:recipient_id(*)')
        .or(`sender_id.eq.${profile.id},recipient_id.eq.${profile.id}`)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-zinc-gray text-xl">Please connect your wallet</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-zinc-400 text-xl">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-zinc-400">No messages yet</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender_id === profile.id;
            return (
              <div key={msg.id}>
                {isOwn ? (
                  <div className="flex items-end gap-3 p-4 justify-end">
                    <div className="flex flex-1 flex-col gap-1 items-end">
                      <p className="text-zinc-400 text-[13px] max-w-[360px] text-right">
                        You • {new Date(msg.created_at).toLocaleTimeString()}
                      </p>
                      <p className="text-base leading-normal max-w-[360px] px-4 py-3 bg-primary text-black">
                        {msg.content}
                      </p>
                    </div>
                    <img
                      className="w-10 h-10 shrink-0"
                      alt="Your avatar"
                      src={profile.avatar_url || 'https://via.placeholder.com/40'}
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-4">
                    <img
                      className="w-10 h-10 shrink-0"
                      alt="Sender avatar"
                      src={msg.sender?.avatar_url || 'https://via.placeholder.com/40'}
                    />
                    <div className="flex flex-1 flex-col gap-1 items-start">
                      <p className="text-zinc-400 text-[13px] max-w-[360px]">
                        {msg.sender?.username} • {new Date(msg.created_at).toLocaleTimeString()}
                      </p>
                      <p className="text-base leading-normal max-w-[360px] px-4 py-3 bg-zinc-gray text-white">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      <div className="flex items-center px-6 py-4 gap-3 border-t border-solid border-zinc-gray/50">
        <label className="flex flex-col min-w-40 h-12 flex-1">
          <div className="flex w-full flex-1 items-stretch h-full">
            <input
              className="flex w-full min-w-0 flex-1 text-white focus:outline-0 focus:ring-0 border-none bg-zinc-gray/30 h-full placeholder:text-zinc-400 px-4 text-base"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <div className="flex border-none bg-zinc-gray/30 items-center justify-center pr-2">
              <div className="flex items-center gap-2">
                <button className="flex items-center justify-center p-2 text-white">
                  <PlusCircle />
                </button>
                <button className="flex items-center justify-center p-2 bg-primary text-black">
                  <Send />
                </button>
              </div>
            </div>
          </div>
        </label>
      </div>
    </div>
  );
}
