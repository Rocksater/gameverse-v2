import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';
import { FaPlus } from 'react-icons/fa6';

const Home = () => {
  const [feedItems, setFeedItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'General', 'Strategies', 'Easter Eggs', 'Clips', 'Reviews'];

  const fetchFeed = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch standard posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*, profiles:user_id(username, avatar_url)')
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      // Normalize standard posts so they share a common structure
      const normalizedPosts = (postsData || []).map(post => ({
        ...post,
        type: 'post', 
        displayTitle: post.title,
        displayCategory: post.category
      }));

      // 2. Fetch Easter Eggs
      const { data: eggsData, error: eggsError } = await supabase
        .from('easter_eggs')
        .select('*, profiles:submitted_by(username, avatar_url)')
        .order('created_at', { ascending: false });

      if (eggsError) throw eggsError;

      // Normalize Easter Eggs to look like standard posts for the feed
      const normalizedEggs = (eggsData || []).map(egg => ({
        id: egg.id,
        user_id: egg.submitted_by,
        title: egg.title,
        content: `Game: ${egg.game}\nLocation: ${egg.location_hint}\nRarity: ${egg.rarity}\n\n${egg.description}`,
        category: 'Easter Eggs', // Force category to match the filter pill
        created_at: egg.created_at,
        profiles: egg.profiles,
        type: 'easter_egg',
        originalEggData: egg // Keep original data just in case
      }));

      // 3. Merge and Sort by Date
      const combinedFeed = [...normalizedPosts, ...normalizedEggs].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );

      setFeedItems(combinedFeed);
    } catch (err) {
      console.error('Error fetching feed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const handlePostCreated = (newPost) => {
    // Normalize new post before adding to state
    const normalizedNewPost = {
       ...newPost,
       type: 'post',
       displayTitle: newPost.title,
       displayCategory: newPost.category
    };
    setFeedItems((prev) => [normalizedNewPost, ...prev]);
  };

  const handleDeletePost = async (id, type) => {
    try {
      const table = type === 'easter_egg' ? 'easter_eggs' : 'posts';
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      setFeedItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert('Failed to delete item: ' + err.message);
    }
  };

  const filteredFeed = selectedCategory === 'All'
    ? feedItems
    : feedItems.filter((item) => item.category === selectedCategory);

  return (
    <div className="gv-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0 }}>Gaming Feed</h2>
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

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              border: '1px solid var(--gv-border)',
              backgroundColor: selectedCategory === cat ? 'var(--gv-primary)' : 'var(--gv-card)',
              color: selectedCategory === cat ? 'white' : 'var(--gv-text)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading feed...</p>
      ) : filteredFeed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'var(--gv-card)', borderRadius: '8px' }}>
          <p style={{ color: 'var(--gv-muted)', margin: 0 }}>No posts found in this category yet. Be the first to share one!</p>
        </div>
      ) : (
        <div>
          {filteredFeed.map((item) => (
            <PostCard 
              key={`${item.type}-${item.id}`} 
              post={item} 
              onDelete={() => handleDeletePost(item.id, item.type)} 
            />
          ))}
        </div>
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