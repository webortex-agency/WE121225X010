import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import RoleBasedNavigation from '../../../components/ui/RoleBasedNavigation';
import QuickActionToolbar from '../../../components/ui/QuickActionToolbar';
import SearchInterface from '../../../components/ui/SearchInterface';
import StatusIndicatorPanel from '../../../components/ui/StatusIndicatorPanel';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import ExhibitorCard from '../components/ExhibitorCard';
import ExhibitorFormModal from '../components/ExhibitorFormModal';
import ConfirmDeleteDialog from '../components/ConfirmDeleteDialog';
import {
  selectFilteredExhibitors,
  selectExhibitorsLoading,
  selectExhibitorsFilter,
  setFilter,
  deleteExhibitorThunk,
  fetchExhibitors
} from '../../../store/exhibitorsSlice';

const ExhibitorsManagement = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const exhibitors = useSelector(selectFilteredExhibitors);
  const loading = useSelector(selectExhibitorsLoading);
  const filter = useSelector(selectExhibitorsFilter);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExhibitor, setEditingExhibitor] = useState(null);
  const [deletingExhibitor, setDeletingExhibitor] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // 3x3 grid

  // Load exhibitors from backend on mount
  useEffect(() => {
    dispatch(fetchExhibitors());
  }, [dispatch]);

  // Calculate pagination
  const totalPages = Math.ceil(exhibitors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedExhibitors = exhibitors.slice(startIndex, startIndex + itemsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const handleFilterChange = (newFilter) => {
    dispatch(setFilter(newFilter));
  };

  const handleStatusFilter = (status) => {
    handleFilterChange({ status });
  };

  const handleSearch = (search) => {
    handleFilterChange({ search });
  };

  const handleAddExhibitor = () => {
    setEditingExhibitor(null);
    setShowAddModal(true);
  };

  const handleEditExhibitor = (exhibitor) => {
    setEditingExhibitor(exhibitor);
    setShowAddModal(true);
  };

  const handleDeleteExhibitor = (exhibitor) => {
    setDeletingExhibitor(exhibitor);
  };

  const handleConfirmDelete = async () => {
    if (deletingExhibitor) {
      await dispatch(deleteExhibitorThunk(deletingExhibitor._id || deletingExhibitor.id));
      setDeletingExhibitor(null);
    }
  };

  const handleViewDetails = (exhibitorId) => {
    navigate(`/admin/exhibitors/${exhibitorId}`);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingExhibitor(null);
  };

  const handleCloseDeleteDialog = () => {
    setDeletingExhibitor(null);
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' }
  ];

  const sortOptions = [
    { value: 'recent', label: 'Recently Added' },
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'collections', label: 'Collections (High to Low)' },
    { value: 'location', label: 'Location' }
  ];

  const getSortedExhibitors = (exhibitors, sortBy) => {
    const sorted = [...exhibitors];
    switch (sortBy) {
      case 'name':
        return sorted.sort((a, b) => a.exhibitorName.localeCompare(b.exhibitorName));
      case 'collections':
        return sorted.sort((a, b) => b.totalCollections - a.totalCollections);
      case 'location':
        return sorted.sort((a, b) => a.location.localeCompare(b.location));
      case 'recent':
      default:
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading exhibitors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <RoleBasedNavigation userRole="admin" />
      {/* <QuickActionToolbar userRole="admin" /> */}
      
      <div className="main-content with-toolbar">
        <div className="content-container">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Exhibitors Management</h1>
                <p className="text-muted-foreground">Manage Theater Networks and Add New Exhibitors</p>
              </div>
              <Button
                onClick={handleAddExhibitor}
                iconName="Plus"
                iconPosition="left"
                className="bg-primary hover:bg-primary/80"
              >
                Add New Exhibitor
              </Button>
            </div>

            <StatusIndicatorPanel userRole="admin" />
          </div>

          {/* Filters and Controls */}
          <div className="bg-card border border-border rounded-lg p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4">
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleStatusFilter(option.value)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      filter.status === option.value
                        ? 'bg-primary text-white'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-4">
                {/* Sort Dropdown */}
                <select
                  className="px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground"
                  value={filter.sort || 'recent'}
                  onChange={(e) => handleFilterChange({ sort: e.target.value })}
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                {/* Search */}
                <div className="w-64">
                  <SearchInterface 
                    userRole="admin"
                    placeholder="Search exhibitors..."
                    onSearch={handleSearch}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Exhibitors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {paginatedExhibitors.map((exhibitor) => (
              <ExhibitorCard
                key={exhibitor.id}
                exhibitor={exhibitor}
                onEdit={handleEditExhibitor}
                onDelete={handleDeleteExhibitor}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>

          {/* Empty State */}
          {paginatedExhibitors.length === 0 && (
            <div className="text-center py-12">
              <Icon name="Building2" size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium text-foreground mb-2">No exhibitors found</h3>
              <p className="text-muted-foreground mb-4">
                {exhibitors.length === 0 
                  ? "Get started by adding your first exhibitor"
                  : "Try adjusting your filters to see more results"
                }
              </p>
              {exhibitors.length === 0 && (
                <Button onClick={handleAddExhibitor} iconName="Plus" iconPosition="left">
                  Add New Exhibitor
                </Button>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, exhibitors.length)} of {exhibitors.length} exhibitors
              </p>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  iconName="ChevronLeft"
                >
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                        currentPage === page
                          ? 'bg-primary text-white'
                          : 'text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  iconName="ChevronRight"
                  iconPosition="right"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Exhibitor Modal */}
      {showAddModal && (
        <ExhibitorFormModal
          exhibitor={editingExhibitor}
          onClose={handleCloseModal}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deletingExhibitor && (
        <ConfirmDeleteDialog
          exhibitor={deletingExhibitor}
          onConfirm={handleConfirmDelete}
          onClose={handleCloseDeleteDialog}
        />
      )}
    </div>
  );
};

export default ExhibitorsManagement;
