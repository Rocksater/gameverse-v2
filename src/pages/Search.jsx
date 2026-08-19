import { useState } from 'react';
import { supabase } from '../services/supabaseClient';

export default function Search() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState({ communities: [], easterEggs: [] });
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      // Parallel trigram fuzzy search across communities and easter eggs
      const [communitiesRes, eggsRes] = await Promise.all([
        supabase
          .from('communities')
          .select('*')
          .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
          .limit(10),
        supabase
          .from('easter_eggs')
          .select('*')
          .or(`title.ilike.%${searchTerm}%,game.ilike.%${searchTerm}%`)
          .limit(10),
      ]);

      setResults({
        communities: communitiesRes.data || [],
        easterEggs: eggsRes.data || [],
      });
    } catch (err) {
      console.error('Search error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gv-page" style={{ maxWidth: '700px', margin: '0 auto' }}>
      <h2>Search GameVerse</h2>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Search communities or easter eggs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            padding: '0.75rem',
            borderRadius: '6px',
            border: '1px solid var(--gv-border)',
            backgroundColor: 'var(--gv-card)',
            color: 'var(--gv-text)',
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '6px',
            backgroundColor: 'var(--gv-primary)',
            color: 'white',
            border: 'none',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {/* Communities Results */}
      {results.communities.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h3>Communities</h3>
          {results.communities.map((c) => (
            <div key={c.id} style={{ padding: '0.75rem', border: '1px solid var(--gv-border)', borderRadius: '6px', marginBottom: '0.5rem' }}>
              <strong>{c.name}</strong>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--gv-muted)' }}>{c.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Easter Eggs Results */}
      {results.easterEggs.length > 0 && (
        <div>
          <h3>Easter Eggs</h3>
          {results.easterEggs.map((egg) => (
            <div key={egg.id} style={{ padding: '0.75rem', border: '1px solid var(--gv-border)', borderRadius: '6px', marginBottom: '0.5rem' }}>
              <strong>{egg.title}</strong> — <span style={{ color: 'var(--gv-primary)' }}>{egg.game}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}