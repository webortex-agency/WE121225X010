import { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SystemAlerts = ({ alerts, onDismiss }) => {
  const [expandedAlert, setExpandedAlert] = useState(null);

  const getAlertConfig = (type) => {
    const configs = {
      critical: {
        bgColor: 'bg-error/10',
        borderColor: 'border-error',
        textColor: 'text-error',
        icon: 'AlertCircle',
      },
      warning: {
        bgColor: 'bg-warning/10',
        borderColor: 'border-warning',
        textColor: 'text-warning',
        icon: 'AlertTriangle',
      },
      info: {
        bgColor: 'bg-primary/10',
        borderColor: 'border-primary',
        textColor: 'text-primary',
        icon: 'Info',
      },
      success: {
        bgColor: 'bg-success/10',
        borderColor: 'border-success',
        textColor: 'text-success',
        icon: 'CheckCircle2',
      },
    };

    return configs?.[type] || configs?.info;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return date?.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">System Alerts</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {alerts?.filter((a) => !a?.dismissed)?.length} active alerts
          </p>
        </div>
        <Button variant="ghost" size="sm">
          <Icon name="Settings" size={16} />
        </Button>
      </div>
      <div className="divide-y divide-border max-h-[400px] overflow-y-auto scrollbar-thin">
        {alerts?.filter((alert) => !alert?.dismissed)?.map((alert) => {
            const config = getAlertConfig(alert?.type);
            const isExpanded = expandedAlert === alert?.id;

            return (
              <div
                key={alert?.id}
                className={`p-4 ${config?.bgColor} border-l-4 ${config?.borderColor} transition-all`}
              >
                <div className="flex items-start gap-3">
                  <div className={`${config?.textColor} mt-0.5`}>
                    <Icon name={config?.icon} size={20} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className={`text-sm font-semibold ${config?.textColor}`}>
                        {alert?.title}
                      </h4>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatTimestamp(alert?.timestamp)}
                      </span>
                    </div>

                    <p className="text-sm text-foreground mb-2">{alert?.message}</p>

                    {alert?.details && (
                      <>
                        {isExpanded && (
                          <div className="mt-2 p-3 bg-background/50 rounded text-xs text-muted-foreground">
                            {alert?.details}
                          </div>
                        )}
                        <button
                          onClick={() => setExpandedAlert(isExpanded ? null : alert?.id)}
                          className="text-xs text-primary hover:underline mt-1"
                        >
                          {isExpanded ? 'Show less' : 'Show details'}
                        </button>
                      </>
                    )}

                    <div className="flex items-center gap-2 mt-3">
                      {alert?.actionLabel && (
                        <Button variant="outline" size="xs">
                          {alert?.actionLabel}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => onDismiss(alert?.id)}
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

        {alerts?.filter((a) => !a?.dismissed)?.length === 0 && (
          <div className="p-8 text-center">
            <Icon name="CheckCircle2" size={48} className="text-success mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No active alerts</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemAlerts;