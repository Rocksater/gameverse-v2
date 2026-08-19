import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../services/supabaseClient';
import SubmitEasterEggModal from '../components/SubmitEasterEggModal';
import { FaPlus, FaEgg, FaMagnifyingGlass, FaLocationDot } from 'react-icons/fa6';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

const Trending = () => {
  const [eggs, setEggs] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedRarity, setSelectedRarity] = useState('All');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchEasterEggs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('easter_eggs')
        .select('*, profiles:submitted_by(username)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEggs(data || []);
    } catch (err) {
      console.error('Error fetching Easter eggs:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEasterEggs();
  }, []);

  const handleEggSubmitted = (newEgg) => {
    setEggs((prev) => [newEgg, ...prev]);
  };

  const filteredEggs = eggs.filter((egg) => {
    const matchesSearch =
      egg.title.toLowerCase().includes(search.toLowerCase()) ||
      egg.game.toLowerCase().includes(search.toLowerCase()) ||
      egg.description.toLowerCase().includes(search.toLowerCase());

    const matchesRarity = selectedRarity === 'All' || egg.rarity === selectedRarity;

    return matchesSearch && matchesRarity;
  });

  const getRarityBadgeColor = (rarity) => {
    switch (rarity) {
      case 'Legendary':
        return { bg: 'rgba(234, 179, 8, 0.2)', text: '#eab308' };
      case 'Rare':
        return { bg: 'rgba(168, 85, 247, 0.2)', text: '#a855f7' };
      default:
        return { bg: 'rgba(59, 130, 246, 0.2)', text: '#3b82f6' };
    }
  };

  return (
    <div className="gv-page" style={{ maxWidth: '850px', margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}
      >
        <div>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaEgg style={{ color: '#eab308' }} /> Easter Egg Vault
          </h2>
          <p style={{ color: 'var(--gv-muted)', margin: '0.25rem 0 0 0' }}>Discover hidden secrets, glitches, and gaming lore</p>
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
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
          <FaPlus /> Submit Secret
        </motion.button>
      </motion.div>

      {/* Search & Rarity Controls */}
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <FaMagnifyingGlass style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gv-muted)' }} />
          <input
            type="text"
            placeholder="Search by game or secret..."
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

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['All', 'Common', 'Rare', 'Legendary'].map((r) => (
            <motion.button
              key={r}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedRarity(r)}
              style={{
                padding: '0.5rem 0.9rem',
                borderRadius: '20px',
                border: '1px solid var(--gv-border)',
                backgroundColor: selectedRarity === r ? 'var(--gv-primary)' : 'var(--gv-card)',
                color: selectedRarity === r ? 'white' : 'var(--gv-text)',
                cursor: 'pointer',
              }}
            >
              {r}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Easter Egg List */}
      {loading ? (
        <p>Unlocking secrets...</p>
      ) : filteredEggs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'var(--gv-card)', borderRadius: '8px' }}
        >
          <p style={{ color: 'var(--gv-muted)', margin: 0 }}>No Easter eggs found matching your filters.</p>
        </motion.div>
      ) : (
        <motion.div
          key={selectedRarity}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          {filteredEggs.map((egg) => {
            const badge = getRarityBadgeColor(egg.rarity);
            return (
              <motion.div
                key={egg.id}
                variants={itemVariants}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                style={{
                  backgroundColor: 'var(--gv-card)',
                  border: '1px solid var(--gv-border)',
                  borderRadius: '10px',
                  padding: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--gv-primary)', fontWeight: 'bold' }}>{egg.game}</span>
                    <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.2rem' }}>{egg.title}</h3>
                  </div>
                  <span
                    style={{
                      backgroundColor: badge.bg,
                      color: badge.text,
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                    }}
                  >
                    {egg.rarity}
                  </span>
                </div>

                {egg.location_hint && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--gv-muted)', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FaLocationDot style={{ color: '#ef4444' }} /> {egg.location_hint}
                  </p>
                )}

                <p style={{ color: 'var(--gv-text)', lineHeight: '1.5', margin: '0 0 0.75rem 0' }}>{egg.description}</p>

                <div style={{ fontSize: '0.75rem', color: 'var(--gv-muted)', borderTop: '1px solid var(--gv-border)', paddingTop: '0.5rem' }}>
                  Submitted by: <strong>{egg.profiles?.username || 'Anonymous Gamer'}</strong>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <SubmitEasterEggModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onEggSubmitted={handleEggSubmitted}
      />
    </div>
  );
};

export default Trending;