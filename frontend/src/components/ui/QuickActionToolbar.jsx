import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';

const QuickActionToolbar = ({ userRole = 'admin' }) => {
  const [pendingCounts, setPendingCounts] = useState({
    collections: 12,
    approvals: 5,
    statements: 3,
  });
  const navigate = useNavigate();

  const adminActions = [
    // {
    //   id: 'pending-collections',
    //   label: 'Pending Collections',
    //   icon: 'Clock',
    //   count: pendingCounts?.collections,
    //   onClick: () => navigate('/exhibitor-portal'),
    // },
    // {
    //   id: 'pending-approvals',
    //   label: 'Pending Approvals',
    //   icon: 'CheckCircle2',
    //   count: pendingCounts?.approvals,
    //   onClick: () => navigate('/admin-dashboard'),
    // },
    // {
    //   id: 'generate-statements',
    //   label: 'Generate Statements',
    //   icon: 'FileText',
    //   count: pendingCounts?.statements,
    //   onClick: () => navigate('/closing-statement-generation'),
    // },
    // {
    //   id: 'bulk-operations',
    //   label: 'Bulk Operations',
    //   icon: 'Layers',
    //   onClick: () => {},
    // },
  ];

  const managerActions = [
    {
      id: 'movie-analytics',
      label: 'Movie Analytics',
      icon: 'BarChart3',
      onClick: () => navigate('/movie-manager-dashboard'),
    },
    {
      id: 'financial-reports',
      label: 'Financial Reports',
      icon: 'FileSpreadsheet',
      onClick: () => {},
    },
  ];

  const exhibitorActions = [
    {
      id: 'submit-collection',
      label: 'Submit Collection',
      icon: 'Plus',
      onClick: () => navigate('/exhibitor-portal'),
    },
    {
      id: 'view-ledger',
      label: 'View Ledger',
      icon: 'BookOpen',
      onClick: () => {},
    },
  ];

  const getActions = () => {
    switch (userRole) {
      // case 'admin':
      //   return adminActions;
      case 'manager':
        return managerActions;
      case 'exhibitor':
        return exhibitorActions;
      default:
        return adminActions;
    }
  };

  const actions = getActions();

  useEffect(() => {
    const interval = setInterval(() => {
      setPendingCounts((prev) => ({
        collections: Math.max(0, prev?.collections + Math.floor(Math.random() * 3) - 1),
        approvals: Math.max(0, prev?.approvals + Math.floor(Math.random() * 3) - 1),
        statements: Math.max(0, prev?.statements + Math.floor(Math.random() * 2) - 1),
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="quick-action-toolbar">
      <div className="quick-action-container">
        <div className="quick-action-grid">
          {actions?.map((action) => (
            <button
              key={action?.id}
              onClick={action?.onClick}
              className="quick-action-button"
            >
              <Icon name={action?.icon} size={16} />
              <span>{action?.label}</span>
              {action?.count !== undefined && action?.count > 0 && (
                <span className="quick-action-badge">{action?.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickActionToolbar;