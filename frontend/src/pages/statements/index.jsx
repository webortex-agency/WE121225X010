import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleBasedNavigation from '../../components/ui/RoleBasedNavigation';
import QuickActionToolbar from '../../components/ui/QuickActionToolbar';
import SearchInterface from '../../components/ui/SearchInterface';
import StatusIndicatorPanel from '../../components/ui/StatusIndicatorPanel';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { listStatements, downloadStatementPDF } from '../../utils/api';

const StatementsPage = () => {
  const navigate = useNavigate();
  const [statements, setStatements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    document.title = 'Statements - Movie Distribution Dashboard';
    fetchStatements();
  }, []);

  const fetchStatements = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listStatements();
      setStatements(data.statements || data || []);
    } catch (err) {
      setError('Failed to load statements. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (statement) => {
    setDownloadingId(statement._id || statement.id);
    try {
      await downloadStatementPDF(
        statement._id || statement.id,
        `statement-${statement.movie_id || 'export'}.pdf`
      );
    } catch {
      // silent — browser may block pop-ups, user can retry
    } finally {
      setDownloadingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      draft: 'bg-gray-100 text-gray-700 border-gray-200',
      generated: 'bg-blue-100 text-blue-700 border-blue-200',
      approved: 'bg-green-100 text-green-700 border-green-200',
      rejected: 'bg-red-100 text-red-700 border-red-200',
    };
    return map[status] || map.draft;
  };

  const formatCurrency = (amount) =>
    amount != null ? `₹${Number(amount).toLocaleString('en-IN')}` : '—';

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <RoleBasedNavigation userRole="admin" />
      <QuickActionToolbar />
      <SearchInterface />
      <StatusIndicatorPanel />

      <main className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Closing Statements</h1>
            <p className="text-sm text-muted-foreground mt-1">
              View and download all generated closing statements
            </p>
          </div>
          <Button
            variant="default"
            onClick={() => navigate('/closing-statement-generation')}
            className="flex items-center gap-2"
          >
            <Icon name="Plus" size={16} />
            Generate Statement
          </Button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24 text-muted-foreground">
            <Icon name="Loader2" size={24} className="animate-spin mr-3" />
            Loading statements…
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Icon name="AlertCircle" size={40} className="text-red-400" />
            <p className="text-muted-foreground">{error}</p>
            <Button variant="outline" onClick={fetchStatements}>
              Retry
            </Button>
          </div>
        ) : statements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <Icon name="FileText" size={48} className="text-muted-foreground/40" />
            <div>
              <p className="font-medium text-foreground">No statements yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Generate your first closing statement to see it here.
              </p>
            </div>
            <Button
              variant="default"
              onClick={() => navigate('/closing-statement-generation')}
            >
              Generate Statement
            </Button>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/30 border-b border-border">
                  <tr>
                    <th className="text-left p-4 font-medium text-foreground">Movie</th>
                    <th className="text-left p-4 font-medium text-foreground">Exhibitor</th>
                    <th className="text-left p-4 font-medium text-foreground">Period</th>
                    <th className="text-right p-4 font-medium text-foreground">Gross</th>
                    <th className="text-right p-4 font-medium text-foreground">Net</th>
                    <th className="text-center p-4 font-medium text-foreground">Status</th>
                    <th className="text-center p-4 font-medium text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {statements.map((stmt, idx) => {
                    const id = stmt._id || stmt.id;
                    const isDownloading = downloadingId === id;
                    return (
                      <tr
                        key={id || idx}
                        className="border-t border-border hover:bg-muted/10 transition-colors"
                      >
                        <td className="p-4 font-medium text-foreground">
                          {stmt.movie_name || stmt.movie_id || '—'}
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {stmt.exhibitor_name || stmt.theater_name || '—'}
                        </td>
                        <td className="p-4 text-muted-foreground whitespace-nowrap">
                          {formatDate(stmt.start_date)} – {formatDate(stmt.end_date)}
                        </td>
                        <td className="p-4 text-right text-foreground">
                          {formatCurrency(stmt.total_gross || stmt.gross_collection)}
                        </td>
                        <td className="p-4 text-right font-medium text-foreground">
                          {formatCurrency(stmt.total_net || stmt.net_collection)}
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${getStatusBadge(stmt.status)}`}
                          >
                            {stmt.status || 'draft'}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(stmt)}
                            disabled={isDownloading}
                            title="Download PDF"
                          >
                            {isDownloading ? (
                              <Icon name="Loader2" size={16} className="animate-spin" />
                            ) : (
                              <Icon name="Download" size={16} />
                            )}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StatementsPage;
