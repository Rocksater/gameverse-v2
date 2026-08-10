import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (err) {
        console.error('Error fetching profile:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (loading) return <div className="gv-page"><p>Loading profile...</p></div>;

  return (
    <div className="gv-page" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
        <img
          src={profile?.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=guest'}
          alt="Avatar"
          style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--gv-primary)' }}
        />
        <div>
          <h2 style={{ margin: 0 }}>{profile?.username || 'Gamer'}</h2>
          <p style={{ color: 'var(--gv-muted)', margin: '0.25rem 0 0.5rem 0' }}>{user?.email}</p>
          <span style={{ backgroundColor: 'var(--gv-card)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem' }}>
            Reputation: <strong>{profile?.reputation || 0}</strong>
          </span>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--gv-card)', padding: '1.25rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
        <h3>Bio</h3>
        <p style={{ color: 'var(--gv-text)' }}>{profile?.bio || 'No bio written yet.'}</p>
      </div>

      <Link
        to="/settings"
        style={{
          display: 'inline-block',
          padding: '0.75rem 1.25rem',
          backgroundColor: 'var(--gv-primary)',
          color: 'white',
          borderRadius: '6px',
          textDecoration: 'none',
          fontWeight: 'bold'
        }}
      >
        Edit Profile & Settings
      </Link>
    </div>
  );
};

export default Profile;