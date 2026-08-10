import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../context/AuthContext';
import CommentsModal from './CommentsModal';
import { FaHeart, FaRegHeart, FaComment, FaTrash } from 'react-icons/fa6';

const PostCard = ({ post, onDelete }) => {
  const { user } = useAuth();
  const isOwner = user?.id === post.user_id;

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
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

        setLikesCount(count || 0);

        if (user) {
          const { data } = await supabase
            .from('post_likes')
            .select('id')
            .eq(idColumn, post.id)
            .eq('user_id', user.id)
            .single();

          setLiked(!!data);
        }
      } catch (err) {
        // Ignored if user hasn't liked
      }
    };

    fetchLikesState();
  }, [post.id, user, idColumn]);

  const toggleLike = async () => {
    if (!user) return alert('Please sign in to like posts.');

    try {
      if (liked) {
        setLiked(false);
        setLikesCount((prev) => Math.max(0, prev - 1));
        await supabase
          .from('post_likes')
          .delete()
          .eq(idColumn, post.id)
          .eq('user_id', user.id);
      } else {
        setLiked(true);
        setLikesCount((prev) => prev + 1);
        await supabase
          .from('post_likes')
          .insert([{ [idColumn]: post.id, user_id: user.id }]);
      }
    } catch (err) {
      console.error('Like toggle failed:', err.message);
    }
  };

  return (
    <div
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
      </div>

      <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.15rem' }}>{post.title}</h3>
      <p style={{ color: 'var(--gv-text)', lineHeight: '1.5', whiteSpace: 'pre-wrap', margin: '0 0 1rem 0' }}>
        {post.content}
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--gv-border)' }}>
        <div style={{ display: 'flex', gap: '1.25rem', color: 'var(--gv-muted)', fontSize: '0.9rem' }}>
          <button
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
            {liked ? <FaHeart /> : <FaRegHeart />} {likesCount}
          </button>
          <button
            onClick={() => setIsCommentsOpen(true)}
            style={{ background: 'none', border: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}
          >
            <FaComment /> Reply
          </button>
        </div>

        {isOwner && (
          <button
            onClick={() => onDelete(post.id)}
            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
            title="Delete Post"
          >
            <FaTrash />
          </button>
        )}
      </div>

      <CommentsModal
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        post={post}
      />
    </div>
  );
};

export default PostCard;