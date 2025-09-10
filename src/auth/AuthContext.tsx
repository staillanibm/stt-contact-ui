import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, UserManager } from 'oidc-client-ts';
import { oidcConfig } from '../config/oidc';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userManager] = useState(() => new UserManager(oidcConfig));

  const isAuthenticated = user !== null && !user.expired;

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if returning from login callback
        if (window.location.pathname === '/callback' && (window.location.search.includes('code=') || window.location.search.includes('error='))) {
          const callbackKey = `callback_processed_${window.location.search}`;
          if (!sessionStorage.getItem(callbackKey)) {
            console.log('🔄 Processing login callback...');
            sessionStorage.setItem(callbackKey, 'true');
            const callbackUser = await userManager.signinRedirectCallback();
            setUser(callbackUser);
            // Redirect to main app after successful login
            window.history.replaceState({}, document.title, '/');
            return;
          }
        }

        // Try to get existing user from storage
        const existingUser = await userManager.getUser();
        if (existingUser && !existingUser.expired) {
          console.log('✅ Found valid existing user session');
          setUser(existingUser);
        } else if (existingUser && existingUser.expired) {
          console.log('⚠️ User session expired, attempting silent renewal...');
          try {
            const renewedUser = await userManager.signinSilent();
            setUser(renewedUser);
            console.log('✅ Successfully renewed user session');
          } catch (error) {
            console.log('❌ Silent renewal failed:', error);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Event listeners for user events
    const handleUserLoaded = (loadedUser: User) => {
      console.log('👤 User loaded:', loadedUser.profile?.name);
      setUser(loadedUser);
    };

    const handleUserUnloaded = () => {
      console.log('👤 User unloaded');
      setUser(null);
    };

    const handleAccessTokenExpiring = async () => {
      console.log('⏰ Access token expiring, attempting silent renewal...');
      try {
        const renewedUser = await userManager.signinSilent();
        setUser(renewedUser);
        console.log('✅ Token renewed successfully');
      } catch (error) {
        console.error('❌ Token renewal failed:', error);
        setUser(null);
      }
    };

    const handleAccessTokenExpired = async () => {
      console.log('❌ Access token expired, attempting renewal...');
      try {
        const renewedUser = await userManager.signinSilent();
        setUser(renewedUser);
        console.log('✅ Expired token renewed successfully');
      } catch (error) {
        console.error('❌ Failed to renew expired token:', error);
        setUser(null);
      }
    };

    const handleSilentRenewError = (error: Error) => {
      console.error('❌ Silent renewal error:', error);
      setUser(null);
    };

    // Add event listeners
    userManager.events.addUserLoaded(handleUserLoaded);
    userManager.events.addUserUnloaded(handleUserUnloaded);
    userManager.events.addAccessTokenExpiring(handleAccessTokenExpiring);
    userManager.events.addAccessTokenExpired(handleAccessTokenExpired);
    userManager.events.addSilentRenewError(handleSilentRenewError);

    // Cleanup
    return () => {
      userManager.events.removeUserLoaded(handleUserLoaded);
      userManager.events.removeUserUnloaded(handleUserUnloaded);
      userManager.events.removeAccessTokenExpiring(handleAccessTokenExpiring);
      userManager.events.removeAccessTokenExpired(handleAccessTokenExpired);
      userManager.events.removeSilentRenewError(handleSilentRenewError);
    };
  }, [userManager]);

  const login = async () => {
    try {
      console.log('🔑 Initiating login...');
      await userManager.signinRedirect();
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Initiating logout...');
      await userManager.signoutRedirect();
    } catch (error) {
      console.error('❌ Logout error:', error);
      throw error;
    }
  };

  const getAccessToken = (): string | null => {
    return user?.access_token || null;
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    getAccessToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};