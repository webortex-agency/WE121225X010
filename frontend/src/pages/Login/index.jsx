import { useState } from 'react';
import { Helmet } from 'react-helmet';
import Icon from '../../components/AppIcon';
import RoleSelection from '../login-authentication/components/RoleSelection';
import LoginForm from '../login-authentication/components/LoginForm';

const LoginPage = () => {
  const [selectedRole, setSelectedRole] = useState(null);

  const handleSelectRole = (role) => {
    setSelectedRole(role);
  };

  const handleBack = () => {
    setSelectedRole(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
      <div className="container-fluid flex items-center justify-center min-h-screen py-8">
        <div className="w-full max-w-md mx-4">
          <div className="bg-card rounded-lg border border-border shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent mb-4">
                <Icon name="Film" size={32} color="#FFFFFF" />
              </div>
              <h1 className="text-2xl font-semibold text-foreground mb-2">
                Movie Distribution Dashboard
              </h1>
            </div>

            {!selectedRole ? (
              <RoleSelection onSelectRole={handleSelectRole} />
            ) : (
              <LoginForm role={selectedRole} onBack={handleBack} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
