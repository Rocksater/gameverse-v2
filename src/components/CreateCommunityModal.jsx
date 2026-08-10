import { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { IoClose } from 'react-icons/io5';

const CreateCommunityModal = ({ isOpen, onClose, onCommunityCreated }) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setError('Community name is required.');

    try {
      setLoading(true);
      setError('');

      const { data, error: insertError } = await supabase
        .from('communities')
        .insert([
          {
            name: name.trim(),
            description: description.trim(),
            banner_url: bannerUrl.trim() || 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1200&q=80',
            created_by: user.id,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      setName('');
      setDescription('');
      setBannerUrl('');
      onCommunityCreated(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
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
      <div
        style={{
          backgroundColor: 'var(--gv-card)',
          border: '1px solid var(--gv-border)',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '500px',
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

        <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Create Gaming Community</h3>

        {error && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem' }}>Community Name</label>
            <input
              type="text"
              placeholder="e.g., Elden Ring Strategy Hub"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem' }}>Description</label>
            <textarea
              placeholder="What is this community about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
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
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem' }}>Banner Image URL (Optional)</label>
            <input
              type="url"
              placeholder="https://..."
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
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

          <button
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
            {loading ? 'Creating...' : 'Create Hub'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCommunityModal;