import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';
import { compressToWebP } from '../utils/imageCompressor';

const AccountSettings = () => {
  const { user, signOut } = useAuth();
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) {
        setUsername(data.username || '');
        setBio(data.bio || '');
        setAvatarUrl(data.avatar_url || '');
      }
    };
    loadProfile();
  }, [user]);

  const handleAvatarUpload = async (e) => {
    try {
      setUploading(true);
      setError('');
      setMessage('');
      const file = e.target.files[0];
      if (!file) return;

      // Compress client image to WebP format before uploading to Storage
      const compressedWebPFile = await compressToWebP(file, 0.8);

      const filePath = `${user.id}/${Date.now()}.webp`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, compressedWebPFile, {
          contentType: 'image/webp',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setAvatarUrl(data.publicUrl);
      setMessage('Avatar uploaded and optimized successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setMessage('');

      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        username,
        bio,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gv-page" style={{ maxWidth: '500px', margin: '0 auto' }}>
      <h2>Account Settings</h2>
      {error && <p style={{ color: '#ef4444' }}>{error}</p>}
      {message && <p style={{ color: '#22c55e' }}>{message}</p>}

      <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Avatar</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            {avatarUrl && (
              <img
                src={avatarUrl}
                alt="Avatar Preview"
                style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }}
              />
            )}
            <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
          </div>
          {uploading && <span style={{ fontSize: '0.85rem', color: 'var(--gv-muted)' }}>Compressing & uploading...</span>}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--gv-border)', backgroundColor: 'var(--gv-card)', color: 'var(--gv-text)' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows="4"
            style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--gv-border)', backgroundColor: 'var(--gv-card)', color: 'var(--gv-text)' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading || uploading}
          style={{ padding: '0.75rem', borderRadius: '6px', backgroundColor: 'var(--gv-primary)', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
        >
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>

      <hr style={{ margin: '2rem 0', borderColor: 'var(--gv-border)' }} />

      <button
        onClick={signOut}
        style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', backgroundColor: '#ef4444', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
      >
        Sign Out
      </button>
    </div>
  );
};

export default AccountSettings;