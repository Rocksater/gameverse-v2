import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import CreateCommunityModal from '../components/CreateCommunityModal';
import { FaPlus, FaUsers, FaMagnifyingGlass } from 'react-icons/fa6';

const Communities = () => {
  const [communities, setCommunities] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('communities')
        .select('*, profiles:created_by(username)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCommunities(data || []);
    } catch (err) {
      console.error('Error fetching communities:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  const handleCommunityCreated = (newCommunity) => {
    setCommunities((prev) => [newCommunity, ...prev]);
  };

  const filteredCommunities = communities.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="gv-page" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>Gaming Communities</h2>
          <p style={{ color: 'var(--gv-muted)', margin: '0.25rem 0 0 0' }}>Discover hubs built by fellow gamers</p>
        </div>

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
          <FaPlus /> Create Community
        </button>
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <FaMagnifyingGlass style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gv-muted)' }} />
        <input
          type="text"
          placeholder="Search gaming hubs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem 0.75rem 0.75rem 2.5rem',
            borderRadius: '8px',
            border: '1px solid var(--gv-border)',
            backgroundColor: 'var(--gv-card)',
            color: 'var(--gv-text)',
          }}
        />
      </div>

      {/* Community Grid */}
      {loading ? (
        <p>Loading communities...</p>
      ) : filteredCommunities.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'var(--gv-card)', borderRadius: '8px' }}>
          <p style={{ color: 'var(--gv-muted)', margin: 0 }}>No communities found. Be the first to launch one!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {filteredCommunities.map((c) => (
            <div
              key={c.id}
              style={{
                backgroundColor: 'var(--gv-card)',
                border: '1px solid var(--gv-border)',
                borderRadius: '8px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <img
                src={c.banner_url || 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1200&q=80'}
                alt={c.name}
                style={{ width: '100%', height: '100px', objectFit: 'cover' }}
              />
              <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1.1rem' }}>{c.name}</h3>
                  <p style={{ color: 'var(--gv-muted)', fontSize: '0.85rem', margin: '0 0 1rem 0', lineHeight: '1.4' }}>
                    {c.description || 'No description provided.'}
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--gv-border)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--gv-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <FaUsers /> Community
                  </span>
                  <button
                    style={{
                      padding: '0.4rem 0.8rem',
                      borderRadius: '4px',
                      backgroundColor: 'var(--gv-primary)',
                      color: 'white',
                      border: 'none',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                    }}
                  >
                    Explore
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateCommunityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCommunityCreated={handleCommunityCreated}
      />
    </div>
  );
};

export default Communities;