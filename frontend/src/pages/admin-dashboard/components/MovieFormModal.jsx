import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createMovieThunk, updateMovieThunk } from '../../../store/moviesSlice';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';
import Modal from '../../../components/shared/Modal';
import Icon from '../../../components/AppIcon';
import { uploadPoster } from '../../../utils/api';

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
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState(movie?.poster_url || null);

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
        title: formData.title,
        release_date: formData.releaseDate,
        genre: formData.genres[0] || '',
        genres: formData.genres,
        description: formData.description,
        status: formData.status,
        budget: Number(formData.budget),
        duration: Number(formData.duration),
        language: formData.language || '',
        revenue_sharing: { distributor_percent: formData.distributor_percent ?? 60 },
      };

      if (isEditing) {
        const movieId = movie._id || movie.id;
        await dispatch(updateMovieThunk({ id: movieId, data: movieData })).unwrap();
        // Upload poster if a new file was selected
        if (posterFile) {
          await uploadPoster(movieId, posterFile);
        }
      } else {
        await dispatch(createMovieThunk(movieData)).unwrap();
      }

      onClose();
    } catch (error) {
      console.error('Error saving movie:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={isEditing ? 'Edit Movie' : 'Add New Movie'} size="md">
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

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {isEditing ? 'Poster Image' : 'Poster Image (upload after saving)'}
              </label>
              {isEditing ? (
                <div className="flex items-start gap-4">
                  {posterPreview && (
                    <img src={posterPreview} alt="Poster" className="w-16 h-24 object-cover rounded border border-border" />
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      disabled={isSubmitting}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setPosterFile(file);
                          setPosterPreview(URL.createObjectURL(file));
                        }
                      }}
                      className="block w-full text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:border file:border-border file:rounded file:text-sm file:cursor-pointer file:bg-muted hover:file:bg-muted/70"
                    />
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG or WebP — max 5 MB</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Save the movie first, then upload the poster from the edit form.</p>
              )}
            </div>
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
              className="flex-1"
            >
              {isSubmitting
                ? (isEditing ? 'Updating...' : 'Adding...')
                : (isEditing ? 'Update Movie' : 'Add Movie')
              }
            </Button>
          </div>
        </form>
    </Modal>
  );
};

export default MovieFormModal;
