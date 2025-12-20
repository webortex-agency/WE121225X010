import React from 'react';
import Icon from '../../../components/AppIcon';
import { motion } from 'framer-motion';

const roles = [
  {
    role: 'admin',
    label: 'Admin',
    icon: 'Settings',
    description: 'System administrator with full access.',
  },
  {
    role: 'exhibitor',
    label: 'Exhibitor',
    icon: 'Building',
    description: 'Theater owner submitting collections.',
  },
  {
    role: 'manager',
    label: 'Manager',
    icon: 'Briefcase',
    description: 'Movie manager viewing collections.',
  },
  {
    role: 'producer',
    label: 'Producer',
    icon: 'Film',
    description: 'Producer viewing reports.',
  },
];

const RoleSelection = ({ onSelectRole }) => {
  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-foreground mb-2">Select Your Role</h1>
        <p className="text-sm text-muted-foreground">Choose your role to sign in to the dashboard.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {roles.map((item, index) => (
          <motion.div
            key={item.role}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <button
              onClick={() => onSelectRole(item.role)}
              className="w-full h-full text-left p-4 border border-border rounded-lg hover:bg-muted/50 hover:border-primary/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full  flex items-center justify-center text-black">
                  <Icon name={item.icon} size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{item.label}</h3>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RoleSelection;
