import { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CredentialsInfo = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const credentials = [
    {
      role: 'Admin',
      email: 'admin@moviedist.com',
      password: 'Admin@123',
      description: 'Full system access with approval workflows'
    },
    {
      role: 'Manager',
      email: 'manager@moviedist.com',
      password: 'Manager@123',
      description: 'Read-only access to assigned movie data'
    },
    {
      role: 'Exhibitor',
      email: 'exhibitor@moviedist.com',
      password: 'Exhibitor@123',
      description: 'Collection submission and ledger viewing'
    }
  ];

  return (
    <div className="mt-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        iconName={isExpanded ? 'ChevronUp' : 'ChevronDown'}
        iconPosition="right"
        className="w-full justify-center"
      >
        {isExpanded ? 'Hide' : 'View'} Demo Credentials
      </Button>
      {isExpanded && (
        <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
          {credentials?.map((cred, index) => (
            <div
              key={index}
              className="bg-muted/50 rounded-lg p-4 border border-border"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon name="User" size={16} className="text-primary" />
                  <span className="font-semibold text-foreground">{cred?.role}</span>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                  Demo
                </span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <Icon name="Mail" size={14} className="text-muted-foreground" />
                  <span className="text-foreground font-data">{cred?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="Key" size={14} className="text-muted-foreground" />
                  <span className="text-foreground font-data">{cred?.password}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2 pl-6">{cred?.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CredentialsInfo;