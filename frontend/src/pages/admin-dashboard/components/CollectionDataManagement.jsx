import { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const CollectionDataManagement = () => {
  const [activeTab, setActiveTab] = useState('view');
  const [collections, setCollections] = useState([
    {
      id: 'COL-2023-001',
      date: '2023-12-12',
      theater: 'GOWRI Theater',
      movie: 'Pathaan',
      movieId: 'MOV-2025-001',
      shows: {
        matinee: { collection: 45000, occupancy: 85, tickets: 180 },
        afternoon: { collection: 65000, occupancy: 92, tickets: 230 },
        firstShow: { collection: 85000, occupancy: 95, tickets: 285 },
        secondShow: { collection: 50000, occupancy: 78, tickets: 200 }
      },
      totalCollection: 245000,
      acCharges: 12250,
      netCollection: 232750,
      expenses: 15000,
      status: 'pending',
      submittedAt: '2023-12-12T18:30:00Z',
      submittedBy: 'Rajesh Kumar',
      notes: 'Good response for weekend show'
    },
    {
      id: 'COL-2023-002',
      date: '2023-12-11',
      theater: 'PVR Cinemas Phoenix',
      movie: 'Jawan',
      movieId: 'MOV-2025-002',
      shows: {
        matinee: { collection: 35000, occupancy: 75, tickets: 150 },
        afternoon: { collection: 55000, occupancy: 88, tickets: 220 },
        firstShow: { collection: 75000, occupancy: 90, tickets: 300 },
        secondShow: { collection: 20000, occupancy: 45, tickets: 90 }
      },
      totalCollection: 185000,
      acCharges: 9250,
      netCollection: 175750,
      expenses: 12000,
      status: 'approved',
      submittedAt: '2023-12-11T19:15:00Z',
      approvedAt: '2023-12-12T10:30:00Z',
      submittedBy: 'Priya Sharma',
      approvedBy: 'Admin User',
      notes: 'Regular weekday collection'
    }
  ]);

  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    theater: '',
    movie: '',
    status: 'all'
  });

  const [selectedCollection, setSelectedCollection] = useState(null);
  const [editingCollection, setEditingCollection] = useState(null);

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

  // Handle approval/rejection
  const handleApproval = (collectionId, action, comment = '') => {
    setCollections(prev => prev.map(collection => {
      if (collection.id === collectionId) {
        const now = new Date().toISOString();
        if (action === 'approve') {
          return {
            ...collection,
            status: 'approved',
            approvedAt: now,
            approvedBy: 'Admin User',
            approvalComment: comment
          };
        } else if (action === 'reject') {
          return {
            ...collection,
            status: 'rejected',
            rejectedAt: now,
            rejectedBy: 'Admin User',
            rejectionReason: comment
          };
        }
      }
      return collection;
    }));
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

  const exportToPDF = () => {
    alert('PDF export functionality will be implemented with a PDF library');
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
        {activeTab === 'view' && (
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
              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-md font-medium transition-colors"
              >
                <Icon name="Download" size={16} />
                Export to Excel
              </button>
              <button
                onClick={exportToPDF}
                className="flex items-center gap-2 bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-md font-medium transition-colors"
              >
                <Icon name="FileText" size={16} />
                Export to PDF
              </button>
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
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            collection.status === 'approved' ? 'bg-green-100 text-green-800' :
                            collection.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            collection.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {collection.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedCollection(collection)}
                              className="text-blue-600 hover:text-blue-800"
                              title="View Details"
                            >
                              <Icon name="Eye" size={16} />
                            </button>
                            <button
                              onClick={() => handleEditCollection(collection)}
                              className="text-green-600 hover:text-green-800"
                              title="Edit"
                            >
                              <Icon name="Edit" size={16} />
                            </button>
                            <button
                              onClick={() => handleArchiveCollection(collection.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Archive"
                            >
                              <Icon name="Archive" size={16} />
                            </button>
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
            <h3 className="text-lg font-semibold text-foreground">Pending Approvals</h3>
            
            {collections.filter(c => c.status === 'pending').map((collection) => (
              <div key={collection.id} className="bg-muted/30 border border-border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-foreground">{collection.theater} - {collection.movie}</h4>
                    <p className="text-sm text-muted-foreground">{collection.date} | ₹{collection.totalCollection.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const comment = prompt('Add approval comment (optional):');
                        handleApproval(collection.id, 'approve', comment || '');
                      }}
                      className="flex items-center gap-1 bg-green-600 text-white hover:bg-green-700 px-3 py-1 rounded text-sm"
                    >
                      <Icon name="Check" size={14} />
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt('Enter rejection reason:');
                        if (reason) {
                          handleApproval(collection.id, 'reject', reason);
                        }
                      }}
                      className="flex items-center gap-1 bg-red-600 text-white hover:bg-red-700 px-3 py-1 rounded text-sm"
                    >
                      <Icon name="X" size={14} />
                      Reject
                    </button>
                  </div>
                </div>
                
                {collection.notes && (
                  <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                    <strong>Notes:</strong> {collection.notes}
                  </p>
                )}
              </div>
            ))}

            {collections.filter(c => c.status === 'pending').length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Icon name="CheckCircle" size={48} className="mx-auto mb-4 opacity-50" />
                <p>No pending collections to approve</p>
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
      {selectedCollection && activeTab === 'view' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Collection Details</h3>
                <button
                  onClick={() => setSelectedCollection(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Icon name="X" size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>ID:</strong> {selectedCollection.id}</p>
                    <p><strong>Theater:</strong> {selectedCollection.theater}</p>
                    <p><strong>Movie:</strong> {selectedCollection.movie}</p>
                    <p><strong>Date:</strong> {selectedCollection.date}</p>
                  </div>
                  <div>
                    <p><strong>Total:</strong> ₹{selectedCollection.totalCollection.toLocaleString()}</p>
                    <p><strong>Net:</strong> ₹{selectedCollection.netCollection.toLocaleString()}</p>
                    <p><strong>Status:</strong> {selectedCollection.status}</p>
                    <p><strong>Submitted:</strong> {new Date(selectedCollection.submittedAt).toLocaleString()}</p>
                  </div>
                </div>
                
                {selectedCollection.notes && (
                  <div className="bg-muted/30 p-3 rounded">
                    <strong>Notes:</strong> {selectedCollection.notes}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionDataManagement;
