import { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SubmissionHistory = ({ submissions = [], onEdit, onView }) => {
  const [filter, setFilter] = useState('all');

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        label: 'Pending Approval',
        className: 'bg-warning/10 text-warning border-warning/20',
        icon: 'Clock'
      },
      approved: {
        label: 'Approved',
        className: 'bg-success/10 text-success border-success/20',
        icon: 'CheckCircle2'
      },
      rejected: {
        label: 'Rejected',
        className: 'bg-error/10 text-error border-error/20',
        icon: 'XCircle'
      },
      draft: {
        label: 'Draft',
        className: 'bg-muted text-muted-foreground border-border',
        icon: 'FileEdit'
      }
    };

    const config = statusConfig?.[status] || statusConfig?.pending;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border ${config?.className}`}>
        <Icon name={config?.icon} size={12} />
        {config?.label}
      </span>
    );
  };

  const calculateRemainingEditTime = (submittedDate) => {
    const submitted = new Date(submittedDate);
    const now = new Date();
    const diffTime = 7 * 24 * 60 * 60 * 1000 - (now - submitted);
    
    if (diffTime <= 0) return 'Edit window closed';
    
    const days = Math.floor(diffTime / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diffTime % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    
    return `${days}d ${hours}h remaining`;
  };

  const canEdit = (submission) => {
    if (submission?.status !== 'pending' && submission?.status !== 'draft') return false;
    
    const submitted = new Date(submission.submittedAt);
    const now = new Date();
    const diffDays = (now - submitted) / (24 * 60 * 60 * 1000);
    
    return diffDays < 7;
  };

  const filteredSubmissions = submissions?.filter(sub => {
    if (filter === 'all') return true;
    return sub?.status === filter;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    })?.format(amount);
  };

  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Icon name="History" size={20} className="text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Submission History</h2>
              <p className="text-sm text-muted-foreground">Track your collection submissions</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {['all', 'pending', 'approved', 'rejected', 'draft']?.map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                filter === status
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {status?.charAt(0)?.toUpperCase() + status?.slice(1)}
              <span className="ml-2 px-1.5 py-0.5 rounded-full bg-background/20 text-xs">
                {status === 'all' 
                  ? submissions?.length 
                  : submissions?.filter(s => s?.status === status)?.length}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        {filteredSubmissions?.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Icon name="Inbox" size={32} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No submissions found</h3>
            <p className="text-sm text-muted-foreground">
              {filter === 'all' ?'Start by submitting your first collection entry' 
                : `No ${filter} submissions available`}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Movie
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Shows
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Collection
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Edit Window
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredSubmissions?.map((submission) => (
                <tr key={submission?.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Icon name="Calendar" size={14} className="text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">
                        {formatDate(submission?.collectionDate)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">{submission?.movieTitle}</p>
                      <p className="text-xs text-muted-foreground">{submission?.movieId}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Icon name="Film" size={14} className="text-muted-foreground" />
                      <span className="text-sm font-data text-foreground">{submission?.totalShows}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-semibold text-foreground font-data">
                        {formatCurrency(submission?.netCollection)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {submission?.totalTickets} tickets
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(submission?.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {submission?.status === 'pending' && (
                      <div className="flex items-center gap-1.5">
                        <Icon 
                          name="Clock" 
                          size={14} 
                          className={canEdit(submission) ? 'text-warning' : 'text-muted-foreground'} 
                        />
                        <span className={`text-xs font-medium ${
                          canEdit(submission) ? 'text-warning' : 'text-muted-foreground'
                        }`}>
                          {calculateRemainingEditTime(submission?.submittedAt)}
                        </span>
                      </div>
                    )}
                    {submission?.status === 'draft' && (
                      <span className="text-xs text-muted-foreground">Not submitted</span>
                    )}
                    {(submission?.status === 'approved' || submission?.status === 'rejected') && (
                      <span className="text-xs text-muted-foreground">Finalized</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(submission)}
                      >
                        <Icon name="Eye" size={16} />
                      </Button>
                      {canEdit(submission) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(submission)}
                        >
                          <Icon name="Edit" size={16} className="mr-1" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SubmissionHistory;