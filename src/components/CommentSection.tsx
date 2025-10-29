import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Send, Heart, Clock, Edit2, Trash2, Check, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useWallet } from '../contexts/WalletContext';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: {
    id: string;
    username: string;
    avatar_url: string | null;
    wallet_address: string;
  };
}

interface CommentSectionProps {
  projectId?: string;
  revivalId?: string;
  initialCount?: number;
}

export default function CommentSection({ projectId, revivalId, initialCount = 0 }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const { profile, isConnected } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    loadComments();
  }, [projectId, revivalId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const query = supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          user:user_id (
            id,
            username,
            avatar_url,
            wallet_address
          )
        `)
        .order('created_at', { ascending: false });

      if (projectId) {
        query.eq('project_id', projectId);
      } else if (revivalId) {
        query.eq('revival_id', revivalId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setComments(data as any || []);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !isConnected || !profile) return;

    try {
      setSubmitting(true);
      const commentData: any = {
        user_id: profile.id,
        content: newComment.trim(),
      };

      if (projectId) {
        commentData.project_id = projectId;
      } else if (revivalId) {
        commentData.revival_id = revivalId;
      }

      const { error } = await supabase.from('comments').insert(commentData);

      if (error) throw error;

      setNewComment('');
      await loadComments();
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      const { error } = await supabase
        .from('comments')
        .update({ content: editContent.trim() })
        .eq('id', commentId);

      if (error) throw error;

      setEditingId(null);
      setEditContent('');
      await loadComments();
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Failed to update comment. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      await loadComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment. Please try again.');
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const commentDate = new Date(date);
    const seconds = Math.floor((now.getTime() - commentDate.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return commentDate.toLocaleDateString();
  };

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Discussion</h3>
            <p className="text-sm text-zinc-400">
              {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {isConnected ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-3">
              <img
                src={profile?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400'}
                alt="Your avatar"
                className="w-10 h-10 rounded-full object-cover border-2 border-zinc-700"
              />
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts, feedback, or questions..."
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                  rows={3}
                  disabled={submitting}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!newComment.trim() || submitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-8 px-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
            <MessageSquare className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400 mb-4">Connect your wallet to join the discussion</p>
            <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 transition-all">
              Connect Wallet
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex gap-3">
                <div className="w-10 h-10 bg-zinc-800 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-zinc-800 rounded w-1/4" />
                  <div className="h-20 bg-zinc-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => {
              const isOwner = profile?.id === comment.user.id;
              const isEditing = editingId === comment.id;
              
              return (
                <div
                  key={comment.id}
                  className="group bg-zinc-800/30 hover:bg-zinc-800/50 border border-zinc-800 rounded-lg p-4 transition-all"
                >
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate(`/profile/${comment.user.wallet_address}`)}
                      className="flex-shrink-0 hover:opacity-80 transition-opacity"
                    >
                      <img
                        src={comment.user.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400'}
                        alt={comment.user.username}
                        className="w-10 h-10 rounded-full object-cover border-2 border-zinc-700"
                      />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/profile/${comment.user.wallet_address}`)}
                            className="font-semibold text-white hover:text-primary transition-colors"
                          >
                            {comment.user.username}
                          </button>
                          <div className="flex items-center gap-1 text-xs text-zinc-500">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(comment.created_at)}
                          </div>
                        </div>
                        {isOwner && !isEditing && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEdit(comment)}
                              className="p-1 text-zinc-500 hover:text-blue-400 transition-colors"
                              title="Edit comment"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDelete(comment.id)}
                              className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                              title="Delete comment"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {isEditing ? (
                        <div className="space-y-2">
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white text-sm focus:outline-none focus:border-primary resize-none"
                            rows={3}
                          />
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSaveEdit(comment.id)}
                              className="flex items-center gap-1 px-3 py-1 bg-primary text-black text-xs font-medium rounded hover:bg-primary/80 transition-colors"
                            >
                              <Check className="w-3 h-3" />
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="flex items-center gap-1 px-3 py-1 bg-zinc-700 text-zinc-300 text-xs font-medium rounded hover:bg-zinc-600 transition-colors"
                            >
                              <X className="w-3 h-3" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
                            {comment.content}
                          </p>
                          <div className="flex items-center gap-4 mt-3">
                            <button className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-red-400 transition-colors group">
                              <Heart className="w-4 h-4 group-hover:fill-current" />
                              <span>Like</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 px-4">
            <MessageSquare className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500 text-lg mb-2">No comments yet</p>
            <p className="text-zinc-600 text-sm">Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  );
}