import { FaHeart, FaComment, FaTrash } from 'react-icons/fa6';
import { useAuth } from '../context/AuthContext';

const PostCard = ({ post, onDelete }) => {
  const { user } = useAuth();
  const isOwner = user?.id === post.user_id;

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
          <button style={{ background: 'none', border: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
            <FaHeart /> {post.likes_count || 0}
          </button>
          <button style={{ background: 'none', border: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
            <FaComment /> Reply
          </button>
        </div>

        {isOwner && (
          <button
            onClick={() => onDelete(post.id)}
            style={{ background: 'none', border: 'none', color: 'var(--gv-danger, #ef4444)', cursor: 'pointer' }}
            title="Delete Post"
          >
            <FaTrash />
          </button>
        )}
      </div>
    </div>
  );
};

export default PostCard;