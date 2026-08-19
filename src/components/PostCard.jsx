import { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import { motion } from 'framer-motion';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../context/AuthContext';
import CommentsModal from './CommentsModal';
import { FaHeart, FaRegHeart, FaComment, FaTrash } from 'react-icons/fa6';

const PostCard = ({ post, onDelete, onLikeUpdate }) => {
  const { user } = useAuth();
  const isOwner = user?.id === post.user_id;

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  const isEgg = post?.type === 'easter_egg';
  const idColumn = isEgg ? 'easter_egg_id' : 'post_id';

  useEffect(() => {
    const fetchLikesState = async () => {
      try {
        const { count } = await supabase
          .from('post_likes')
          .select('*', { count: 'exact', head: true })
          .eq(idColumn, post.id);

        if (count !== null && count !== undefined) {
          setLikesCount(count);
        }

        if (user) {
          const { data } = await supabase
            .from('post_likes')
            .select('id')
            .eq(idColumn, post.id)
            .eq('user_id', user.id)
            .maybeSingle();

          setLiked(!!data);
        }
      } catch (err) {
        // Ignored if user context or query fails
      }
    };

    fetchLikesState();
  }, [post.id, user, idColumn]);

  const toggleLike = async () => {
    if (!user) return alert('Please sign in to like posts.');

    // Optimistic UI Update
    const prevLiked = liked;
    const prevCount = likesCount;
    const nextLiked = !prevLiked;
    const nextCount = nextLiked ? prevCount + 1 : Math.max(0, prevCount - 1);

    setLiked(nextLiked);
    setLikesCount(nextCount);

    try {
      if (!isEgg) {
        // Atomic stored procedure for standard posts
        const { data, error } = await supabase.rpc('toggle_post_like', {
          target_post_id: post.id,
          target_user_id: user.id,
        });

        if (error) throw error;

        if (data && data.length > 0) {
          const { liked: serverLiked, new_count: serverCount } = data[0];
          setLiked(serverLiked);
          setLikesCount(serverCount);
          if (onLikeUpdate) onLikeUpdate(post.id, serverCount, serverLiked);
        }
      } else {
        // Fallback for Easter Egg items
        if (prevLiked) {
          await supabase
            .from('post_likes')
            .delete()
            .eq(idColumn, post.id)
            .eq('user_id', user.id);
        } else {
          await supabase
            .from('post_likes')
            .insert([{ [idColumn]: post.id, user_id: user.id }]);
        }
      }
    } catch (err) {
      console.error('Like toggle failed:', err.message);
      // Revert optimistic state on error
      setLiked(prevLiked);
      setLikesCount(prevCount);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      style={{
        backgroundColor: 'var(--gv-card)',
        border: '1px solid var(--gv-border)',
        borderRadius: '8px',
        padding: '1.25rem',
        marginBottom: '1rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img
            src={post.profiles?.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=guest'}
            alt="Author Avatar"
            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div>
            <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{post.profiles?.username || 'Gamer'}</h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--gv-muted)' }}>
              {new Date(post.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {post.category && (
          <span
            style={{
              backgroundColor: 'rgba(139, 92, 246, 0.15)',
              color: 'var(--gv-primary)',
              padding: '0.2rem 0.6rem',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: 'bold',
            }}
          >
            {post.category}
          </span>
        )}
      </div>

      {post.title && <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.15rem' }}>{post.title}</h3>}

      {/* XSS-Safe Sanitized Body Content */}
      <div
        style={{ color: 'var(--gv-text)', lineHeight: '1.5', margin: '0 0 1rem 0' }}
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(post.content || ''),
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--gv-border)' }}>
        <div style={{ display: 'flex', gap: '1.25rem', color: 'var(--gv-muted)', fontSize: '0.9rem' }}>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={toggleLike}
            style={{
              background: 'none',
              border: 'none',
              color: liked ? '#ef4444' : 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              cursor: 'pointer',
              fontWeight: liked ? 'bold' : 'normal',
            }}
          >
            <motion.span
              key={liked ? 'liked' : 'unliked'}
              initial={{ scale: 0.6 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
              style={{ display: 'flex', alignItems: 'center' }}
            >
              {liked ? <FaHeart /> : <FaRegHeart />}
            </motion.span>
            {likesCount}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsCommentsOpen(true)}
            style={{ background: 'none', border: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}
          >
            <FaComment /> Reply
          </motion.button>
        </div>

        {isOwner && onDelete && (
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => onDelete(post.id)}
            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
            title="Delete Post"
          >
            <FaTrash />
          </motion.button>
        )}
      </div>

      <CommentsModal
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        post={post}
      />
    </motion.div>
  );
};

export default PostCard;