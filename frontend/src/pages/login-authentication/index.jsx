import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet';
import Icon from '../../components/AppIcon';
import LoginForm from './components/LoginForm';
import SecurityBadges from './components/SecurityBadges';
import CredentialsInfo from './components/CredentialsInfo';

const LoginAuthentication = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo && userInfo.user) {
      switch (userInfo.user.role) {
        case 'admin':
          navigate('/admin-dashboard');
          break;
        case 'manager':
        case 'producer':
          navigate(`/movie-manager-dashboard/${userInfo.user.assigned_movie_id}`);
          break;
        case 'exhibitor':
          navigate('/exhibitor-portal');
          break;
        default:
          navigate('/');
      }
    }
  }, [navigate, userInfo]);

  return (
    <>
      <Helmet>
        <title>Login - Movie Distribution Dashboard</title>
        <meta name="description" content="Secure login to Movie Distribution Dashboard for financial management and theater collection tracking" />
      </Helmet>

      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-lg border border-border shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent mb-4">
                <Icon name="Film" size={32} color="#FFFFFF" />
              </div>
              <h1 className="text-2xl font-semibold text-foreground mb-2">
                Movie Distribution Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">
                Sign in to access your dashboard and manage collections
              </p>
            </div>

            <LoginForm />

            <CredentialsInfo />

            <SecurityBadges />

            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
                By signing in, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Need help? Contact{' '}
              <a href="mailto:support@moviedist.com" className="text-primary hover:text-primary/80 font-medium">
                support@moviedist.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginAuthentication;