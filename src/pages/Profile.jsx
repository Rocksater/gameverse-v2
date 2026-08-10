import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import { FaShieldHalved, FaPenToSquare, FaStar, FaNewspaper, FaEgg } from 'react-icons/fa6';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [stats, setStats] = useState({ postsCount: 0, eggsCount: 0, likesReceived: 0 });
  const [loading, setLoading] = useState(true);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchProfileData = async () => {
    if (!user) return;
    try {
      setLoading(true);

      // 1. Fetch Profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') throw profileError;

      if (profileData) {
        setProfile(profileData);
        setUsername(profileData.username || '');
        setBio(profileData.bio || 'Passionate gamer & community member.');
        setAvatarUrl(profileData.avatar_url || '');
      }

      // 2. Fetch User Posts
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('*, profiles:user_id(username, avatar_url)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;
      setUserPosts(posts || []);

      // 3. Fetch User Easter Eggs Count
      const { count: eggsCount } = await supabase
        .from('easter_eggs')
        .select('*', { count: 'exact', head: true })
        .eq('submitted_by', user.id);

      setStats({
        postsCount: posts?.length || 0,
        eggsCount: eggsCount || 0,
        likesReceived: (posts?.length || 0) * 5 + (eggsCount || 0) * 10, // Reputation score algorithm
      });
    } catch (err) {
      console.error('Error fetching profile:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updates = {
        id: user.id,
        username,
        bio,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;

      setProfile((prev) => ({ ...prev, ...updates }));
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Error updating profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const getReputationRank = (score) => {
    if (score >= 50) return { title: 'Gaming Legend', color: '#eab308' };
    if (score >= 20) return { title: 'Pro Tactician', color: '#a855f7' };
    return { title: 'Rookie Gamer', color: '#3b82f6' };
  };

  if (loading) return <div className="gv-page"><p>Loading profile...</p></div>;

  const rank = getReputationRank(stats.likesReceived);

  return (
    <div className="gv-page" style={{ maxWidth: '850px', margin: '0 auto' }}>
      {/* Header Profile Banner Card */}
      <div
        style={{
          backgroundColor: 'var(--gv-card)',
          border: '1px solid var(--gv-border)',
          borderRadius: '12px',
          padding: '2rem',
          marginBottom: '2rem',
          position: 'relative',
        }}
      >
        <button
          onClick={() => setIsEditing(!isEditing)}
          style={{
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 1rem',
            backgroundColor: 'var(--gv-bg, #0f172a)',
            border: '1px solid var(--gv-border)',
            borderRadius: '6px',
            color: 'var(--gv-text)',
            cursor: 'pointer',
            fontSize: '0.85rem',
          }}
        >
          <FaPenToSquare /> {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>

        {isEditing ? (
          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <h3>Edit Profile</h3>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--gv-border)', backgroundColor: 'var(--gv-bg)', color: 'var(--gv-text)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows="3"
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--gv-border)', backgroundColor: 'var(--gv-bg)', color: 'var(--gv-text)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Avatar Image URL</label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--gv-border)', backgroundColor: 'var(--gv-bg)', color: 'var(--gv-text)' }}
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              style={{ padding: '0.6rem', backgroundColor: 'var(--gv-primary)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        ) : (
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <img
              src={profile?.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + user?.id}
              alt="Avatar"
              style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--gv-primary)' }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                <h2 style={{ margin: 0 }}>{profile?.username || 'Anonymous Gamer'}</h2>
                <span
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    color: rank.color,
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <FaShieldHalved /> {rank.title}
                </span>
              </div>
              <p style={{ color: 'var(--gv-muted)', margin: '0 0 1rem 0', fontSize: '0.9rem' }}>{bio}</p>

              {/* Stats Bar */}
              <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--gv-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FaNewspaper style={{ color: 'var(--gv-primary)' }} /> <strong>{stats.postsCount}</strong> Posts
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FaEgg style={{ color: '#eab308' }} /> <strong>{stats.eggsCount}</strong> Secrets
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FaStar style={{ color: '#a855f7' }} /> <strong>{stats.likesReceived}</strong> Rep Points
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Posts Section */}
      <h3 style={{ marginBottom: '1rem' }}>My Activity & Strategy Posts</h3>
      {userPosts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'var(--gv-card)', borderRadius: '8px' }}>
          <p style={{ color: 'var(--gv-muted)', margin: 0 }}>You haven't authored any posts yet.</p>
        </div>
      ) : (
        userPosts.map((post) => (
          <PostCard key={post.id} post={post} onDelete={(id) => setUserPosts(prev => prev.filter(p => p.id !== id))} />
        ))
      )}
    </div>
  );
};

export default Profile;