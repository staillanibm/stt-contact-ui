import { useAuth } from '../auth/AuthContext';

export const LoginScreen = () => {
  const { login, isLoading } = useAuth();

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Login failed:', error);
      // Could add error toast/notification here
    }
  };

  if (isLoading) {
    return (
      <div className="login-screen">
        <div className="login-container">
          <div className="loading">
            <h2>Contact Management System</h2>
            <p>Loading authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-screen">
      <div className="login-container">
        <div className="login-content">
          <h1>Contact Management System</h1>
          <p>Please sign in to access the contact management interface.</p>
          
          <div className="login-info">
            <h3>🔐 Secure Authentication</h3>
            <ul>
              <li>✅ Single Sign-On (SSO) via Keycloak</li>
              <li>✅ OAuth2 + PKCE Security</li>
              <li>✅ JWT Token Authentication</li>
            </ul>
          </div>

          <button 
            onClick={handleLogin}
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In with Keycloak'}
          </button>

          <div className="login-footer">
            <small>
              Powered by Keycloak Identity Provider & webMethods API Gateway
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};