import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { setAuth0TokenGetter } from './utils/api';

// Inner component to set up token getter
const Auth0TokenSetup = ({ children }) => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  useEffect(() => {
    if (isAuthenticated) {
      setAuth0TokenGetter(() => getAccessTokenSilently());
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  return children;
};

const Auth0ProviderWithNavigate = ({ children }) => {
  const navigate = useNavigate();
  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  // Audience is optional for SPAs - only include if you have an API
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE;
  // Use explicit redirect URI from env or fallback to exact localhost:3000/callback
  const redirectUri = import.meta.env.VITE_AUTH0_REDIRECT_URI || 'http://localhost:3000/callback';

  if (!domain || !clientId) {
    console.warn('Auth0 configuration is missing. Social login will not work. Please check your .env file.');
    return children;
  }

  const onRedirectCallback = (appState) => {
    navigate(appState?.returnTo || window.location.pathname);
  };

  // Build authorization params - only include audience if explicitly set and needed
  const authParams = {
    redirect_uri: redirectUri,
  };
  
  // Only add audience if you're using an API (not needed for basic login)
  // Uncomment the line below if you have an API and need to request access tokens
  // if (audience) {
  //   authParams.audience = audience;
  // }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={authParams}
      onRedirectCallback={onRedirectCallback}
      useRefreshTokens={true}
      cacheLocation="localstorage"
    >
      <Auth0TokenSetup>
        {children}
      </Auth0TokenSetup>
    </Auth0Provider>
  );
};

export default Auth0ProviderWithNavigate;

