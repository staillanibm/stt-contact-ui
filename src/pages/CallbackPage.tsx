import { useEffect } from 'react';

export const CallbackPage = () => {
  useEffect(() => {
    // The AuthContext will handle the callback processing
    // This component just shows a loading state during the process
  }, []);

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