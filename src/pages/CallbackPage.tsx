import { useEffect, useState } from 'react';
import { UserManager } from 'oidc-client-ts';
import { oidcConfig } from '../config/oidc';

export const CallbackPage = () => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('🔄 Processing callback in CallbackPage...');
        
        // Create UserManager instance
        const userManager = new UserManager(oidcConfig);
        
        // Check for deduplication
        const callbackKey = `callback_processed_${window.location.search}`;
        if (sessionStorage.getItem(callbackKey)) {
          console.log('⚠️  Callback already processed, redirecting...');
          window.location.href = '/';
          return;
        }
        
        // Mark as processed
        sessionStorage.setItem(callbackKey, 'true');
        
        // Process the callback
        const user = await userManager.signinRedirectCallback();
        console.log('✅ Callback processed successfully, user:', user.profile?.preferred_username);
        
        // Clean URL and do a full reload to refresh the app state
        window.history.replaceState({}, document.title, '/');
        window.location.reload();
        
      } catch (err) {
        console.error('❌ Callback processing failed:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        // Redirect to home after error to allow retry
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      }
    };

    handleCallback();
  }, []);

  if (error) {
    return (
      <div className="callback-page">
        <div className="callback-container">
          <div className="loading">
            <h2>Authentication Error</h2>
            <p>{error}</p>
            <p>Redirecting to home page...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="callback-page">
      <div className="callback-container">
        <div className="loading">
          <h2>Completing Sign In...</h2>
          <p>Please wait while we process your authentication.</p>
          <div className="spinner">⟳</div>
        </div>
      </div>
    </div>
  );
};