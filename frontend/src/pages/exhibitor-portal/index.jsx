import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import RoleBasedNavigation from '../../components/ui/RoleBasedNavigation';
import QuickActionToolbar from '../../components/ui/QuickActionToolbar';
import SearchInterface from '../../components/ui/SearchInterface';
import StatusIndicatorPanel from '../../components/ui/StatusIndicatorPanel';
import CollectionForm from './components/CollectionForm';
import SubmissionHistory from './components/SubmissionHistory';
import AssignedMoviesPanel from './components/AssignedMoviesPanel';
import LedgerSummary from './components/LedgerSummary';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const ExhibitorPortal = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('submit');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const assignedMovies = [
  {
    id: 1,
    movieId: 'MOV-2023-001',
    title: 'Pathaan',
    poster: "https://img.rocket.new/generatedImages/rocket_gen_img_1435ef291-1764821685582.png",
    posterAlt: 'Action thriller movie poster featuring dramatic lighting with protagonist in tactical gear against urban skyline backdrop',
    releaseDate: '2023-01-25',
    endDate: '2024-03-15',
    language: 'Hindi',
    duration: 146,
    genre: 'Action'
  },
  {
    id: 2,
    movieId: 'MOV-2023-002',
    title: 'Jawan',
    poster: "https://img.rocket.new/generatedImages/rocket_gen_img_1b354dba1-1764677120254.png",
    posterAlt: 'Action drama movie poster showing intense close-up of lead actor with determined expression in dramatic red and black color scheme',
    releaseDate: '2023-09-07',
    endDate: '2024-02-28',
    language: 'Hindi',
    duration: 169,
    genre: 'Action Drama'
  },
  {
    id: 3,
    movieId: 'MOV-2023-003',
    title: 'Dunki',
    poster: "https://img.rocket.new/generatedImages/rocket_gen_img_10887ed34-1764742196294.png",
    posterAlt: 'Comedy drama movie poster with warm golden tones featuring ensemble cast in cheerful poses against scenic landscape background',
    releaseDate: '2023-12-21',
    endDate: '2024-04-30',
    language: 'Hindi',
    duration: 161,
    genre: 'Comedy Drama'
  }];


  const submissions = [
  {
    id: 1,
    collectionDate: '2023-12-10',
    movieTitle: 'Pathaan',
    movieId: 'MOV-2023-001',
    totalShows: 4,
    totalTickets: 850,
    grossCollection: 127500,
    acCharges: 4250,
    netCollection: 123250,
    status: 'approved',
    submittedAt: '2023-12-10T18:30:00',
    approvedAt: '2023-12-11T10:15:00'
  },
  {
    id: 2,
    collectionDate: '2023-12-11',
    movieTitle: 'Jawan',
    movieId: 'MOV-2023-002',
    totalShows: 4,
    totalTickets: 920,
    grossCollection: 138000,
    acCharges: 4600,
    netCollection: 133400,
    status: 'pending',
    submittedAt: '2023-12-11T19:00:00'
  },
  {
    id: 3,
    collectionDate: '2023-12-09',
    movieTitle: 'Dunki',
    movieId: 'MOV-2023-003',
    totalShows: 3,
    totalTickets: 650,
    grossCollection: 97500,
    acCharges: 3250,
    netCollection: 94250,
    status: 'rejected',
    submittedAt: '2023-12-09T20:00:00',
    rejectedAt: '2023-12-10T11:30:00',
    rejectionReason: 'Mismatch in ticket count. Please verify and resubmit.'
  },
  {
    id: 4,
    collectionDate: '2023-12-12',
    movieTitle: 'Pathaan',
    movieId: 'MOV-2023-001',
    totalShows: 2,
    totalTickets: 450,
    grossCollection: 67500,
    acCharges: 2250,
    netCollection: 65250,
    status: 'draft',
    submittedAt: '2023-12-12T15:45:00'
  }];


  const ledgerData = {
    totalCredits: 1250000,
    creditCount: 45,
    totalDebits: 800000,
    debitCount: 32,
    currentBalance: 450000,
    recentTransactions: [
    {
      id: 1,
      date: '2023-12-11',
      description: 'Collection Approved - Pathaan',
      type: 'credit',
      amount: 123250,
      runningBalance: 450000
    },
    {
      id: 2,
      date: '2023-12-10',
      description: 'Settlement Payment',
      type: 'debit',
      amount: 150000,
      runningBalance: 326750
    },
    {
      id: 3,
      date: '2023-12-09',
      description: 'Collection Approved - Jawan',
      type: 'credit',
      amount: 145000,
      runningBalance: 476750
    },
    {
      id: 4,
      date: '2023-12-08',
      description: 'AC Charges Deduction',
      type: 'debit',
      amount: 5500,
      runningBalance: 331750
    },
    {
      id: 5,
      date: '2023-12-07',
      description: 'Collection Approved - Dunki',
      type: 'credit',
      amount: 98000,
      runningBalance: 337250
    }]

  };

  useEffect(() => {
    if (!userInfo || userInfo.user?.role !== 'exhibitor') {
      navigate('/');
    }
  }, [navigate, userInfo]);

  const handleSubmitCollection = (collectionData) => {
    console.log('Submitting collection:', collectionData);
    setSuccessMessage('Collection submitted successfully! Awaiting admin approval.');
    setShowSuccessModal(true);
    setTimeout(() => {
      setShowSuccessModal(false);
      setActiveTab('history');
    }, 2000);
  };

  const handleSaveDraft = (draftData) => {
    console.log('Saving draft:', draftData);
    setSuccessMessage('Draft saved successfully! You can continue editing later.');
    setShowSuccessModal(true);
    setTimeout(() => {
      setShowSuccessModal(false);
    }, 2000);
  };

  const handleEditSubmission = (submission) => {
    console.log('Editing submission:', submission);
    setActiveTab('submit');
  };

  const handleViewSubmission = (submission) => {
    console.log('Viewing submission:', submission);
  };

  const handleViewLedgerDetails = () => {
    console.log('Navigating to full ledger view');
  };

  const tabs = [
  { id: 'submit', label: 'Submit Collection', icon: 'FileText' },
  { id: 'history', label: 'Submission History', icon: 'History' },
  { id: 'movies', label: 'Assigned Movies', icon: 'Film' },
  { id: 'ledger', label: 'Ledger Summary', icon: 'BookOpen' }];


  return (
    <div className="min-h-screen bg-background">
      <RoleBasedNavigation userRole="exhibitor" />
      <QuickActionToolbar userRole="exhibitor" />
      <div className="main-content with-toolbar">
        <div className="content-container">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-semibold text-foreground mb-2">Exhibitor Portal</h1>
                <p className="text-muted-foreground">
                  Manage your daily collections and track financial submissions
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden lg:block w-80">
                  <SearchInterface userRole="exhibitor" />
                </div>
                <Button variant="outline" onClick={() => navigate('/admin-dashboard')}>
                  <Icon name="LayoutDashboard" size={16} className="mr-2" />
                  Dashboard
                </Button>
              </div>
            </div>

            <StatusIndicatorPanel userRole="exhibitor" />
          </div>

          <div className="bg-card rounded-lg border border-border mb-6">
            <div className="border-b border-border overflow-x-auto">
              <div className="flex items-center gap-2 p-2">
                {tabs?.map((tab) =>
                <button
                  key={tab?.id}
                  onClick={() => setActiveTab(tab?.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab?.id ?
                  'bg-primary text-primary-foreground' :
                  'text-muted-foreground hover:bg-muted hover:text-foreground'}`
                  }>

                    <Icon name={tab?.icon} size={16} />
                    {tab?.label}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {activeTab === 'submit' &&
            <CollectionForm
              onSubmit={handleSubmitCollection}
              onSaveDraft={handleSaveDraft}
              assignedMovies={assignedMovies} />

            }

            {activeTab === 'history' &&
            <SubmissionHistory
              submissions={submissions}
              onEdit={handleEditSubmission}
              onView={handleViewSubmission} />

            }

            {activeTab === 'movies' &&
            <AssignedMoviesPanel movies={assignedMovies} />
            }

            {activeTab === 'ledger' &&
            <LedgerSummary
              ledgerData={ledgerData}
              onViewDetails={handleViewLedgerDetails} />

            }
          </div>
        </div>
      </div>
      {showSuccessModal &&
      <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4 shadow-lg animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                <Icon name="CheckCircle2" size={24} className="text-success" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Success!</h3>
                <p className="text-sm text-muted-foreground">{successMessage}</p>
              </div>
            </div>
          </div>
        </div>
      }
    </div>);

};

export default ExhibitorPortal;