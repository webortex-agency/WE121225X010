import { useState, useEffect, useCallback } from 'react';
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
import { submitCollection, getMyCollections, getMyLedger, getMovies } from '../../utils/api';

const ExhibitorPortal = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('submit');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Real data state
  const [assignedMovies, setAssignedMovies] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [ledgerData, setLedgerData] = useState(null);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [loadingLedger, setLoadingLedger] = useState(false);
  const [loadingMovies, setLoadingMovies] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (!userInfo || userInfo.user?.role !== 'exhibitor') {
      navigate('/');
    }
  }, [navigate, userInfo]);

  // Fetch assigned movies via all active movies + assignments (or just all movies for now)
  const fetchAssignedMovies = useCallback(async () => {
    setLoadingMovies(true);
    try {
      const movies = await getMovies();
      const active = movies.filter((m) => m.status === 'active');
      // Map to shape the CollectionForm expects
      const mapped = active.map((m) => ({
        id: m._id,
        movieId: m.movie_id,
        title: m.title,
        releaseDate: m.release_date ? new Date(m.release_date).toLocaleDateString('en-IN') : '',
        language: m.language || 'Hindi',
        duration: m.duration || 0,
        genre: m.genre || '',
        poster: m.poster || null,
      }));
      setAssignedMovies(mapped);
    } catch (err) {
      console.error('Failed to load movies:', err);
    } finally {
      setLoadingMovies(false);
    }
  }, []);

  const fetchSubmissions = useCallback(async () => {
    setLoadingSubmissions(true);
    try {
      const data = await getMyCollections({ limit: 50 });
      const mapped = (data.collections || []).map((c) => ({
        id: c._id,
        collectionDate: c.date ? new Date(c.date).toISOString().split('T')[0] : '',
        movieTitle: c.movie_id,
        movieId: c.movie_id,
        totalShows: c.totals?.total_shows || 0,
        totalTickets: 0,
        grossCollection: c.totals?.collection || 0,
        acCharges: 0,
        netCollection: c.net_collection || 0,
        status: c.status,
        submittedAt: c.createdAt,
        approvedAt: c.approved_date,
        rejectionReason: c.notes?.includes('Rejection:')
          ? c.notes.split('Rejection:')[1].trim()
          : '',
      }));
      setSubmissions(mapped);
    } catch (err) {
      console.error('Failed to load submissions:', err);
    } finally {
      setLoadingSubmissions(false);
    }
  }, []);

  const fetchLedger = useCallback(async () => {
    setLoadingLedger(true);
    try {
      const data = await getMyLedger();
      if (data.ledger) {
        setLedgerData({
          totalCredits: data.summary.totalCredits,
          creditCount: data.entries.filter((e) => e.credit > 0).length,
          totalDebits: data.summary.totalDebits,
          debitCount: data.entries.filter((e) => e.debit > 0).length,
          currentBalance: data.summary.currentBalance,
          recentTransactions: data.entries.slice(0, 10).map((e) => ({
            id: e._id,
            date: e.date ? new Date(e.date).toISOString().split('T')[0] : '',
            description: e.particulars,
            type: e.credit > 0 ? 'credit' : 'debit',
            amount: e.credit > 0 ? e.credit : e.debit,
            runningBalance: e.balance,
          })),
        });
      } else {
        setLedgerData({ totalCredits: 0, creditCount: 0, totalDebits: 0, debitCount: 0, currentBalance: 0, recentTransactions: [] });
      }
    } catch (err) {
      console.error('Failed to load ledger:', err);
    } finally {
      setLoadingLedger(false);
    }
  }, []);

  useEffect(() => {
    if (userInfo?.user?.role === 'exhibitor') {
      fetchAssignedMovies();
      fetchSubmissions();
      fetchLedger();
    }
  }, [userInfo, fetchAssignedMovies, fetchSubmissions, fetchLedger]);

  const handleSubmitCollection = async (collectionData) => {
    setApiError('');
    try {
      const { formData, calculations } = collectionData;

      const payload = {
        movie_id: formData.movieId,
        date: formData.collectionDate,
        shows: {
          matinee: {
            collection: Number(formData.matineeShows) || 0,
            count: Number(formData.matineeTickets) || 0,
            occupancy: 0,
            ticket_rate: 0,
            ac_charge: 0,
          },
          afternoon: {
            collection: Number(formData.afternoonShows) || 0,
            count: Number(formData.afternoonTickets) || 0,
            occupancy: 0,
            ticket_rate: 0,
            ac_charge: 0,
          },
          first_show: {
            collection: Number(formData.firstShows) || 0,
            count: Number(formData.firstTickets) || 0,
            occupancy: 0,
            ticket_rate: 0,
            ac_charge: 0,
          },
          second_show: {
            collection: Number(formData.secondShows) || 0,
            count: Number(formData.secondTickets) || 0,
            occupancy: 0,
            ticket_rate: 0,
            ac_charge: 0,
          },
        },
        notes: formData.remarks,
      };

      await submitCollection(payload);
      setSuccessMessage('Collection submitted successfully! Awaiting admin approval.');
      setShowSuccessModal(true);
      await fetchSubmissions();
      setTimeout(() => {
        setShowSuccessModal(false);
        setActiveTab('history');
      }, 2000);
    } catch (err) {
      setApiError(err.message || 'Submission failed. Please try again.');
    }
  };

  const handleSaveDraft = (draftData) => {
    // Drafts are stored locally for now
    setSuccessMessage('Draft saved locally! You can continue editing later.');
    setShowSuccessModal(true);
    setTimeout(() => setShowSuccessModal(false), 2000);
  };

  const handleEditSubmission = (submission) => {
    setActiveTab('submit');
  };

  const handleViewSubmission = (submission) => {
    // No-op for now
  };

  const handleViewLedgerDetails = () => {
    navigate('/exhibitor/ledger');
  };

  const tabs = [
    { id: 'submit', label: 'Submit Collection', icon: 'FileText' },
    { id: 'history', label: 'Submission History', icon: 'History' },
    { id: 'movies', label: 'Assigned Movies', icon: 'Film' },
    { id: 'ledger', label: 'Ledger Summary', icon: 'BookOpen' },
  ];

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

          {apiError && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2">
              <Icon name="AlertCircle" size={16} className="text-destructive" />
              <p className="text-sm text-destructive">{apiError}</p>
              <button onClick={() => setApiError('')} className="ml-auto">
                <Icon name="X" size={14} className="text-destructive" />
              </button>
            </div>
          )}

          <div className="bg-card rounded-lg border border-border mb-6">
            <div className="border-b border-border overflow-x-auto">
              <div className="flex items-center gap-2 p-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <Icon name={tab.icon} size={16} />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {activeTab === 'submit' && (
              <CollectionForm
                onSubmit={handleSubmitCollection}
                onSaveDraft={handleSaveDraft}
                assignedMovies={assignedMovies}
              />
            )}

            {activeTab === 'history' && (
              loadingSubmissions ? (
                <div className="flex items-center justify-center py-12">
                  <Icon name="Loader2" size={24} className="animate-spin text-muted-foreground" />
                </div>
              ) : (
                <SubmissionHistory
                  submissions={submissions}
                  onEdit={handleEditSubmission}
                  onView={handleViewSubmission}
                />
              )
            )}

            {activeTab === 'movies' && (
              loadingMovies ? (
                <div className="flex items-center justify-center py-12">
                  <Icon name="Loader2" size={24} className="animate-spin text-muted-foreground" />
                </div>
              ) : (
                <AssignedMoviesPanel movies={assignedMovies} />
              )
            )}

            {activeTab === 'ledger' && (
              loadingLedger ? (
                <div className="flex items-center justify-center py-12">
                  <Icon name="Loader2" size={24} className="animate-spin text-muted-foreground" />
                </div>
              ) : (
                <LedgerSummary
                  ledgerData={ledgerData || { totalCredits: 0, creditCount: 0, totalDebits: 0, debitCount: 0, currentBalance: 0, recentTransactions: [] }}
                  onViewDetails={handleViewLedgerDetails}
                />
              )
            )}
          </div>
        </div>
      </div>

      {showSuccessModal && (
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
      )}
    </div>
  );
};

export default ExhibitorPortal;
