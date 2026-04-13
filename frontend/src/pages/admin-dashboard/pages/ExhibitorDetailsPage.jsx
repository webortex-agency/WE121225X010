import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RoleBasedNavigation from '../../../components/ui/RoleBasedNavigation';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { getExhibitorById, getAllCollections, getLedgerByExhibitor, exportLedgerCSV, removeAssignment, resetUserPassword } from '../../../utils/api';

const fmt = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);

const ExhibitorDetailsPage = () => {
  const { exhibitor_id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [collections, setCollections] = useState([]);
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [detailRes, colRes] = await Promise.allSettled([
        getExhibitorById(exhibitor_id),
        getAllCollections({ exhibitor_id, limit: 50 }),
      ]);

      if (detailRes.status === 'fulfilled') {
        setData(detailRes.value);
        if (detailRes.value?.ledger) {
          const { getLedgerByExhibitor: getLedger } = await import('../../../utils/api');
          // ledger data already in detailRes
        }
      } else {
        setError('Exhibitor not found');
      }

      if (colRes.status === 'fulfilled') {
        setCollections(colRes.value.collections || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load exhibitor details');
    } finally {
      setLoading(false);
    }
  }, [exhibitor_id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleRemoveAssignment = async (assignmentId) => {
    if (!confirm('Remove this movie assignment?')) return;
    setActionLoading(assignmentId);
    try {
      await removeAssignment(assignmentId);
      await fetchAll();
    } catch (err) {
      alert('Failed: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleExportLedger = async () => {
    try {
      const exhibitorObjId = data?.exhibitor?._id;
      if (!exhibitorObjId) return;
      await exportLedgerCSV(exhibitorObjId);
    } catch (err) {
      alert('Export failed: ' + err.message);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'User' },
    { id: 'movies', label: 'Assigned Movies', icon: 'Film' },
    { id: 'collections', label: 'Collections', icon: 'IndianRupee' },
    { id: 'ledger', label: 'Ledger', icon: 'BookOpen' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Icon name="Loader2" size={40} className="animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Icon name="AlertCircle" size={48} className="mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Exhibitor Not Found</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => navigate('/admin/exhibitors')}>Back to Exhibitors</Button>
        </div>
      </div>
    );
  }

  const { exhibitor, collectionStats, ledger, assignments } = data;
  const statusColor = exhibitor.status === 'active'
    ? 'bg-green-100 text-green-800 border-green-200'
    : 'bg-gray-100 text-gray-800 border-gray-200';

  return (
    <div className="min-h-screen bg-background">
      <RoleBasedNavigation userRole="admin" />

      <div className="main-content with-toolbar">
        <div className="content-container">
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <Button variant="outline" onClick={() => navigate('/admin/exhibitors')} iconName="ArrowLeft" iconPosition="left">
                Back
              </Button>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-foreground">{exhibitor.name}</h1>
                  <span className={`px-2 py-1 text-xs font-medium rounded border ${statusColor}`}>
                    {exhibitor.status}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">{exhibitor.exhibitor_id}</span>
                </div>
                <p className="text-muted-foreground">{exhibitor.theater_location}</p>
              </div>
              <Button variant="outline" onClick={handleExportLedger} iconName="Download" iconPosition="left">
                Export Ledger CSV
              </Button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="border-b border-border overflow-x-auto">
              <div className="flex">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
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

            <div className="p-6">
              {/* ── Overview ─────────────────────────────────────── */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-foreground">Contact Details</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Name:</span>
                          <span className="font-medium">{exhibitor.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Email:</span>
                          <a href={`mailto:${exhibitor.email}`} className="text-primary">{exhibitor.email}</a>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Contact:</span>
                          <span>{exhibitor.contact || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Login Email:</span>
                          <code className="text-xs bg-muted px-1 rounded">{exhibitor.login_credentials?.email}</code>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Member Since:</span>
                          <span>{exhibitor.createdAt ? new Date(exhibitor.createdAt).toLocaleDateString('en-IN') : 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold text-foreground">Collection Summary</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: 'Total Submissions', value: collectionStats.total, color: 'text-blue-600' },
                          { label: 'Approved', value: collectionStats.approved, color: 'text-green-600' },
                          { label: 'Pending', value: collectionStats.pending, color: 'text-amber-600' },
                          { label: 'Rejected', value: collectionStats.rejected, color: 'text-red-600' },
                        ].map((s) => (
                          <div key={s.label} className="bg-muted/30 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground">{s.label}</p>
                            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                          </div>
                        ))}
                      </div>
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground">Total Revenue Credited</p>
                        <p className="text-2xl font-bold text-primary">{fmt(collectionStats.totalRevenue)}</p>
                        {ledger && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Current Ledger Balance: <strong className="text-foreground">{fmt(ledger.current_balance)}</strong>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Assigned Movies ──────────────────────────────── */}
              {activeTab === 'movies' && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Active Movie Assignments ({assignments?.length || 0})</h3>
                  {!assignments?.length ? (
                    <div className="text-center py-10 text-muted-foreground">
                      <Icon name="Film" size={40} className="mx-auto mb-3 opacity-40" />
                      <p>No movies assigned to this exhibitor.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {assignments.map((a) => (
                        <div key={a._id} className="bg-muted/30 border border-border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-foreground">{a.movie_id?.title || a.movie_id}</p>
                              <p className="text-xs text-muted-foreground font-mono">{a.movie_id?.movie_id}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Assigned: {new Date(a.assigned_date).toLocaleDateString('en-IN')}
                              </p>
                            </div>
                            <button
                              onClick={() => handleRemoveAssignment(a._id)}
                              disabled={actionLoading === a._id}
                              className="text-xs text-red-600 hover:text-red-700 border border-red-200 px-2 py-1 rounded disabled:opacity-50"
                            >
                              {actionLoading === a._id ? <Icon name="Loader2" size={12} className="animate-spin" /> : 'Remove'}
                            </button>
                          </div>
                          <span className={`mt-2 inline-block text-xs px-2 py-0.5 rounded border ${
                            a.movie_id?.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600 border-gray-200'
                          }`}>
                            {a.movie_id?.status || 'unknown'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── Collections ──────────────────────────────────── */}
              {activeTab === 'collections' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">Collection History ({collections.length})</h3>
                  </div>
                  {!collections.length ? (
                    <div className="text-center py-10 text-muted-foreground">
                      <Icon name="FileX" size={40} className="mx-auto mb-3 opacity-40" />
                      <p>No collections submitted yet.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="px-4 py-2 text-left text-xs font-semibold text-foreground">Date</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-foreground">Movie</th>
                            <th className="px-4 py-2 text-right text-xs font-semibold text-foreground">Gross (₹)</th>
                            <th className="px-4 py-2 text-right text-xs font-semibold text-foreground">Net (₹)</th>
                            <th className="px-4 py-2 text-center text-xs font-semibold text-foreground">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {collections.map((c) => (
                            <tr key={c._id} className="hover:bg-muted/20">
                              <td className="px-4 py-2">{c.date ? new Date(c.date).toLocaleDateString('en-IN') : ''}</td>
                              <td className="px-4 py-2 font-mono text-xs">{c.movie_id}</td>
                              <td className="px-4 py-2 text-right">{(c.totals?.collection || 0).toLocaleString('en-IN')}</td>
                              <td className="px-4 py-2 text-right font-semibold">{(c.net_collection || 0).toLocaleString('en-IN')}</td>
                              <td className="px-4 py-2 text-center">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  c.status === 'approved' ? 'bg-green-100 text-green-700' :
                                  c.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                  'bg-amber-100 text-amber-700'
                                }`}>
                                  {c.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ── Ledger ───────────────────────────────────────── */}
              {activeTab === 'ledger' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">Ledger Account</h3>
                    <button onClick={handleExportLedger} className="flex items-center gap-1.5 text-sm border border-border px-3 py-1.5 rounded-md hover:bg-muted">
                      <Icon name="Download" size={14} />
                      Export CSV
                    </button>
                  </div>

                  {!ledger ? (
                    <div className="text-center py-10 text-muted-foreground">
                      <Icon name="BookOpen" size={40} className="mx-auto mb-3 opacity-40" />
                      <p>Ledger will be created when the first collection is approved.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { label: 'Ledger Name', value: ledger.ledger_name },
                          { label: 'Current Balance', value: fmt(ledger.current_balance) },
                          { label: 'Opening Balance', value: fmt(ledger.starting_balance) },
                          { label: 'Last Entry', value: ledger.last_entry_date ? new Date(ledger.last_entry_date).toLocaleDateString('en-IN') : 'N/A' },
                        ].map((s) => (
                          <div key={s.label} className="bg-muted/30 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground">{s.label}</p>
                            <p className="font-semibold text-foreground text-sm mt-1">{s.value}</p>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Use "Export CSV" above for full entry-by-entry ledger history.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExhibitorDetailsPage;
