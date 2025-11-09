import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { syncUser } from '../utils/api';

const CallbackPage = () => {
  const { isAuthenticated, isLoading, getAccessTokenSilently, user, error: authError } = useAuth0();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      if (authError) {
        setError(authError.message);
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      if (!isLoading && isAuthenticated && user) {
        try {
          // Get access token
          const token = await getAccessTokenSilently();
          
          // Sync user with backend
          try {
            await syncUser(token);
          } catch (syncError) {
            console.error('Error syncing user:', syncError);
            // Continue even if sync fails - user is still authenticated
          }
          
          // Redirect to home
          navigate('/');
        } catch (error) {
          console.error('Error handling callback:', error);
          setError('Failed to complete login. Please try again.');
          setTimeout(() => navigate('/'), 3000);
        }
      }
    };

    handleCallback();
  }, [isAuthenticated, isLoading, user, getAccessTokenSilently, navigate, authError]);

  if (error || authError) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '50px' }}>
        <div className="error">
          <h2>Login Error</h2>
          <p>{error || authError?.message || 'An error occurred during login'}</p>
          <p>Redirecting to home page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ textAlign: 'center', padding: '50px' }}>
      <h2>Loading...</h2>
      <p>Please wait while we sign you in.</p>
    </div>
  );
};

export default CallbackPage;

