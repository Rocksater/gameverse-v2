import { useEffect, useState } from 'react';
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

  if (!isOpen || !post) return null;

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

      setComments((prev) => [...prev, data]);
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
    <div
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
      <div
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
              <div
                key={comment.id}
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
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--gv-text)', lineHeight: '1.4' }}>{comment.content}</p>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleAddComment} style={{ padding: '1rem', borderTop: '1px solid var(--gv-border)', display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="Write a reply..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            style={{
              flex: 1,
              padding: '0.75rem',
              borderRadius: '6px',
              border: '1px solid var(--gv-border)',
              backgroundColor: 'var(--gv-bg, #0f172a)',
              color: 'var(--gv-text)',
            }}
          />
          <button
            type="submit"
            disabled={submitting}
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
          </button>
        </form>
      </div>
    </div>
  );
};

export default CommentsModal;