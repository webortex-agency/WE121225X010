import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useLoginMutation } from '../../../store/usersApiSlice';
import { setCredentials } from '../../../store/authSlice';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const LoginForm = ({ role, onBack }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    movie_id: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (role === 'manager' || role === 'producer') {
      if (!formData.movie_id.trim()) {
        newErrors.movie_id = 'Movie ID is required for your role';
      } else if (!/^MOV-\d{4}-\d{3}$/.test(formData.movie_id)) {
        newErrors.movie_id = 'Invalid format. Use MOV-YYYY-XXX';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (loginError) {
      setLoginError('');
    }
  };

  const handleCheckboxChange = (e) => {
    setFormData((prev) => ({ ...prev, rememberMe: e.target.checked }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!validateForm()) {
      return;
    }

    try {
      const payload = { ...formData };
      if (role !== 'manager' && role !== 'producer') {
        delete payload.movie_id;
      }

      const res = await login(payload).unwrap();
      dispatch(setCredentials({ ...res }));

      switch (res.user.role) {
        case 'admin':
          navigate('/admin-dashboard');
          break;
        case 'manager':
        case 'producer':
          navigate(`/movie-manager-dashboard/${res.user.assigned_movie_id}`);
          break;
        case 'exhibitor':
          navigate('/exhibitor-portal');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      setLoginError(err.data?.error || 'An unexpected error occurred.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      {loginError && (
        <div className="bg-error/10 border border-error/20 rounded-md p-4 flex items-start gap-3">
          <Icon name="AlertCircle" size={20} className="text-error flex-shrink-0 mt-0.5" />
          <p className="text-sm text-error">{loginError}</p>
        </div>
      )}
      <Input
        type="email"
        name="email"
        label="Email Address"
        placeholder="Enter your email address"
        value={formData.email}
        onChange={handleInputChange}
        error={errors.email}
        required
        disabled={isLoading}
      />
      <Input
        type="password"
        name="password"
        label="Password"
        placeholder="Enter your password"
        value={formData.password}
        onChange={handleInputChange}
        error={errors.password}
        required
        disabled={isLoading}
      />

      {(role === 'manager' || role === 'producer') && (
        <Input
          type="text"
          name="movie_id"
          label="Movie ID"
          placeholder="MOV-YYYY-XXX"
          value={formData.movie_id}
          onChange={handleInputChange}
          error={errors.movie_id}
          required
          disabled={isLoading}
          helpText="Required to access your assigned movie dashboard"
        />
      )}

      <div className="flex items-center justify-between">
        <Checkbox
          label="Remember me"
          checked={formData.rememberMe}
          onChange={handleCheckboxChange}
          disabled={isLoading}
        />
        <button
          type="button"
          className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          disabled={isLoading}
        >
          Forgot password?
        </button>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onBack}
          disabled={isLoading}
        >
          Back
        </Button>
        <Button
          type="submit"
          variant="default"
          size="lg"
          fullWidth
          loading={isLoading}
          iconName="LogIn"
          iconPosition="right"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;