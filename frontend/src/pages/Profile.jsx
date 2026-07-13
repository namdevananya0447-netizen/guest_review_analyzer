import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { token, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to load profile');
        }

        const data = await response.json();
        setUser(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-eco-bg">
      <div className="bg-white p-8 rounded-2xl shadow-xs border border-eco-border w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-display font-bold text-eco-dark">Staff Profile</h1>

        {loading && <p className="text-sm text-eco-muted">Loading...</p>}

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-2">
            {error}
          </div>
        )}

        {user && (
          <div className="space-y-2">
            <div>
              <span className="text-xs font-semibold text-eco-muted uppercase">Email</span>
              <p className="text-eco-dark font-medium">{user.email}</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-eco-muted uppercase">User ID</span>
              <p className="text-eco-dark font-medium text-xs break-all">{user.id}</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-eco-muted uppercase">Joined</span>
              <p className="text-eco-dark font-medium">{new Date(user.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <Link to="/" className="text-sm text-eco-primary font-semibold">← Back to Dashboard</Link>
          <button onClick={logout} className="text-sm text-eco-muted hover:text-red-600">Log Out</button>
        </div>
      </div>
    </div>
  );
}