import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // The UserContext will automatically handle the auth session via onAuthStateChange
    // Just redirect to profile after a brief moment
    const timer = setTimeout(() => {
      navigate('/profile', { replace: true });
    }, 100);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}>
      <p>Signing you in...</p>
    </div>
  );
}
