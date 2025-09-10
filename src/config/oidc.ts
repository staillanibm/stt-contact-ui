import { UserManagerSettings } from 'oidc-client-ts';

// Runtime configuration from window object or fallback to build-time env
const getRuntimeConfig = () => {
  // Check if runtime config is available
  if (typeof window !== 'undefined' && (window as any).APP_CONFIG) {
    return (window as any).APP_CONFIG;
  }
  
  // Fallback to build-time environment variables for local development
  return {
    APP_URL: import.meta.env.VITE_APP_URL || 'https://contact.local:5173',
    KEYCLOAK_AUTHORITY: import.meta.env.VITE_KEYCLOAK_AUTHORITY || 'https://keycloak.staging.e-auth.cloud/realms/sttlab',
    KEYCLOAK_CLIENT_ID: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || '47283985-2eed-4484-bc28-dc03f0e446fe'
  };
};

const config = getRuntimeConfig();

// OIDC Configuration for Keycloak
export const oidcConfig: UserManagerSettings = {
  // Keycloak Configuration
  authority: config.KEYCLOAK_AUTHORITY,
  client_id: config.KEYCLOAK_CLIENT_ID,
  redirect_uri: `${config.APP_URL}/callback`,
  post_logout_redirect_uri: config.APP_URL,
  response_type: 'code',
  scope: 'openid profile email',
  
  // PKCE Configuration (Required for SPAs)
  response_mode: 'query',
  
  // Silent renewal configuration
  silent_redirect_uri: `${config.APP_URL}/silent-renew`,
  automaticSilentRenew: true,
  
  // Security settings
  loadUserInfo: true,
  monitorSession: true,
  
  // Token settings
  accessTokenExpiringNotificationTimeInSeconds: 60, // seconds before expiry to trigger renewal
  
  // Metadata (will be auto-discovered from well-known endpoint)
  // https://keycloak.staging.e-auth.cloud/realms/sttlab/.well-known/openid-configuration
};

// Environment-specific logging
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  console.log('🔧 Development mode: OIDC configuration loaded');
  console.log('🔗 Well-known endpoint: https://keycloak.staging.e-auth.cloud/realms/sttlab/.well-known/openid-configuration');
}