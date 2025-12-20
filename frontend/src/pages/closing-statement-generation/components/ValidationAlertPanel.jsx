import Icon from "../../../components/AppIcon";
import Button from "../../../components/ui/Button";

const ValidationAlertPanel = ({ validationResults, onResolve }) => {
  if (!validationResults || validationResults?.length === 0) {
    return null;
  }

  const criticalIssues = validationResults?.filter(
    (issue) => issue?.severity === "critical"
  );
  const warningIssues = validationResults?.filter(
    (issue) => issue?.severity === "warning"
  );
  const infoIssues = validationResults?.filter(
    (issue) => issue?.severity === "info"
  );

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case "critical":
        return <Icon name="AlertCircle" size={16} className="text-error" />;
      case "warning":
        return <Icon name="AlertTriangle" size={16} className="text-warning" />;
      case "info":
        return <Icon name="Info" size={16} className="text-primary" />;
      default:
        return <Icon name="Info" size={16} className="text-muted-foreground" />;
    }
  };

  const getSeverityBgColor = (severity) => {
    switch (severity) {
      case "critical":
        return "bg-error/10 border-error/20";
      case "warning":
        return "bg-warning/10 border-warning/20";
      case "info":
        return "bg-primary/10 border-primary/20";
      default:
        return "bg-muted/50 border-border";
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
            <Icon name="AlertTriangle" size={20} className="text-warning" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Validation Alerts
            </h3>
            <p className="text-sm text-muted-foreground">
              {criticalIssues?.length} critical, {warningIssues?.length}{" "}
              warnings, {infoIssues?.length} info
            </p>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {criticalIssues?.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-error mb-2 flex items-center gap-2">
              <Icon name="XCircle" size={16} />
              Critical Issues ({criticalIssues?.length})
            </h4>
            <div className="space-y-2">
              {criticalIssues?.map((issue, index) => (
                <div
                  key={`critical-${index}`}
                  className={`p-3 rounded-lg border ${getSeverityBgColor(
                    issue?.severity
                  )}`}
                >
                  <div className="flex items-start gap-3">
                    {getSeverityIcon(issue?.severity)}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {issue?.message}
                      </p>
                      {issue?.details && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {issue?.details}
                        </p>
                      )}
                      {issue?.affectedDates &&
                        issue?.affectedDates?.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-foreground mb-1">
                              Affected Dates:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {issue?.affectedDates?.map((date, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 bg-background rounded text-xs font-data"
                                >
                                  {new Date(date)?.toLocaleDateString("en-IN", {
                                    day: "2-digit",
                                    month: "short",
                                  })}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                    {issue?.resolvable && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onResolve(issue)}
                        className="shrink-0"
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {warningIssues?.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-warning mb-2 flex items-center gap-2">
              <Icon name="AlertTriangle" size={16} />
              Warnings ({warningIssues?.length})
            </h4>
            <div className="space-y-2">
              {warningIssues?.map((issue, index) => (
                <div
                  key={`warning-${index}`}
                  className={`p-3 rounded-lg border ${getSeverityBgColor(
                    issue?.severity
                  )}`}
                >
                  <div className="flex items-start gap-3">
                    {getSeverityIcon(issue?.severity)}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {issue?.message}
                      </p>
                      {issue?.details && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {issue?.details}
                        </p>
                      )}
                    </div>
                    {issue?.resolvable && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onResolve(issue)}
                        className="shrink-0"
                      >
                        Review
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {infoIssues?.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
              <Icon name="Info" size={16} />
              Information ({infoIssues?.length})
            </h4>
            <div className="space-y-2">
              {infoIssues?.map((issue, index) => (
                <div
                  key={`info-${index}`}
                  className={`p-3 rounded-lg border ${getSeverityBgColor(
                    issue?.severity
                  )}`}
                >
                  <div className="flex items-start gap-3">
                    {getSeverityIcon(issue?.severity)}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {issue?.message}
                      </p>
                      {issue?.details && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {issue?.details}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {criticalIssues?.length > 0 && (
        <div className="mt-4 p-3 bg-error/5 border border-error/20 rounded-lg">
          <div className="flex items-start gap-2">
            <Icon name="AlertCircle" size={16} className="text-error mt-0.5" />
            <p className="text-sm text-foreground">
              <span className="font-semibold">Action Required:</span> Critical
              issues must be resolved before generating the statement. Please
              review and fix the highlighted problems.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidationAlertPanel;
