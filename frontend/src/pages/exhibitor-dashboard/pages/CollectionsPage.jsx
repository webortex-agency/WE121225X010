import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectFilteredSubmissions,
  selectSubmissionsFilter,
  selectPendingSubmissions,
  selectApprovedSubmissions,
  selectRejectedSubmissions,
  setFilter,
  bulkSubmit,
  addSubmission
} from '../../../store/exhibitorCollectionsSlice';
import { selectScheduleForWeek, selectSelectedWeek } from '../../../store/exhibitorScheduleSlice';
import RoleBasedNavigation from '../../../components/ui/RoleBasedNavigation';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const CollectionsPage = () => {
  const dispatch = useDispatch();
  const submissions = useSelector(selectFilteredSubmissions);
  const filter = useSelector(selectSubmissionsFilter);
  const pendingSubmissions = useSelector(selectPendingSubmissions);
  const approvedSubmissions = useSelector(selectApprovedSubmissions);
  const rejectedSubmissions = useSelector(selectRejectedSubmissions);
  const selectedWeek = useSelector(selectSelectedWeek);
  const weekSchedule = useSelector(state => selectScheduleForWeek(state, selectedWeek));

  const [selectedShows, setSelectedShows] = useState([]);
  const [showBulkSubmit, setShowBulkSubmit] = useState(false);

  // Get completed shows from current week that haven't been submitted
  const getSubmittableShows = () => {
    const shows = [];
    Object.keys(weekSchedule).forEach(date => {
      Object.keys(weekSchedule[date]).forEach(showId => {
        const show = weekSchedule[date][showId];
        if (show.totalSeats && show.occupiedSeats && show.ticketPrice && show.status === 'draft') {
          shows.push({
            ...show,
            date,
            showId
          });
        }
      });
    });
    return shows;
  };

  const submittableShows = getSubmittableShows();

  const handleFilterChange = (newFilter) => {
    dispatch(setFilter(newFilter));
  };

  const handleBulkSubmit = () => {
    if (selectedShows.length === 0) return;

    const showsData = selectedShows.map(showId => {
      const show = submittableShows.find(s => s.id === showId);
      return {
        movieId: show.movieId,
        movieTitle: show.movieTitle,
        date: show.date,
        showNumber: show.showNumber,
        showTime: show.showTime,
        totalSeats: show.totalSeats,
        occupiedSeats: show.occupiedSeats,
        ticketPrice: show.ticketPrice,
        grossCollection: show.grossCollection,
        acCharge: show.acCharge,
        netCollection: show.netCollection,
        notes: show.notes || ''
      };
    });

    dispatch(bulkSubmit({ showsData }));
    setSelectedShows([]);
    setShowBulkSubmit(false);
  };

  const toggleShowSelection = (showId) => {
    setSelectedShows(prev => 
      prev.includes(showId) 
        ? prev.filter(id => id !== showId)
        : [...prev, showId]
    );
  };

  const selectAllShows = () => {
    setSelectedShows(submittableShows.map(show => show.id));
  };

  const clearSelection = () => {
    setSelectedShows([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <RoleBasedNavigation userRole="exhibitor" />
      
      <div className="container mx-auto px-6 py-8 pt-20">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
              <Icon name="FileText" size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Collections Submission</h1>
              <p className="text-muted-foreground">Submit and track your show collection reports</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Icon name="Clock" size={20} className="text-yellow-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{pendingSubmissions.length}</div>
                  <div className="text-sm text-muted-foreground">Pending</div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Icon name="CheckCircle" size={20} className="text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{approvedSubmissions.length}</div>
                  <div className="text-sm text-muted-foreground">Approved</div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Icon name="XCircle" size={20} className="text-red-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{rejectedSubmissions.length}</div>
                  <div className="text-sm text-muted-foreground">Rejected</div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Icon name="Upload" size={20} className="text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{submittableShows.length}</div>
                  <div className="text-sm text-muted-foreground">Ready to Submit</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Submit Section */}
        {submittableShows.length > 0 && (
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Submit New Collections</h2>
                <p className="text-muted-foreground">Select completed shows to submit for approval</p>
              </div>
              <div className="flex items-center gap-3">
                {selectedShows.length > 0 && (
                  <>
                    <Button variant="outline" onClick={clearSelection}>
                      Clear Selection
                    </Button>
                    <Button onClick={handleBulkSubmit} className="bg-teal-600 hover:bg-teal-700">
                      <Icon name="Upload" size={16} className="mr-2" />
                      Submit {selectedShows.length} Shows
                    </Button>
                  </>
                )}
                {selectedShows.length === 0 && (
                  <Button variant="outline" onClick={selectAllShows}>
                    Select All
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {submittableShows.map((show) => (
                <div
                  key={show.id}
                  className={`
                    border border-border rounded-lg p-4 cursor-pointer transition-all
                    ${selectedShows.includes(show.id) 
                      ? 'bg-teal-50 border-teal-300' 
                      : 'bg-background hover:bg-muted/20'
                    }
                  `}
                  onClick={() => toggleShowSelection(show.id)}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={selectedShows.includes(show.id)}
                      onChange={() => toggleShowSelection(show.id)}
                      className="w-5 h-5 text-teal-600 border-2 border-border rounded focus:ring-teal-500"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-foreground">{show.movieTitle}</h3>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(show.date)} • Show {show.showNumber} ({show.showTime})
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-semibold text-foreground">
                            ₹{show.netCollection?.toLocaleString()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {show.occupiedSeats}/{show.totalSeats} seats
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submissions History */}
        <div className="bg-card border border-border rounded-lg">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Submission History</h2>
              
              {/* Filters */}
              <div className="flex items-center gap-3">
                <select
                  value={filter.status}
                  onChange={(e) => handleFilterChange({ status: e.target.value })}
                  className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-6">
            {submissions.length === 0 ? (
              <div className="text-center py-12">
                <Icon name="FileText" size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium text-foreground mb-2">No Submissions Found</h3>
                <p className="text-muted-foreground">
                  {filter.status === 'all' 
                    ? 'You haven\'t submitted any collections yet'
                    : `No ${filter.status} submissions found`
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <SubmissionCard key={submission.id} submission={submission} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const SubmissionCard = ({ submission }) => {
  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'approved': 'bg-green-100 text-green-800 border-green-200',
      'rejected': 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status) => {
    const icons = {
      'pending': 'Clock',
      'approved': 'CheckCircle',
      'rejected': 'XCircle',
    };
    return icons[status] || 'Clock';
  };

  return (
    <div className="border border-border rounded-lg p-4 hover:bg-muted/20 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-medium text-foreground">{submission.movieTitle}</h3>
            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(submission.status)}`}>
              <Icon name={getStatusIcon(submission.status)} size={12} />
              {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground mb-2">
            {formatDate(submission.showDate)} • Show {submission.showNumber} ({submission.showTime})
          </div>
          
          <div className="flex items-center gap-6 text-sm">
            <span className="text-muted-foreground">
              Seats: <span className="font-medium text-foreground">{submission.occupiedSeats}/{submission.totalSeats}</span>
            </span>
            <span className="text-muted-foreground">
              Price: <span className="font-medium text-foreground">₹{submission.ticketPrice}</span>
            </span>
            <span className="text-muted-foreground">
              Net Collection: <span className="font-medium text-foreground">₹{submission.netCollection?.toLocaleString()}</span>
            </span>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-muted-foreground mb-1">
            Submitted: {formatDateTime(submission.submittedAt)}
          </div>
          <Button variant="outline" size="sm">
            <Icon name="Eye" size={14} className="mr-1" />
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
};

// Helper functions
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default CollectionsPage;
