import { useState, useEffect } from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const CollectionForm = ({ onSubmit, onSaveDraft, assignedMovies = [] }) => {
  const [formData, setFormData] = useState({
    movieId: '',
    collectionDate: new Date()?.toISOString()?.split('T')?.[0],
    matineeShows: '',
    matineeTickets: '',
    afternoonShows: '',
    afternoonTickets: '',
    firstShows: '',
    firstTickets: '',
    secondShows: '',
    secondTickets: '',
    remarks: ''
  });

  const [calculations, setCalculations] = useState({
    totalShows: 0,
    totalTickets: 0,
    acCharges: 0,
    grossCollection: 0,
    netCollection: 0
  });

  const [errors, setErrors] = useState({});
  const [isDraft, setIsDraft] = useState(false);

  const AC_CHARGE_PER_TICKET = 5;

  useEffect(() => {
    calculateTotals();
  }, [formData]);

  const calculateTotals = () => {
    const matineeTotal = (parseFloat(formData?.matineeShows) || 0) * (parseFloat(formData?.matineeTickets) || 0);
    const afternoonTotal = (parseFloat(formData?.afternoonShows) || 0) * (parseFloat(formData?.afternoonTickets) || 0);
    const firstTotal = (parseFloat(formData?.firstShows) || 0) * (parseFloat(formData?.firstTickets) || 0);
    const secondTotal = (parseFloat(formData?.secondShows) || 0) * (parseFloat(formData?.secondTickets) || 0);

    const totalShows = (parseFloat(formData?.matineeShows) || 0) + 
                       (parseFloat(formData?.afternoonShows) || 0) + 
                       (parseFloat(formData?.firstShows) || 0) + 
                       (parseFloat(formData?.secondShows) || 0);

    const totalTickets = matineeTotal + afternoonTotal + firstTotal + secondTotal;
    const acCharges = totalTickets * AC_CHARGE_PER_TICKET;
    const grossCollection = totalTickets * 150;
    const netCollection = grossCollection - acCharges;

    setCalculations({
      totalShows,
      totalTickets,
      acCharges,
      grossCollection,
      netCollection
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.movieId) {
      newErrors.movieId = 'Please select a movie';
    }

    if (!formData?.collectionDate) {
      newErrors.collectionDate = 'Collection date is required';
    }

    const hasAnyShowData = formData?.matineeShows || formData?.afternoonShows || 
                           formData?.firstShows || formData?.secondShows;

    if (!hasAnyShowData && !isDraft) {
      newErrors.general = 'Please enter at least one show collection';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    setIsDraft(false);
    
    if (validateForm()) {
      onSubmit({
        ...formData,
        calculations,
        submittedAt: new Date()?.toISOString()
      });
    }
  };

  const handleSaveDraft = () => {
    setIsDraft(true);
    onSaveDraft({
      ...formData,
      calculations,
      savedAt: new Date()?.toISOString()
    });
  };

  const handleReset = () => {
    setFormData({
      movieId: '',
      collectionDate: new Date()?.toISOString()?.split('T')?.[0],
      matineeShows: '',
      matineeTickets: '',
      afternoonShows: '',
      afternoonTickets: '',
      firstShows: '',
      firstTickets: '',
      secondShows: '',
      secondTickets: '',
      remarks: ''
    });
    setErrors({});
  };

  const movieOptions = assignedMovies?.map(movie => ({
    value: movie?.id,
    label: `${movie?.title} (${movie?.movieId})`,
    description: `Released: ${movie?.releaseDate}`
  }));

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon name="FileText" size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Daily Collection Entry</h2>
            <p className="text-sm text-muted-foreground">Submit today's collection details</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleReset}>
          <Icon name="RotateCcw" size={16} className="mr-2" />
          Reset Form
        </Button>
      </div>
      {errors?.general && (
        <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-md flex items-start gap-2">
          <Icon name="AlertCircle" size={18} className="text-error mt-0.5" />
          <p className="text-sm text-error">{errors?.general}</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Select Movie"
            placeholder="Choose a movie"
            required
            options={movieOptions}
            value={formData?.movieId}
            onChange={(value) => handleInputChange('movieId', value)}
            error={errors?.movieId}
            searchable
          />

          <Input
            label="Collection Date"
            type="date"
            required
            value={formData?.collectionDate}
            onChange={(e) => handleInputChange('collectionDate', e?.target?.value)}
            error={errors?.collectionDate}
            max={new Date()?.toISOString()?.split('T')?.[0]}
          />
        </div>

        <div className="border border-border rounded-lg p-4 bg-muted/30">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Icon name="Clock" size={16} />
            Show-wise Collection Details
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Sunrise" size={16} className="text-warning" />
                <span className="text-sm font-medium text-foreground">Matinee Shows</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Collection (₹)"
                  type="number"
                  placeholder="0"
                  value={formData?.matineeShows}
                  onChange={(e) => handleInputChange('matineeShows', e?.target?.value)}
                  min="0"
                />
                <Input
                  label="Tickets Sold"
                  type="number"
                  placeholder="0"
                  value={formData?.matineeTickets}
                  onChange={(e) => handleInputChange('matineeTickets', e?.target?.value)}
                  min="0"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Sun" size={16} className="text-accent" />
                <span className="text-sm font-medium text-foreground">Afternoon Shows</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Collection (₹)"
                  type="number"
                  placeholder="0"
                  value={formData?.afternoonShows}
                  onChange={(e) => handleInputChange('afternoonShows', e?.target?.value)}
                  min="0"
                />
                <Input
                  label="Tickets Sold"
                  type="number"
                  placeholder="0"
                  value={formData?.afternoonTickets}
                  onChange={(e) => handleInputChange('afternoonTickets', e?.target?.value)}
                  min="0"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Sunset" size={16} className="text-primary" />
                <span className="text-sm font-medium text-foreground">First Shows</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Collection (₹)"
                  type="number"
                  placeholder="0"
                  value={formData?.firstShows}
                  onChange={(e) => handleInputChange('firstShows', e?.target?.value)}
                  min="0"
                />
                <Input
                  label="Tickets Sold"
                  type="number"
                  placeholder="0"
                  value={formData?.firstTickets}
                  onChange={(e) => handleInputChange('firstTickets', e?.target?.value)}
                  min="0"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Moon" size={16} className="text-secondary" />
                <span className="text-sm font-medium text-foreground">Second Shows</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Collection (₹)"
                  type="number"
                  placeholder="0"
                  value={formData?.secondShows}
                  onChange={(e) => handleInputChange('secondShows', e?.target?.value)}
                  min="0"
                />
                <Input
                  label="Tickets Sold"
                  type="number"
                  placeholder="0"
                  value={formData?.secondTickets}
                  onChange={(e) => handleInputChange('secondTickets', e?.target?.value)}
                  min="0"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="border border-border rounded-lg p-4 bg-primary/5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Icon name="Calculator" size={16} />
            Automatic Calculations
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Shows</p>
              <p className="text-lg font-semibold text-foreground font-data">{calculations?.totalShows}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Tickets</p>
              <p className="text-lg font-semibold text-foreground font-data">{calculations?.totalTickets}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">AC Charges</p>
              <p className="text-lg font-semibold text-error font-data">₹{calculations?.acCharges?.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Gross Collection</p>
              <p className="text-lg font-semibold text-success font-data">₹{calculations?.grossCollection?.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Net Collection</p>
              <p className="text-lg font-semibold text-primary font-data">₹{calculations?.netCollection?.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Remarks (Optional)
          </label>
          <textarea
            value={formData?.remarks}
            onChange={(e) => handleInputChange('remarks', e?.target?.value)}
            placeholder="Add any additional notes or remarks..."
            rows={3}
            className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={handleSaveDraft}>
            <Icon name="Save" size={16} className="mr-2" />
            Save as Draft
          </Button>
          <Button type="submit" variant="default">
            <Icon name="Send" size={16} className="mr-2" />
            Submit Collection
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CollectionForm;