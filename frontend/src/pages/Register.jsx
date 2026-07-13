import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Registration failed');
      }

      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-eco-bg">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xs border border-eco-border w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-display font-bold text-eco-dark">Staff Registration</h1>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-2">
            {error}
          </div>
        )}
        {success && (
          <div className="text-sm text-eco-primary bg-eco-primary/10 border border-eco-primary/20 rounded-lg p-2">
            Registered successfully! Redirecting to login...
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-eco-muted uppercase">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full mt-1 p-2.5 border border-eco-border rounded-lg focus:outline-none focus:ring-2 focus:ring-eco-primary/20"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-eco-muted uppercase">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full mt-1 p-2.5 border border-eco-border rounded-lg focus:outline-none focus:ring-2 focus:ring-eco-primary/20"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-eco-primary text-white font-semibold rounded-lg hover:bg-eco-primary-hover disabled:opacity-50"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>

        <p className="text-sm text-center text-eco-muted">
          Already have an account? <Link to="/login" className="text-eco-primary font-semibold">Log In</Link>
        </p>
      </form>
    </div>
  );
}