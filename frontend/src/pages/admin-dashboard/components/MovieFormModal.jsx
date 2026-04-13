import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addMovie, updateMovie } from '../../../store/moviesSlice';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const MovieFormModal = ({ movie, onClose }) => {
  const dispatch = useDispatch();
  const isEditing = !!movie;

  const [formData, setFormData] = useState({
    title: '',
    releaseDate: '',
    genres: [],
    description: '',
    status: 'active',
    budget: '',
    duration: '',
    posterUrl: '',
    distributor_percent: 60,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const genreOptions = [
    'Action', 'Drama', 'Comedy', 'Thriller', 'Romance', 'Horror',
    'Adventure', 'Sci-Fi', 'Fantasy', 'Biography', 'History',
    'Crime', 'Animation'
  ];

  useEffect(() => {
    if (movie) {
      setFormData({
        title: movie.title || '',
        releaseDate: movie.releaseDate || '',
        genres: movie.genres || [],
        description: movie.description || '',
        status: movie.status || 'active',
        budget: movie.budget?.toString() || '',
        duration: movie.duration?.toString() || '',
        posterUrl: movie.posterUrl || '',
        distributor_percent: movie.revenue_sharing?.distributor_percent ?? movie.distributor_percent ?? 60,
      });
    }
  }, [movie]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Movie title is required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    if (!formData.releaseDate) {
      newErrors.releaseDate = 'Release date is required';
    }

    if (formData.genres.length === 0) {
      newErrors.genres = 'At least one genre is required';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    if (!formData.budget) {
      newErrors.budget = 'Budget is required';
    } else if (isNaN(formData.budget) || Number(formData.budget) <= 0) {
      newErrors.budget = 'Budget must be a valid positive number';
    }

    if (!formData.duration) {
      newErrors.duration = 'Duration is required';
    } else if (isNaN(formData.duration) || Number(formData.duration) <= 0) {
      newErrors.duration = 'Duration must be a valid positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleGenreChange = (genre) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
    
    if (errors.genres) {
      setErrors(prev => ({ ...prev, genres: '' }));
    }
  };

  const handleStatusChange = (status) => {
    setFormData(prev => ({ ...prev, status }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const movieData = {
        ...formData,
        budget: Number(formData.budget),
        duration: Number(formData.duration),
        exhibitorCount: movie?.exhibitorCount || 0,
        totalCollections: movie?.totalCollections || 0
      };

      if (isEditing) {
        dispatch(updateMovie({ ...movieData, id: movie.id }));
      } else {
        dispatch(addMovie(movieData));
      }

      onClose();
    } catch (error) {
      console.error('Error saving movie:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            {isEditing ? 'Edit Movie' : 'Add New Movie'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-md transition-colors"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Movie Title *"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                error={errors.title}
                placeholder="Enter movie title"
                disabled={isSubmitting}
              />
              
              <Input
                label="Release Date *"
                name="releaseDate"
                type="date"
                value={formData.releaseDate}
                onChange={handleInputChange}
                error={errors.releaseDate}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter movie description (optional)"
                disabled={isSubmitting}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-destructive">{errors.description}</p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                {formData.description.length}/500 characters
              </p>
            </div>
          </div>

          {/* Genres */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Genres *</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {genreOptions.map((genre) => (
                <label key={genre} className="flex items-center space-x-2 cursor-pointer">
                  <Checkbox
                    checked={formData.genres.includes(genre)}
                    onChange={() => handleGenreChange(genre)}
                    disabled={isSubmitting}
                  />
                  <span className="text-sm text-foreground">{genre}</span>
                </label>
              ))}
            </div>
            {errors.genres && (
              <p className="text-sm text-destructive">{errors.genres}</p>
            )}
          </div>

          {/* Technical Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Technical Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Budget (₹) *"
                name="budget"
                type="number"
                value={formData.budget}
                onChange={handleInputChange}
                error={errors.budget}
                placeholder="Enter budget in rupees"
                disabled={isSubmitting}
              />
              
              <Input
                label="Duration (minutes) *"
                name="duration"
                type="number"
                value={formData.duration}
                onChange={handleInputChange}
                error={errors.duration}
                placeholder="Enter duration in minutes"
                disabled={isSubmitting}
              />
            </div>

            <Input
              label="Poster Image URL"
              name="posterUrl"
              type="url"
              value={formData.posterUrl}
              onChange={handleInputChange}
              error={errors.posterUrl}
              placeholder="Enter poster image URL (optional)"
              disabled={isSubmitting}
            />
          </div>

          {/* Revenue Sharing */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Revenue Sharing</h3>
            <p className="text-sm text-muted-foreground">Configure how collections are split between distributor and exhibitor.</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">Distributor % *</label>
                <input
                  type="number"
                  min="0" max="100"
                  value={formData.distributor_percent ?? 60}
                  onChange={(e) => setFormData((p) => ({ ...p, distributor_percent: Number(e.target.value) }))}
                  className="mt-1 w-full px-3 py-2 border border-border rounded-md text-sm bg-background"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Exhibitor %</label>
                <input
                  type="number"
                  readOnly
                  value={100 - (formData.distributor_percent ?? 60)}
                  className="mt-1 w-full px-3 py-2 border border-border rounded-md text-sm bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground mt-1">Auto-calculated (100 − Distributor %)</p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Status *</h3>
            <div className="flex gap-4">
              {['active', 'inactive', 'upcoming'].map((status) => (
                <label key={status} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value={status}
                    checked={formData.status === status}
                    onChange={() => handleStatusChange(status)}
                    disabled={isSubmitting}
                    className="w-4 h-4 text-primary border-border focus:ring-primary"
                  />
                  <span className="text-sm text-foreground capitalize">{status}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              iconName={isEditing ? "Save" : "Plus"}
              iconPosition="left"
              className="flex-1 bg-teal-600 hover:bg-teal-700"
            >
              {isSubmitting 
                ? (isEditing ? 'Updating...' : 'Adding...') 
                : (isEditing ? 'Update Movie' : 'Add Movie')
              }
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MovieFormModal;
