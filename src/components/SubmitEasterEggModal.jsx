import { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { IoClose } from 'react-icons/io5';

const SubmitEasterEggModal = ({ isOpen, onClose, onEggSubmitted }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [game, setGame] = useState('');
  const [locationHint, setLocationHint] = useState('');
  const [description, setDescription] = useState('');
  const [rarity, setRarity] = useState('Common');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !game.trim() || !description.trim()) {
      return setError('Title, game name, and description are required.');
    }

    try {
      setLoading(true);
      setError('');

      const { data, error: insertError } = await supabase
        .from('easter_eggs')
        .insert([
          {
            title: title.trim(),
            game: game.trim(),
            location_hint: locationHint.trim(),
            description: description.trim(),
            rarity,
            submitted_by: user.id,
          },
        ])
        .select('*, profiles:submitted_by(username)')
        .single();

      if (insertError) throw insertError;

      setTitle('');
      setGame('');
      setLocationHint('');
      setDescription('');
      setRarity('Common');
      onEggSubmitted(data);
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
          maxWidth: '550px',
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

        <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Submit Gaming Easter Egg</h3>

        {error && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem' }}>Secret Title</label>
            <input
              type="text"
              placeholder="e.g., Hidden Chris Redfield Statue"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem' }}>Game Title</label>
              <input
                type="text"
                placeholder="e.g., Resident Evil Village"
                value={game}
                onChange={(e) => setGame(e.target.value)}
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
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem' }}>Rarity</label>
              <select
                value={rarity}
                onChange={(e) => setRarity(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: '1px solid var(--gv-border)',
                  backgroundColor: 'var(--gv-bg, #0f172a)',
                  color: 'var(--gv-text)',
                }}
              >
                <option value="Common">Common</option>
                <option value="Rare">Rare</option>
                <option value="Legendary">Legendary</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem' }}>Location / How to Trigger</label>
            <input
              type="text"
              placeholder="e.g., Shoot 5 blue medallions behind Castle Dimitrescu"
              value={locationHint}
              onChange={(e) => setLocationHint(e.target.value)}
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
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem' }}>Description & Context</label>
            <textarea
              placeholder="Describe what happens and why it's cool..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
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
            {loading ? 'Submitting...' : 'Submit Secret'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubmitEasterEggModal;