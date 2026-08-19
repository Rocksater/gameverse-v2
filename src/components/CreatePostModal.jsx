import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { IoClose } from 'react-icons/io5';

const CreatePostModal = ({ isOpen, onClose, onPostCreated }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      return setError('Title and content are required.');
    }

    try {
      setLoading(true);
      setError('');

      const { data, error: insertError } = await supabase
        .from('posts')
        .insert([
          {
            user_id: user.id,
            title: title.trim(),
            content: content.trim(),
            category,
          },
        ])
        .select('*, profiles:user_id(username, avatar_url)')
        .single();

      if (insertError) throw insertError;

      setTitle('');
      setContent('');
      setCategory('General');
      onPostCreated(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
              padding: '1.5rem',
              position: 'relative',
            }}
          >
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                color: 'var(--gv-muted)',
                fontSize: '1.5rem',
                cursor: 'pointer',
              }}
            >
              <IoClose />
            </button>

            <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Create Gaming Post</h3>

            {error && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem' }}>Title</label>
                <input
                  type="text"
                  placeholder="e.g., Best Elden Ring DLC Build"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: '1px solid var(--gv-border)',
                    backgroundColor: 'var(--gv-bg, #0f172a)',
                    color: 'var(--gv-text)',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem' }}>Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: '1px solid var(--gv-border)',
                    backgroundColor: 'var(--gv-bg, #0f172a)',
                    color: 'var(--gv-text)',
                  }}
                >
                  <option value="General">General</option>
                  <option value="Strategies">Strategies & Guides</option>
                  <option value="Easter Eggs">Easter Eggs</option>
                  <option value="Clips">Clips & Highlights</option>
                  <option value="Reviews">Reviews</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem' }}>Content</label>
                <textarea
                  placeholder="Share your strategy, thoughts, or gaming secrets..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows="5"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: '1px solid var(--gv-border)',
                    backgroundColor: 'var(--gv-bg, #0f172a)',
                    color: 'var(--gv-text)',
                  }}
                />
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={loading}
                style={{
                  padding: '0.75rem',
                  borderRadius: '6px',
                  backgroundColor: 'var(--gv-primary)',
                  color: 'white',
                  border: 'none',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  marginTop: '0.5rem',
                }}
              >
                {loading ? 'Publishing...' : 'Publish Post'}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreatePostModal;