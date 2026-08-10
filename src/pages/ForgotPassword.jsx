import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setMessage('');
      setError('');
      setLoading(true);
      const { error } = await resetPassword(email);
      if (error) throw error;
      setMessage('Check your inbox for password reset instructions.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gv-page">
      <h2>Reset Password</h2>
      {error && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>}
      {message && <p style={{ color: '#22c55e', marginBottom: '1rem' }}>{message}</p>}
      <form 
        onSubmit={handleSubmit}
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1rem', 
          maxWidth: '400px',
          marginTop: '1rem' 
        }}
      >
        <input
          type="email"
          placeholder="Enter your registered email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            padding: '0.75rem',
            borderRadius: '6px',
            border: '1px solid var(--gv-border)',
            backgroundColor: 'var(--gv-card)',
            color: 'var(--gv-text)',
            fontSize: '1rem'
          }}
        />
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
            fontSize: '1rem'
          }}
        >
          {loading ? 'Sending Email...' : 'Send Reset Email'}
        </button>
      </form>
      <p style={{ marginTop: '1.25rem' }}>
        <Link to="/login" style={{ color: 'var(--gv-secondary)', fontSize: '0.9rem' }}>
          Back to Sign In
        </Link>
      </p>
    </div>
  );
};

export default ForgotPassword;