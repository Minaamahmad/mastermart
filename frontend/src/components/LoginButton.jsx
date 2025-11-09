import { useAuth0 } from '@auth0/auth0-react';

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  const handleLogin = (connection) => {
    loginWithRedirect({
      authorizationParams: {
        connection: connection, // 'google-oauth2', 'facebook', or undefined for Auth0
      },
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', margin: '20px auto' }}>
      <h2>Sign In</h2>
      <p>Choose your preferred login method:</p>
      
      <button
        onClick={() => handleLogin('google-oauth2')}
        className="btn-primary"
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#4285f4',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px'
        }}
      >
        <span>🔵</span>
        Sign in with Google
      </button>

      <button
        onClick={() => handleLogin('facebook')}
        className="btn-primary"
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#1877f2',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px'
        }}
      >
        <span>📘</span>
        Sign in with Facebook
      </button>

      <button
        onClick={() => handleLogin()}
        className="btn-secondary"
        style={{
          width: '100%',
          padding: '12px',
          border: '1px solid #ddd',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Sign in with Email
      </button>
    </div>
  );
};

export default LoginButton;

