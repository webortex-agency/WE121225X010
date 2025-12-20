import Icon from '../../../components/AppIcon';

const SecurityBadges = () => {
  const badges = [
    {
      id: 1,
      icon: 'Shield',
      label: 'SSL Secured',
      description: '256-bit encryption'
    },
    {
      id: 2,
      icon: 'Lock',
      label: 'Data Protected',
      description: 'ISO 27001 certified'
    },
    {
      id: 3,
      icon: 'CheckCircle2',
      label: 'Compliant',
      description: 'Indian financial standards'
    }
  ];

  return (
    <div className="mt-8 pt-8 border-t border-border">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {badges?.map((badge) => (
          <div
            key={badge?.id}
            className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Icon name={badge?.icon} size={20} className="text-primary" />
            </div>
            <p className="text-sm font-semibold text-foreground">{badge?.label}</p>
            <p className="text-xs text-muted-foreground mt-1">{badge?.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SecurityBadges;