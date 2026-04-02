import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import Icon from '../AppIcon';
import Button from './Button';

const RoleBasedNavigation = ({ userRole = 'admin' }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const navigationConfig = {
    admin: [
      { path: '/admin-dashboard', label: 'Home', icon: 'LayoutDashboard' },
      { path: '/statements', label: 'Statements', icon: 'FileText' },
      { path: '/admin/movies', label: 'Movies', icon: 'Film' },
      { path: '/admin/exhibitors', label: 'Exhibitors', icon: 'Building2' },
      { path: '/admin/analytics', label: 'Analytics', icon: 'BarChart3' },
    ],
    manager: [
      { path: '/movie-manager-dashboard', label: 'Dashboard', icon: 'Film' },
    ],
    exhibitor: [
      { path: '/exhibitor/home', label: 'Home', icon: 'Home' },
      { path: '/exhibitor/ledger', label: 'Ledger', icon: 'BookOpen' },
      { path: '/exhibitor/profile', label: 'Profile', icon: 'Settings' },
    ],
  };

  const menuItems = navigationConfig?.[userRole] || navigationConfig?.admin;

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location?.pathname]);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const isActive = (path) => location?.pathname === path;

  return (
    <>
      <nav className="role-nav">
        <div className="role-nav-container">
          <div className="role-nav-content">
            <div className="role-nav-brand">
              <div className="role-nav-logo">
                <Icon name="Film" size={24} color="#FFFFFF" />
              </div>
              <span className="role-nav-title">Movie Distribution</span>
            </div>

            <div className="role-nav-menu">
              {menuItems?.map((item) => (
                <button
                  key={item?.path}
                  onClick={() => handleNavigation(item?.path)}
                  className={`role-nav-item ${isActive(item?.path) ? 'active' : ''}`}
                >
                  <Icon name={item?.icon} size={16} className="inline-block mr-2" />
                  {item?.label}
                </button>
              ))}
            </div>

            <div className="role-nav-actions">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="hidden lg:flex"
              >
                <Icon name="LogOut" size={20} />
              </Button>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="role-nav-mobile-toggle"
              >
                <Icon name={isMobileMenuOpen ? 'X' : 'Menu'} size={24} />
              </button>
            </div>
          </div>
        </div>
      </nav>
      {isMobileMenuOpen && (
        <div className="role-nav-mobile-menu">
          <div className="role-nav-mobile-content">
            {menuItems?.map((item) => (
              <button
                key={item?.path}
                onClick={() => handleNavigation(item?.path)}
                className={`role-nav-mobile-item ${isActive(item?.path) ? 'active' : ''}`}
              >
                <Icon name={item?.icon} size={20} className="inline-block mr-3" />
                {item?.label}
              </button>
            ))}

            <button
              onClick={handleLogout}
              className="role-nav-mobile-item mt-4 border-t border-border pt-4"
            >
              <Icon name="LogOut" size={20} className="inline-block mr-3" />
              Logout
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default RoleBasedNavigation;