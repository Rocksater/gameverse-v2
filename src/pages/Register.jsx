import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError("Passwords don't match");
    }

    try {
      setError('');
      setLoading(true);
      const { error } = await signUp(email, password);
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
      <h2>Join GameVerse</h2>
      {error && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--gv-border)', backgroundColor: 'var(--gv-card)', color: 'var(--gv-text)' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--gv-border)', backgroundColor: 'var(--gv-card)', color: 'var(--gv-text)' }}
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--gv-border)', backgroundColor: 'var(--gv-card)', color: 'var(--gv-text)' }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ padding: '0.75rem', borderRadius: '6px', backgroundColor: 'var(--gv-primary)', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <p style={{ marginTop: '1rem' }}>
        Already have an account? <Link to="/login" style={{ color: 'var(--gv-secondary)' }}>Sign In</Link>
      </p>
    </div>
  );
};

export default Register;