import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { FaChartLine, FaHeart, FaComment, FaEye, FaEgg, FaNewspaper } from 'react-icons/fa6';

const Dashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    totalPosts: 0,
    totalEggs: 0,
    totalLikes: 0,
    totalComments: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    if (!user) return;
    try {
      setLoading(true);

      // 1. Fetch User Posts & Likes/Comments associated with them
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('id, title, created_at')
        .eq('user_id', user.id);

      if (postsError) throw postsError;

      const postIds = (posts || []).map((p) => p.id);

      // 2. Fetch User Easter Eggs
      const { data: eggs, error: eggsError } = await supabase
        .from('easter_eggs')
        .select('id, title, created_at')
        .eq('submitted_by', user.id);

      if (eggsError) throw eggsError;

      const eggIds = (eggs || []).map((e) => e.id);

      // 3. Count total likes for user's posts & eggs
      let likesCount = 0;
      if (postIds.length > 0 || eggIds.length > 0) {
        const { count } = await supabase
          .from('post_likes')
          .select('*', { count: 'exact', head: true })
          .or(`post_id.in.(${postIds.join(',')}),easter_egg_id.in.(${eggIds.join(',')})`);
        likesCount = count || 0;
      }

      // 4. Count total comments for user's posts & eggs
      let commentsCount = 0;
      if (postIds.length > 0 || eggIds.length > 0) {
        const { count } = await supabase
          .from('post_comments')
          .select('*', { count: 'exact', head: true })
          .or(`post_id.in.(${postIds.join(',')}),easter_egg_id.in.(${eggIds.join(',')})`);
        commentsCount = count || 0;
      }

      setMetrics({
        totalPosts: posts?.length || 0,
        totalEggs: eggs?.length || 0,
        totalLikes: likesCount,
        totalComments: commentsCount,
      });

      // Combine for activity timeline
      const combinedActivity = [
        ...(posts || []).map((p) => ({ ...p, type: 'Post' })),
        ...(eggs || []).map((e) => ({ ...e, type: 'Easter Egg' })),
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setRecentActivity(combinedActivity);
    } catch (err) {
      console.error('Analytics Error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [user]);

  if (loading) return <div className="gv-page"><p>Calculating analytics...</p></div>;

  return (
    <div className="gv-page" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <FaChartLine style={{ color: 'var(--gv-primary)' }} /> Creator Analytics Dashboard
        </h2>
        <p style={{ color: 'var(--gv-muted)', margin: '0.25rem 0 0 0' }}>Track performance across your posts, secrets, and audience engagement</p>
      </div>

      {/* Analytics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: 'var(--gv-card)', border: '1px solid var(--gv-border)', borderRadius: '10px', padding: '1.25rem' }}>
          <span style={{ color: 'var(--gv-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FaNewspaper style={{ color: 'var(--gv-primary)' }} /> Standard Posts
          </span>
          <h2 style={{ margin: '0.5rem 0 0 0', fontSize: '1.8rem' }}>{metrics.totalPosts}</h2>
        </div>

        <div style={{ backgroundColor: 'var(--gv-card)', border: '1px solid var(--gv-border)', borderRadius: '10px', padding: '1.25rem' }}>
          <span style={{ color: 'var(--gv-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FaEgg style={{ color: '#eab308' }} /> Vault Secrets
          </span>
          <h2 style={{ margin: '0.5rem 0 0 0', fontSize: '1.8rem' }}>{metrics.totalEggs}</h2>
        </div>

        <div style={{ backgroundColor: 'var(--gv-card)', border: '1px solid var(--gv-border)', borderRadius: '10px', padding: '1.25rem' }}>
          <span style={{ color: 'var(--gv-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FaHeart style={{ color: '#ef4444' }} /> Total Likes
          </span>
          <h2 style={{ margin: '0.5rem 0 0 0', fontSize: '1.8rem' }}>{metrics.totalLikes}</h2>
        </div>

        <div style={{ backgroundColor: 'var(--gv-card)', border: '1px solid var(--gv-border)', borderRadius: '10px', padding: '1.25rem' }}>
          <span style={{ color: 'var(--gv-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FaComment style={{ color: '#a855f7' }} /> Replies Received
          </span>
          <h2 style={{ margin: '0.5rem 0 0 0', fontSize: '1.8rem' }}>{metrics.totalComments}</h2>
        </div>
      </div>

      {/* Activity Timeline */}
      <h3 style={{ marginBottom: '1rem' }}>Published Content Log</h3>
      {recentActivity.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'var(--gv-card)', borderRadius: '8px' }}>
          <p style={{ color: 'var(--gv-muted)', margin: 0 }}>No content created yet. Start posting to view analytics!</p>
        </div>
      ) : (
        <div style={{ backgroundColor: 'var(--gv-card)', border: '1px solid var(--gv-border)', borderRadius: '10px', overflow: 'hidden' }}>
          {recentActivity.map((item, index) => (
            <div
              key={`${item.type}-${item.id}`}
              style={{
                padding: '1rem 1.25rem',
                borderBottom: index !== recentActivity.length - 1 ? '1px solid var(--gv-border)' : 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    color: item.type === 'Easter Egg' ? '#eab308' : 'var(--gv-primary)',
                    backgroundColor: item.type === 'Easter Egg' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '10px',
                    marginRight: '0.5rem',
                  }}
                >
                  {item.type}
                </span>
                <strong style={{ fontSize: '0.95rem' }}>{item.title}</strong>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--gv-muted)' }}>
                {new Date(item.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;