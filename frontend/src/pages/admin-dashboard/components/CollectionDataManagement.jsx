import { useState, useEffect, useCallback } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/shared/Modal';
import LoadingSpinner from '../../../components/shared/LoadingSpinner';
import { getStatusBadge } from '../../../utils/statusBadge';
import { getAllCollections, approveCollection, rejectCollection } from '../../../utils/api';

// Map API collection to UI shape
const mapCollection = (c) => ({
  id: c._id,
  date: c.date ? new Date(c.date).toISOString().split('T')[0] : '',
  theater: c.theater_name || c.exhibitor_id?.name || 'Unknown',
  movie: c.movie_id,
  movieId: c.movie_id,
  shows: {
    matinee: { collection: c.shows?.matinee?.collection || 0, occupancy: c.shows?.matinee?.occupancy || 0, tickets: c.shows?.matinee?.count || 0 },
    afternoon: { collection: c.shows?.afternoon?.collection || 0, occupancy: c.shows?.afternoon?.occupancy || 0, tickets: c.shows?.afternoon?.count || 0 },
    firstShow: { collection: c.shows?.first_show?.collection || 0, occupancy: c.shows?.first_show?.occupancy || 0, tickets: c.shows?.first_show?.count || 0 },
    secondShow: { collection: c.shows?.second_show?.collection || 0, occupancy: c.shows?.second_show?.occupancy || 0, tickets: c.shows?.second_show?.count || 0 },
  },
  totalCollection: c.totals?.collection || 0,
  acCharges: 0,
  netCollection: c.net_collection || 0,
  expenses: c.expenses?.total || 0,
  status: c.status,
  submittedAt: c.createdAt,
  submittedBy: c.submitted_by?.name || 'Exhibitor',
  approvedAt: c.approved_date,
  approvedBy: c.approved_by?.name || '',
  notes: c.notes || '',
});

const CollectionDataManagement = () => {
  const [activeTab, setActiveTab] = useState('view');
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [apiError, setApiError] = useState('');

  const fetchCollections = useCallback(async (params = {}) => {
    setLoading(true);
    setApiError('');
    try {
      const data = await getAllCollections({ limit: 100, ...params });
      setCollections((data.collections || []).map(mapCollection));
    } catch (err) {
      setApiError(err.message || 'Failed to load collections');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    theater: '',
    movie: '',
    status: 'all'
  });

  const [selectedCollection, setSelectedCollection] = useState(null);
  const [editingCollection, setEditingCollection] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null); // { id, reason }


  // Get unique theaters and movies for filters
  const uniqueTheaters = [...new Set(collections.map(c => c.theater))];
  const uniqueMovies = [...new Set(collections.map(c => c.movie))];

  // Filter collections based on current filters
  const filteredCollections = collections.filter(collection => {
    const matchesDateFrom = !filters.dateFrom || collection.date >= filters.dateFrom;
    const matchesDateTo = !filters.dateTo || collection.date <= filters.dateTo;
    const matchesTheater = !filters.theater || collection.theater === filters.theater;
    const matchesMovie = !filters.movie || collection.movie === filters.movie;
    const matchesStatus = filters.status === 'all' || collection.status === filters.status;

    return matchesDateFrom && matchesDateTo && matchesTheater && matchesMovie && matchesStatus;
  });

  // Handle approval/rejection via real API
  const handleApproval = async (collectionId, action, comment = '') => {
    setActionLoading(collectionId);
    setApiError('');
    try {
      if (action === 'approve') {
        await approveCollection(collectionId);
      } else if (action === 'reject') {
        if (!comment) {
          setApiError('Please provide a rejection reason');
          setActionLoading(null);
          return;
        }
        await rejectCollection(collectionId, comment);
      }
      // Refresh list after action
      await fetchCollections();
    } catch (err) {
      setApiError(err.message || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle edit collection
  const handleEditCollection = (collection) => {
    setEditingCollection({ ...collection });
  };

  // Save edited collection
  const handleSaveEdit = () => {
    if (!editingCollection) return;

    setCollections(prev => prev.map(collection => {
      if (collection.id === editingCollection.id) {
        return {
          ...editingCollection,
          editedAt: new Date().toISOString(),
          editedBy: 'Admin User'
        };
      }
      return collection;
    }));

    setEditingCollection(null);
    alert('Collection updated successfully');
  };

  // Archive collection
  const handleArchiveCollection = (collectionId) => {
    if (confirm('Are you sure you want to archive this collection? It will be hidden from normal view but can be recovered.')) {
      setCollections(prev => prev.map(collection => {
        if (collection.id === collectionId) {
          return {
            ...collection,
            status: 'archived',
            archivedAt: new Date().toISOString(),
            archivedBy: 'Admin User'
          };
        }
        return collection;
      }));
    }
  };

  // Export functions
  const exportToExcel = () => {
    const headers = ['Date', 'Theater', 'Movie', 'Total Collection', 'Net Collection', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredCollections.map(collection => [
        collection.date,
        `"${collection.theater}"`,
        `"${collection.movie}"`,
        collection.totalCollection,
        collection.netCollection,
        collection.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'collections_export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = async () => {
    try {
      const { exportCollectionsCSV } = await import('../../../utils/api');
      await exportCollectionsCSV({ status: filters.status !== 'all' ? filters.status : undefined });
    } catch (err) {
      setApiError('Export failed: ' + err.message);
    }
  };

  const tabs = [
    { id: 'view', label: 'View All Collections', icon: 'List' },
    { id: 'daily', label: 'Daily Details', icon: 'Calendar' },
    { id: 'approve', label: 'Approve/Reject', icon: 'CheckCircle' },
    { id: 'edit', label: 'Edit Collections', icon: 'Edit' }
  ];

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="border-b border-border">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-semibold text-foreground">Collection Data Management</h2>
          <div className="flex items-center gap-2">
            <Icon name="IndianRupee" size={20} className="text-primary" />
          </div>
        </div>
        
        <div className="border-b border-border overflow-x-auto">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <Icon name={tab.icon} size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6">
        {apiError && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2">
            <Icon name="AlertCircle" size={16} className="text-destructive" />
            <p className="text-sm text-destructive">{apiError}</p>
            <button onClick={() => setApiError('')} className="ml-auto">
              <Icon name="X" size={14} className="text-destructive" />
            </button>
          </div>
        )}
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner label="Loading collections…" />
          </div>
        ) : activeTab === 'view' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="font-medium text-foreground mb-4">Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">From Date</label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">To Date</label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Theater</label>
                  <select
                    value={filters.theater}
                    onChange={(e) => setFilters(prev => ({ ...prev, theater: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  >
                    <option value="">All Theaters</option>
                    {uniqueTheaters.map(theater => (
                      <option key={theater} value={theater}>{theater}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Movie</label>
                  <select
                    value={filters.movie}
                    onChange={(e) => setFilters(prev => ({ ...prev, movie: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  >
                    <option value="">All Movies</option>
                    {uniqueMovies.map(movie => (
                      <option key={movie} value={movie}>{movie}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Export Buttons */}
            <div className="flex gap-3">
              <Button variant="outline" onClick={exportToExcel} iconName="Download" iconPosition="left">
                Export CSV
              </Button>
              <Button variant="outline" onClick={exportToPDF} iconName="FileText" iconPosition="left">
                Export PDF
              </Button>
            </div>

            {/* Collections Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-foreground">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground">Theater</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground">Movie</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground">Collection</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground">Occupancy</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCollections.map((collection) => {
                    const avgOccupancy = Math.round(
                      (collection.shows.matinee.occupancy + collection.shows.afternoon.occupancy + 
                       collection.shows.firstShow.occupancy + collection.shows.secondShow.occupancy) / 4
                    );

                    return (
                      <tr key={collection.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-4">{collection.date}</td>
                        <td className="py-3 px-4">{collection.theater}</td>
                        <td className="py-3 px-4">{collection.movie}</td>
                        <td className="py-3 px-4">₹{collection.totalCollection.toLocaleString()}</td>
                        <td className="py-3 px-4">{avgOccupancy}%</td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${getStatusBadge(collection.status)}`}>
                            {collection.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="ghost" onClick={() => setSelectedCollection(collection)} title="View Details">
                              <Icon name="Eye" size={14} />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleArchiveCollection(collection.id)} title="Archive">
                              <Icon name="Archive" size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredCollections.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Icon name="IndianRupee" size={48} className="mx-auto mb-4 opacity-50" />
                <p>No collections found matching your criteria</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'daily' && selectedCollection && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">
                Daily Details - {selectedCollection.date}
              </h3>
              <button
                onClick={() => setSelectedCollection(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Icon name="X" size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-muted/30 p-4 rounded-lg">
                <h4 className="font-medium text-foreground mb-3">Basic Information</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Theater:</strong> {selectedCollection.theater}</p>
                  <p><strong>Movie:</strong> {selectedCollection.movie}</p>
                  <p><strong>Date:</strong> {selectedCollection.date}</p>
                  <p><strong>Submitted By:</strong> {selectedCollection.submittedBy}</p>
                  <p><strong>Status:</strong> {selectedCollection.status}</p>
                </div>
              </div>

              <div className="bg-muted/30 p-4 rounded-lg">
                <h4 className="font-medium text-foreground mb-3">Financial Summary</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Total Collection:</strong> ₹{selectedCollection.totalCollection.toLocaleString()}</p>
                  <p><strong>AC Charges:</strong> ₹{selectedCollection.acCharges.toLocaleString()}</p>
                  <p><strong>Net Collection:</strong> ₹{selectedCollection.netCollection.toLocaleString()}</p>
                  <p><strong>Expenses:</strong> ₹{selectedCollection.expenses.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-muted/30 p-4 rounded-lg">
              <h4 className="font-medium text-foreground mb-3">Show-wise Breakdown</h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 font-medium">Show</th>
                      <th className="text-left py-2 px-3 font-medium">Collection</th>
                      <th className="text-left py-2 px-3 font-medium">Occupancy</th>
                      <th className="text-left py-2 px-3 font-medium">Tickets</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(selectedCollection.shows).map(([showName, showData]) => (
                      <tr key={showName} className="border-b border-border">
                        <td className="py-2 px-3 capitalize">{showName.replace(/([A-Z])/g, ' $1').trim()}</td>
                        <td className="py-2 px-3">₹{showData.collection.toLocaleString()}</td>
                        <td className="py-2 px-3">{showData.occupancy}%</td>
                        <td className="py-2 px-3">{showData.tickets}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {selectedCollection.notes && (
              <div className="bg-muted/30 p-4 rounded-lg">
                <h4 className="font-medium text-foreground mb-2">Notes</h4>
                <p className="text-sm text-muted-foreground">{selectedCollection.notes}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'approve' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Pending Approvals</h3>
              <button onClick={() => fetchCollections()} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                <Icon name="RefreshCw" size={14} />
                Refresh
              </button>
            </div>

            {collections.filter(c => c.status === 'submitted' || c.status === 'pending').map((collection) => (
              <div key={collection.id} className="bg-muted/30 border border-border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-foreground">{collection.theater} — {collection.movie}</h4>
                    <p className="text-sm text-muted-foreground">
                      {collection.date} &nbsp;|&nbsp; Gross: ₹{(collection.totalCollection || 0).toLocaleString('en-IN')} &nbsp;|&nbsp; Net: ₹{(collection.netCollection || 0).toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">Submitted by: {collection.submittedBy}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      disabled={actionLoading === collection.id}
                      loading={actionLoading === collection.id}
                      onClick={() => handleApproval(collection.id, 'approve')}
                      iconName="Check"
                      iconPosition="left"
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={actionLoading === collection.id}
                      onClick={() => setRejectTarget({ id: collection.id, reason: '' })}
                      iconName="X"
                      iconPosition="left"
                    >
                      Reject
                    </Button>
                  </div>
                </div>

                {collection.notes && (
                  <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                    <strong>Notes:</strong> {collection.notes}
                  </p>
                )}
              </div>
            ))}

            {collections.filter(c => c.status === 'submitted' || c.status === 'pending').length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Icon name="CheckCircle" size={48} className="mx-auto mb-4 opacity-50" />
                <p>No pending collections — all caught up!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'edit' && (
          <div className="text-center py-8 text-muted-foreground">
            <Icon name="Edit" size={48} className="mx-auto mb-4 opacity-50" />
            <p>Collection editing interface will be implemented here</p>
            <p className="text-sm mt-2">Admin override functionality with audit logging</p>
          </div>
        )}
      </div>

      {/* Collection Details Modal */}
      <Modal
        isOpen={!!selectedCollection && activeTab === 'view'}
        onClose={() => setSelectedCollection(null)}
        title="Collection Details"
        size="md"
      >
        {selectedCollection && (
          <div className="p-6 space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p><strong>Theater:</strong> {selectedCollection.theater}</p>
                <p><strong>Movie:</strong> {selectedCollection.movie}</p>
                <p><strong>Date:</strong> {selectedCollection.date}</p>
                <p><strong>Submitted by:</strong> {selectedCollection.submittedBy}</p>
              </div>
              <div className="space-y-1">
                <p><strong>Gross:</strong> ₹{(selectedCollection.totalCollection || 0).toLocaleString('en-IN')}</p>
                <p><strong>Net:</strong> ₹{(selectedCollection.netCollection || 0).toLocaleString('en-IN')}</p>
                <p><strong>Status:</strong> <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${getStatusBadge(selectedCollection.status)}`}>{selectedCollection.status}</span></p>
              </div>
            </div>
            {selectedCollection.notes && (
              <div className="bg-muted/30 p-3 rounded">
                <strong>Notes:</strong> {selectedCollection.notes}
              </div>
            )}
            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setSelectedCollection(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Reason Modal */}
      <Modal
        isOpen={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        title="Reject Collection"
        size="sm"
      >
        {rejectTarget && (
          <div className="p-6 space-y-4">
            <p className="text-sm text-muted-foreground">Provide a reason for rejecting this collection. This will be shown to the exhibitor.</p>
            <textarea
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-destructive"
              rows={3}
              placeholder="Enter rejection reason…"
              value={rejectTarget.reason}
              onChange={(e) => setRejectTarget((p) => ({ ...p, reason: e.target.value }))}
            />
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setRejectTarget(null)}>Cancel</Button>
              <Button
                variant="destructive"
                disabled={!rejectTarget.reason.trim() || actionLoading === rejectTarget.id}
                loading={actionLoading === rejectTarget.id}
                onClick={async () => {
                  await handleApproval(rejectTarget.id, 'reject', rejectTarget.reason);
                  setRejectTarget(null);
                }}
              >
                Confirm Reject
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CollectionDataManagement;
