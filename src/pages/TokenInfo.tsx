import React from 'react';
import { useAuth } from '../auth/AuthContext';

const TokenInfo: React.FC = () => {
  const { user } = useAuth();
  
  // Get tokens from user manager storage
  const getTokenDetails = () => {
    const config = (window as any).APP_CONFIG;
    const accessToken = sessionStorage.getItem(`oidc.user:${config?.KEYCLOAK_AUTHORITY || import.meta.env.VITE_KEYCLOAK_AUTHORITY}:${config?.KEYCLOAK_CLIENT_ID || import.meta.env.VITE_KEYCLOAK_CLIENT_ID}`);
    
    if (accessToken) {
      const userData = JSON.parse(accessToken);
      return userData;
    }
    return null;
  };

  const tokenData = getTokenDetails();
  
  const decodeJWTPayload = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => 
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      ).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const accessTokenPayload = tokenData?.access_token ? decodeJWTPayload(tokenData.access_token) : null;
  const idTokenPayload = tokenData?.id_token ? decodeJWTPayload(tokenData.id_token) : null;

  return (
    <div className="token-info">
      <h2>Token Information</h2>
      
      {!user && (
        <div className="warning">
          <p>Not authenticated. Please log in to view token information.</p>
        </div>
      )}

      {user && tokenData && (
        <div className="token-sections">
          
          {/* Access Token Section */}
          {tokenData.access_token && (
            <div className="token-section">
              <h3>Access Token</h3>
              <div className="token-info-grid">
                <div className="token-raw">
                  <h4>Raw Token</h4>
                  <div className="token-display">
                    <textarea 
                      readOnly 
                      value={tokenData.access_token}
                      rows={4}
                    />
                    <button onClick={() => copyToClipboard(tokenData.access_token)}>
                      Copy
                    </button>
                  </div>
                </div>
                
                {accessTokenPayload && (
                  <div className="token-payload">
                    <h4>Decoded Payload</h4>
                    <div className="token-details">
                      <p><strong>Issuer (iss):</strong> {accessTokenPayload.iss}</p>
                      <p><strong>Subject (sub):</strong> {accessTokenPayload.sub}</p>
                      <p><strong>Audience (aud):</strong> {Array.isArray(accessTokenPayload.aud) ? accessTokenPayload.aud.join(', ') : accessTokenPayload.aud}</p>
                      <p><strong>Expires (exp):</strong> {formatTimestamp(accessTokenPayload.exp)}</p>
                      <p><strong>Issued At (iat):</strong> {formatTimestamp(accessTokenPayload.iat)}</p>
                      <p><strong>Not Before (nbf):</strong> {accessTokenPayload.nbf ? formatTimestamp(accessTokenPayload.nbf) : 'N/A'}</p>
                      <p><strong>JWT ID (jti):</strong> {accessTokenPayload.jti || 'N/A'}</p>
                      {accessTokenPayload.scope && <p><strong>Scope:</strong> {accessTokenPayload.scope}</p>}
                      {accessTokenPayload.client_id && <p><strong>Client ID:</strong> {accessTokenPayload.client_id}</p>}
                    </div>
                    
                    <details>
                      <summary>Full Payload JSON</summary>
                      <pre>{JSON.stringify(accessTokenPayload, null, 2)}</pre>
                    </details>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ID Token Section */}
          {tokenData.id_token && (
            <div className="token-section">
              <h3>ID Token</h3>
              <div className="token-info-grid">
                <div className="token-raw">
                  <h4>Raw Token</h4>
                  <div className="token-display">
                    <textarea 
                      readOnly 
                      value={tokenData.id_token}
                      rows={4}
                    />
                    <button onClick={() => copyToClipboard(tokenData.id_token)}>
                      Copy
                    </button>
                  </div>
                </div>
                
                {idTokenPayload && (
                  <div className="token-payload">
                    <h4>Decoded Payload</h4>
                    <div className="token-details">
                      <p><strong>Issuer (iss):</strong> {idTokenPayload.iss}</p>
                      <p><strong>Subject (sub):</strong> {idTokenPayload.sub}</p>
                      <p><strong>Audience (aud):</strong> {idTokenPayload.aud}</p>
                      <p><strong>Expires (exp):</strong> {formatTimestamp(idTokenPayload.exp)}</p>
                      <p><strong>Issued At (iat):</strong> {formatTimestamp(idTokenPayload.iat)}</p>
                      <p><strong>Auth Time (auth_time):</strong> {idTokenPayload.auth_time ? formatTimestamp(idTokenPayload.auth_time) : 'N/A'}</p>
                      {idTokenPayload.name && <p><strong>Name:</strong> {idTokenPayload.name}</p>}
                      {idTokenPayload.preferred_username && <p><strong>Username:</strong> {idTokenPayload.preferred_username}</p>}
                      {idTokenPayload.email && <p><strong>Email:</strong> {idTokenPayload.email}</p>}
                      {idTokenPayload.given_name && <p><strong>Given Name:</strong> {idTokenPayload.given_name}</p>}
                      {idTokenPayload.family_name && <p><strong>Family Name:</strong> {idTokenPayload.family_name}</p>}
                    </div>
                    
                    <details>
                      <summary>Full Payload JSON</summary>
                      <pre>{JSON.stringify(idTokenPayload, null, 2)}</pre>
                    </details>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Refresh Token Section */}
          {tokenData.refresh_token && (
            <div className="token-section">
              <h3>Refresh Token</h3>
              <div className="token-raw">
                <h4>Raw Token</h4>
                <div className="token-display">
                  <textarea 
                    readOnly 
                    value={tokenData.refresh_token}
                    rows={2}
                  />
                  <button onClick={() => copyToClipboard(tokenData.refresh_token)}>
                    Copy
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Session Info */}
          <div className="token-section">
            <h3>Session Information</h3>
            <div className="token-details">
              <p><strong>Token Type:</strong> {tokenData.token_type || 'Bearer'}</p>
              <p><strong>Expires In:</strong> {tokenData.expires_in ? `${tokenData.expires_in} seconds` : 'N/A'}</p>
              <p><strong>Scope:</strong> {tokenData.scope || 'N/A'}</p>
              <p><strong>Session State:</strong> {tokenData.session_state || 'N/A'}</p>
            </div>
          </div>
        </div>
      )}

      {user && !tokenData && (
        <div className="warning">
          <p>Token data not found in storage.</p>
        </div>
      )}
    </div>
  );
};

export default TokenInfo;