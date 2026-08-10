import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';
import { FaPlus } from 'react-icons/fa6';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('posts')
        .select('*, profiles:user_id(username, avatar_url)')
        .order('created_at', { ascending: false });

      if (filterCategory !== 'All') {
        query = query.eq('category', filterCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error('Error fetching posts:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [filterCategory]);

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleDeletePost = async (postId) => {
    try {
      const { error } = await supabase.from('posts').delete().eq('id', postId);
      if (error) throw error;
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      alert('Failed to delete post: ' + err.message);
    }
  };

  return (
    <div className="gv-page" style={{ maxWidth: '700px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Gaming Feed</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.2rem',
            backgroundColor: 'var(--gv-primary)',
            color: 'white',
            borderRadius: '6px',
            border: 'none',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          <FaPlus /> Create Post
        </button>
      </div>

      {/* Category Filter Pills */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {['All', 'General', 'Strategies', 'Easter Eggs', 'Clips', 'Reviews'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            style={{
              padding: '0.4rem 0.9rem',
              borderRadius: '20px',
              border: '1px solid var(--gv-border)',
              backgroundColor: filterCategory === cat ? 'var(--gv-primary)' : 'var(--gv-card)',
              color: filterCategory === cat ? 'white' : 'var(--gv-text)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Feed List */}
      {loading ? (
        <p>Loading gaming feed...</p>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'var(--gv-card)', borderRadius: '8px' }}>
          <p style={{ color: 'var(--gv-muted)', margin: 0 }}>No posts found in this category yet. Be the first to share one!</p>
        </div>
      ) : (
        posts.map((post) => (
          <PostCard key={post.id} post={post} onDelete={handleDeletePost} />
        ))
      )}

      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
};

export default Home;