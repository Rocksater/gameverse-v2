import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DOMPurify from 'dompurify';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { IoClose } from 'react-icons/io5';
import { FaTrash, FaPaperPlane } from 'react-icons/fa6';

const CommentsModal = ({ isOpen, onClose, post }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const isEgg = post?.type === 'easter_egg';
  const idColumn = isEgg ? 'easter_egg_id' : 'post_id';

  const fetchComments = async () => {
    if (!post) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('post_comments')
        .select('*, profiles:user_id(username, avatar_url)')
        .eq(idColumn, post.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (err) {
      console.error('Error fetching comments:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchComments();
  }, [isOpen, post]);

  // Realtime subscription for live post_comments updates (INSERT & DELETE)
  useEffect(() => {
    if (!isOpen || !post) return;

    const channel = supabase
      .channel(`realtime-comments-${post.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'post_comments',
          filter: `${idColumn}=eq.${post.id}`,
        },
        async (payload) => {
          // Fetch commenter profile details for real-time item broadcast
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', payload.new.user_id)
            .single();

          const incomingComment = {
            ...payload.new,
            profiles: profile || { username: 'Gamer' },
          };

          setComments((prev) => {
            if (prev.some((c) => c.id === incomingComment.id)) return prev;
            return [...prev, incomingComment];
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'post_comments',
          filter: `${idColumn}=eq.${post.id}`,
        },
        (payload) => {
          setComments((prev) => prev.filter((c) => c.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, post, idColumn]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);

      const payload = {
        user_id: user.id,
        content: newComment.trim(),
        [idColumn]: post.id,
      };

      const { data, error } = await supabase
        .from('post_comments')
        .insert([payload])
        .select('*, profiles:user_id(username, avatar_url)')
        .single();

      if (error) throw error;

      setComments((prev) => {
        if (prev.some((c) => c.id === data.id)) return prev;
        return [...prev, data];
      });
      setNewComment('');
    } catch (err) {
      alert('Failed to post comment: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const { error } = await supabase
        .from('post_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      alert('Failed to delete comment: ' + err.message);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && post && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              backgroundColor: 'var(--gv-card)',
              border: '1px solid var(--gv-border)',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '550px',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}
          >
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--gv-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Replies for "{post.title}"</h3>
              <button
                onClick={onClose}
                style={{ background: 'none', border: 'none', color: 'var(--gv-muted)', fontSize: '1.4rem', cursor: 'pointer' }}
              >
                <IoClose />
              </button>
            </div>

            <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {loading ? (
                <p style={{ color: 'var(--gv-muted)', textAlign: 'center' }}>Loading comments...</p>
              ) : comments.length === 0 ? (
                <p style={{ color: 'var(--gv-muted)', textAlign: 'center' }}>No replies yet. Be the first to join the conversation!</p>
              ) : (
                comments.map((comment) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      backgroundColor: 'var(--gv-bg, #0f172a)',
                      padding: '0.85rem',
                      borderRadius: '8px',
                      border: '1px solid var(--gv-border)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <img
                          src={comment.profiles?.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=guest'}
                          alt="Avatar"
                          style={{ width: '24px', height: '24px', borderRadius: '50%' }}
                        />
                        <strong style={{ fontSize: '0.85rem' }}>{comment.profiles?.username || 'Gamer'}</strong>
                      </div>

                      {user?.id === comment.user_id && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>

                    {/* XSS-Safe Sanitized Comment Content */}
                    <div
                      style={{ fontSize: '0.9rem', color: 'var(--gv-text)', lineHeight: '1.4' }}
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(comment.content || ''),
                      }}
                    />
                  </motion.div>
                ))
              )}
            </div>

            <form onSubmit={handleAddComment} style={{ padding: '1rem', borderTop: '1px solid var(--gv-border)', display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Write a reply..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={submitting}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: '1px solid var(--gv-border)',
                  backgroundColor: 'var(--gv-bg, #0f172a)',
                  color: 'var(--gv-text)',
                }}
              />
              <motion.button
                whileTap={{ scale: 0.94 }}
                type="submit"
                disabled={submitting || !newComment.trim()}
                style={{
                  padding: '0.75rem 1.25rem',
                  backgroundColor: 'var(--gv-primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <FaPaperPlane />
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommentsModal;