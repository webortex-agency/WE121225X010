import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const ConfirmDeleteDialog = ({ exhibitor, onConfirm, onClose }) => {
  const hasActiveData = exhibitor.activeMovies > 0 || exhibitor.totalCollections > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center gap-3 p-6 border-b border-border">
          <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
            <Icon name="AlertTriangle" size={20} className="text-destructive" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Delete Exhibitor?</h2>
            <p className="text-sm text-muted-foreground">This action cannot be undone</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-foreground">
            Are you sure you want to delete <strong>{exhibitor.exhibitorName}</strong>?
          </p>

          {hasActiveData && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
              <div className="flex items-start gap-2">
                <Icon name="AlertCircle" size={16} className="text-destructive mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-destructive mb-2">Warning: This exhibitor has active data</p>
                  <p className="text-destructive/80 mb-2">Deleting will:</p>
                  <ul className="list-disc list-inside space-y-1 text-destructive/80">
                    <li>Remove all associated collection data</li>
                    <li>Invalidate login credentials</li>
                    <li>Make all collections read-only</li>
                    {exhibitor.activeMovies > 0 && (
                      <li>Unassign {exhibitor.activeMovies} active movie{exhibitor.activeMovies > 1 ? 's' : ''}</li>
                    )}
                    {exhibitor.totalCollections > 0 && (
                      <li>Archive ₹{exhibitor.totalCollections.toLocaleString('en-IN')} in collection history</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="bg-muted/50 rounded-md p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Info" size={16} className="text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Exhibitor Details</span>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>Cinema:</strong> {exhibitor.cinemaName}</p>
              <p><strong>Location:</strong> {exhibitor.location}</p>
              <p><strong>Contact:</strong> {exhibitor.contactPerson}</p>
              <p><strong>Email:</strong> {exhibitor.email}</p>
              <p><strong>Status:</strong> {exhibitor.status}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 p-6 border-t border-border">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            iconName="Trash2"
            iconPosition="left"
            className="flex-1"
          >
            Delete Exhibitor
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteDialog;
