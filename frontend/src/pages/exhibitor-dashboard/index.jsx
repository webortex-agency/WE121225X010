import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import './styles/responsive.css';
import { 
  selectTermsAndConditionsAccepted,
  selectTourCompleted,
  setSelectedWeek,
  getCurrentWeek,
  loadSchedule,
  loadUserPreferences
} from '../../store/exhibitorScheduleSlice';
import { autoInitializeExhibitor } from '../../utils/initializeExhibitorData';
import RoleBasedNavigation from '../../components/ui/RoleBasedNavigation';
import TermsAndConditionsModal from './components/TermsAndConditionsModal';
import DashboardTour from './components/DashboardTour';
import MovieListSidebar from './components/MovieListSidebar';
import SchedulingGrid from './components/SchedulingGrid';
import ShowDetailsPanel from './components/ShowDetailsPanel';
import ScheduleSummary from './components/ScheduleSummary';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const ExhibitorDashboard = () => {
  const dispatch = useDispatch();
  const termsAccepted = useSelector(selectTermsAndConditionsAccepted);
  const tourCompleted = useSelector(selectTourCompleted);
  
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [selectedShow, setSelectedShow] = useState(null);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);

  // Initialize data and check onboarding status
  useEffect(() => {
    // Initialize exhibitor data
    autoInitializeExhibitor();
    
    // Load user preferences and schedule
    dispatch(loadUserPreferences());
    dispatch(loadSchedule());
    
    // Set current week if not set
    const currentWeek = getCurrentWeek();
    dispatch(setSelectedWeek(currentWeek));

    // Check if we need to show T&C modal
    if (!termsAccepted) {
      setShowTermsModal(true);
    }
  }, [dispatch, termsAccepted]);

  // Start tour after T&C acceptance
  useEffect(() => {
    if (termsAccepted && !tourCompleted && !showTermsModal) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        setShowTour(true);
      }, 500);
    }
  }, [termsAccepted, tourCompleted, showTermsModal]);

  const handleTermsAccept = () => {
    setShowTermsModal(false);
    // Tour will start automatically via useEffect
  };

  const handleTermsDecline = () => {
    setShowTermsModal(false);
    // User will be logged out via the modal component
  };

  const handleTourComplete = () => {
    setShowTour(false);
  };

  const handleShowClick = (showDetails) => {
    setSelectedShow(showDetails);
    setShowDetailsPanel(true);
  };

  const handleCloseDetailsPanel = () => {
    setShowDetailsPanel(false);
    setSelectedShow(null);
  };

  const handleSaveSchedule = () => {
    // This would typically save to backend, but for now we'll use localStorage
    dispatch(loadSchedule()); // This actually saves to localStorage in our implementation
    // Show success notification
    if (window.toast) {
      window.toast.success('Schedule saved successfully!');
    }
  };

  const handleClearWeek = () => {
    if (window.confirm('Are you sure you want to clear all shows for this week? This action cannot be undone.')) {
      // Implementation would go here
      console.log('Clear week functionality to be implemented');
    }
  };

  const handleCopyFromPreviousWeek = () => {
    if (window.confirm('This will copy all shows from the previous week. Continue?')) {
      // Implementation would go here
      console.log('Copy from previous week functionality to be implemented');
    }
  };

  // Show loading state while checking T&C status
  if (termsAccepted === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="mx-auto text-teal-600 animate-spin mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Loading Dashboard</h2>
          <p className="text-muted-foreground">Please wait while we prepare your exhibitor portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <RoleBasedNavigation userRole="exhibitor" />

      {/* Main Content */}
      <div className="exhibitor-dashboard flex flex-col lg:flex-row min-h-[calc(100vh-80px)] my-10 pt-8"> {/* Changed to flex-col with more padding */}
        {/* Left Sidebar - Movie List */}
        <MovieListSidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Header with Actions */}
          <div className="bg-card border-b border-border p-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="tour-welcome">
                <h1 className="text-xl lg:text-2xl font-bold text-foreground">Movie Scheduling Dashboard</h1>
                <p className="text-sm lg:text-base text-muted-foreground">
                  Drag movies from the sidebar to schedule shows for your cinema
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 lg:gap-3 w-full lg:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearWeek}
                  className="text-red-600 hover:text-red-700 hover:border-red-300 flex-1 lg:flex-none"
                >
                  <Icon name="Trash2" size={16} className="mr-1 lg:mr-2" />
                  <span className="hidden sm:inline">Clear Week</span>
                  <span className="sm:hidden">Clear</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyFromPreviousWeek}
                  className="flex-1 lg:flex-none"
                >
                  <Icon name="Copy" size={16} className="mr-1 lg:mr-2" />
                  <span className="hidden sm:inline">Copy Previous Week</span>
                  <span className="sm:hidden">Copy</span>
                </Button>

                <Button
                  onClick={handleSaveSchedule}
                  className="bg-teal-600 hover:bg-teal-700 flex-1 lg:flex-none"
                  size="sm"
                >
                  <Icon name="Save" size={16} className="mr-1 lg:mr-2" />
                  Save
                </Button>
              </div>
            </div>
          </div>

          {/* Scheduling Grid - Full Width */}
          <div className="flex-1 w-full">
            <SchedulingGrid onShowClick={handleShowClick} />
          </div>
        </div>
      </div>

      {/* Weekly Summary Section - Separate Section Below */}
      <div className="bg-muted/10 border-t border-border container mx-auto px-6 py-6 justify-center justify-items-center text-center">
        <div className="container mx-auto px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Weekly Summary */}
            <div className="lg:col-span-2 xl:col-span-2 w-full justify-center justify-items-center text-center">
              <ScheduleSummary />
            </div>
            
            {/* Quick Actions */}
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-foreground mb-3">Quick Links</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => window.location.href = '/exhibitor/collections'}
                  >
                    <Icon name="FileText" size={16} className="mr-2" />
                    Submit Collections
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => window.location.href = '/exhibitor/ledger'}
                  >
                    <Icon name="BookOpen" size={16} className="mr-2" />
                    View Ledger
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => window.location.href = '/exhibitor/profile'}
                  >
                    <Icon name="Settings" size={16} className="mr-2" />
                    Profile Settings
                  </Button>
                </div>
              </div>

              {/* Help Section */}
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="HelpCircle" size={16} className="text-teal-600" />
                  <h4 className="font-medium text-teal-800">Need Help?</h4>
                </div>
                <p className="text-sm text-teal-700 mb-3">
                  New to the dashboard? Take a quick tour to learn the features.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTour(true)}
                  className="w-full border-teal-300 text-teal-700 hover:bg-teal-100"
                >
                  <Icon name="Play" size={16} className="mr-2" />
                  Start Tour
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Quick Actions Bar - Keep for mobile */}
      <div className="lg:hidden bg-card border-t border-border p-4">
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex flex-col items-center gap-1 h-auto py-2"
            onClick={() => window.location.href = '/exhibitor/collections'}
          >
            <Icon name="FileText" size={16} />
            <span className="text-xs">Collections</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="flex flex-col items-center gap-1 h-auto py-2"
            onClick={() => window.location.href = '/exhibitor/ledger'}
          >
            <Icon name="BookOpen" size={16} />
            <span className="text-xs">Ledger</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="flex flex-col items-center gap-1 h-auto py-2"
            onClick={() => window.location.href = '/exhibitor/profile'}
          >
            <Icon name="Settings" size={16} />
            <span className="text-xs">Profile</span>
          </Button>
        </div>
      </div>


      {/* Modals and Overlays */}
      <TermsAndConditionsModal
        isOpen={showTermsModal}
        onAccept={handleTermsAccept}
        onDecline={handleTermsDecline}
      />

      <DashboardTour
        isActive={showTour}
        onTourComplete={handleTourComplete}
      />

      <ShowDetailsPanel
        isOpen={showDetailsPanel}
        onClose={handleCloseDetailsPanel}
        showDetails={selectedShow}
      />
    </div>
  );
};

export default ExhibitorDashboard;
