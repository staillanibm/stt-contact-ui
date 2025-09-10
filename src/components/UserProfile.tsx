import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

export const UserProfile = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const userName = user.profile?.name || user.profile?.preferred_username || 'User';
  const userEmail = user.profile?.email;

  return (
    <div className="user-profile">
      <div className="user-info">
        <span className="user-name">👤 {userName}</span>
        {userEmail && (
          <span className="user-email">{userEmail}</span>
        )}
      </div>
      <div className="user-actions">
        <button 
          onClick={() => navigate('/tokens')}
          className="tokens-button"
        >
          🔑 Tokens
        </button>
        <button 
          onClick={handleLogout}
          className="logout-button"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};