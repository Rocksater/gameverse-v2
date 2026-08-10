import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      const { error } = await signIn(email, password);
      if (error) throw error;
      navigate('/home');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gv-page">
      <h2>Sign In</h2>
      {error && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>}
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
          placeholder="Email"
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
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
      <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <p><Link to="/forgot-password" style={{ color: 'var(--gv-muted)', fontSize: '0.9rem' }}>Forgot Password?</Link></p>
        <p><Link to="/register" style={{ color: 'var(--gv-secondary)', fontSize: '0.9rem' }}>Need an account? Register</Link></p>
      </div>
    </div>
  );
};

export default Login;