import { motion } from 'framer-motion';

export const PostSkeleton = () => (
  <div
    style={{
      backgroundColor: 'var(--gv-card)',
      border: '1px solid var(--gv-border)',
      borderRadius: '8px',
      padding: '1.25rem',
      marginBottom: '1rem',
    }}
  >
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem' }}>
      <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--gv-border)' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div style={{ width: '120px', height: '12px', borderRadius: '4px', backgroundColor: 'var(--gv-border)' }} />
        <div style={{ width: '80px', height: '10px', borderRadius: '4px', backgroundColor: 'var(--gv-border)' }} />
      </div>
    </div>
    <div style={{ width: '60%', height: '16px', borderRadius: '4px', backgroundColor: 'var(--gv-border)', marginBottom: '0.75rem' }} />
    <div style={{ width: '100%', height: '12px', borderRadius: '4px', backgroundColor: 'var(--gv-border)', marginBottom: '0.5rem' }} />
    <div style={{ width: '85%', height: '12px', borderRadius: '4px', backgroundColor: 'var(--gv-border)' }} />
  </div>
);

export const CommunityCardSkeleton = () => (
  <div
    style={{
      backgroundColor: 'var(--gv-card)',
      border: '1px solid var(--gv-border)',
      borderRadius: '8px',
      overflow: 'hidden',
      height: '220px',
    }}
  >
    <div style={{ width: '100%', height: '100px', backgroundColor: 'var(--gv-border)' }} />
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      <div style={{ width: '50%', height: '14px', borderRadius: '4px', backgroundColor: 'var(--gv-border)' }} />
      <div style={{ width: '90%', height: '10px', borderRadius: '4px', backgroundColor: 'var(--gv-border)' }} />
    </div>
  </div>
);