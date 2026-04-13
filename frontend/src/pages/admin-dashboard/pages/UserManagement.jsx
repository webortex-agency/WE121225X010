import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleBasedNavigation from '../../../components/ui/RoleBasedNavigation';
import Icon from '../../../components/AppIcon';
import { getUsers, createUser, updateUser, toggleUserStatus, resetUserPassword, getMovies, getExhibitors } from '../../../utils/api';

const ROLES = ['admin', 'manager', 'producer', 'exhibitor'];
const ROLE_COLORS = {
  admin: 'bg-purple-100 text-purple-800',
  manager: 'bg-blue-100 text-blue-800',
  producer: 'bg-indigo-100 text-indigo-800',
  exhibitor: 'bg-green-100 text-green-800',
};

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [movies, setMovies] = useState([]);
  const [exhibitors, setExhibitors] = useState([]);
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newPassword, setNewPassword] = useState(null);

  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'exhibitor', assigned_movie_id: '', exhibitor_id: '' });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterRole) params.role = filterRole;
      if (filterStatus) params.status = filterStatus;
      const data = await getUsers(params);
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filterRole, filterStatus]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  useEffect(() => {
    Promise.allSettled([getMovies(), getExhibitors()]).then(([mRes, eRes]) => {
      if (mRes.status === 'fulfilled') setMovies(mRes.value || []);
      if (eRes.status === 'fulfilled') setExhibitors(eRes.value || []);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading('form');
    setError('');
    try {
      if (editUser) {
        await updateUser(editUser._id, form);
        setSuccess('User updated successfully');
      } else {
        await createUser(form);
        setSuccess('User created successfully');
      }
      setShowForm(false);
      setEditUser(null);
      setForm({ name: '', email: '', password: '', role: 'exhibitor', assigned_movie_id: '', exhibitor_id: '' });
      await fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggle = async (userId) => {
    setActionLoading(userId);
    try {
      await toggleUserStatus(userId);
      await fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetPassword = async (userId) => {
    if (!confirm('Reset this user\'s password? A temporary password will be generated.')) return;
    setActionLoading(userId + '_reset');
    try {
      const res = await resetUserPassword(userId);
      setNewPassword({ userId, password: res.tempPassword });
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const openEdit = (user) => {
    setEditUser(user);
    setForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      assigned_movie_id: user.assigned_movie_id || '',
      exhibitor_id: user.exhibitor_id || '',
    });
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <RoleBasedNavigation userRole="admin" />

      <div className="main-content with-toolbar">
        <div className="content-container">
          <div className="flex items-center justify-between mb-6">
            <div>
              <button onClick={() => navigate('/admin-dashboard')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-2">
                <Icon name="ArrowLeft" size={14} />
                Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-foreground">User Management</h1>
              <p className="text-muted-foreground">Create and manage admin, manager, producer, and exhibitor accounts</p>
            </div>
            <button
              onClick={() => { setEditUser(null); setForm({ name: '', email: '', password: '', role: 'exhibitor', assigned_movie_id: '', exhibitor_id: '' }); setShowForm(true); }}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90"
            >
              <Icon name="UserPlus" size={16} />
              Add User
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2">
              <Icon name="AlertCircle" size={16} className="text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
              <button onClick={() => setError('')} className="ml-auto"><Icon name="X" size={14} className="text-destructive" /></button>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-success/10 border border-success/20 rounded-md flex items-center gap-2">
              <Icon name="CheckCircle2" size={16} className="text-success" />
              <p className="text-sm text-success">{success}</p>
              <button onClick={() => setSuccess('')} className="ml-auto"><Icon name="X" size={14} className="text-success" /></button>
            </div>
          )}

          {newPassword && (
            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-sm font-semibold text-amber-900 mb-1">Password Reset Successfully</p>
              <p className="text-xs text-amber-800">Temporary password: <code className="font-mono bg-amber-100 px-2 py-0.5 rounded">{newPassword.password}</code></p>
              <p className="text-xs text-amber-700 mt-1">Share this with the user immediately. It cannot be shown again.</p>
              <button onClick={() => setNewPassword(null)} className="text-xs text-amber-600 mt-2 underline">Dismiss</button>
            </div>
          )}

          {/* Filters */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="text-sm border border-border px-3 py-1.5 rounded-md bg-background">
              <option value="">All Roles</option>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="text-sm border border-border px-3 py-1.5 rounded-md bg-background">
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <span className="text-sm text-muted-foreground">{users.length} users</span>
          </div>

          {/* Users Table */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Icon name="Loader2" size={24} className="animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-foreground">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-foreground">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-foreground">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-foreground">Assignment</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-foreground">Status</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {users.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">No users found</td></tr>
                    ) : users.map((u) => (
                      <tr key={u._id} className="hover:bg-muted/20">
                        <td className="px-4 py-3 font-medium text-foreground">{u.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[u.role] || 'bg-gray-100 text-gray-700'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                          {u.assigned_movie_id || u.exhibitor_id || '—'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => openEdit(u)} title="Edit" className="p-1.5 rounded hover:bg-muted">
                              <Icon name="Edit" size={14} className="text-muted-foreground" />
                            </button>
                            <button
                              onClick={() => handleToggle(u._id)}
                              disabled={actionLoading === u._id}
                              title={u.status === 'active' ? 'Deactivate' : 'Activate'}
                              className="p-1.5 rounded hover:bg-muted disabled:opacity-50"
                            >
                              {actionLoading === u._id
                                ? <Icon name="Loader2" size={14} className="animate-spin" />
                                : <Icon name={u.status === 'active' ? 'UserX' : 'UserCheck'} size={14} className={u.status === 'active' ? 'text-red-500' : 'text-green-500'} />
                              }
                            </button>
                            <button
                              onClick={() => handleResetPassword(u._id)}
                              disabled={actionLoading === u._id + '_reset'}
                              title="Reset Password"
                              className="p-1.5 rounded hover:bg-muted disabled:opacity-50"
                            >
                              <Icon name="KeyRound" size={14} className="text-muted-foreground" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">{editUser ? 'Edit User' : 'Create New User'}</h3>
              <button onClick={() => setShowForm(false)}><Icon name="X" size={20} className="text-muted-foreground" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Full Name *</label>
                <input required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="w-full mt-1 px-3 py-2 border border-border rounded-md text-sm bg-background" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Email *</label>
                <input required type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="w-full mt-1 px-3 py-2 border border-border rounded-md text-sm bg-background" />
              </div>
              {!editUser && (
                <div>
                  <label className="text-sm font-medium text-foreground">Password *</label>
                  <input required type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} className="w-full mt-1 px-3 py-2 border border-border rounded-md text-sm bg-background" />
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-foreground">Role *</label>
                <select required value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))} className="w-full mt-1 px-3 py-2 border border-border rounded-md text-sm bg-background">
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              {(form.role === 'manager' || form.role === 'producer') && (
                <div>
                  <label className="text-sm font-medium text-foreground">Assigned Movie ID</label>
                  <select value={form.assigned_movie_id} onChange={(e) => setForm((p) => ({ ...p, assigned_movie_id: e.target.value }))} className="w-full mt-1 px-3 py-2 border border-border rounded-md text-sm bg-background">
                    <option value="">— Select Movie —</option>
                    {movies.map((m) => <option key={m.movie_id} value={m.movie_id}>{m.title} ({m.movie_id})</option>)}
                  </select>
                </div>
              )}
              {form.role === 'exhibitor' && (
                <div>
                  <label className="text-sm font-medium text-foreground">Linked Exhibitor</label>
                  <select value={form.exhibitor_id} onChange={(e) => setForm((p) => ({ ...p, exhibitor_id: e.target.value }))} className="w-full mt-1 px-3 py-2 border border-border rounded-md text-sm bg-background">
                    <option value="">— Select Exhibitor —</option>
                    {exhibitors.map((ex) => <option key={ex._id} value={ex._id}>{ex.name} ({ex.exhibitor_id})</option>)}
                  </select>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-border px-4 py-2 rounded-md text-sm hover:bg-muted">
                  Cancel
                </button>
                <button type="submit" disabled={actionLoading === 'form'} className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
                  {actionLoading === 'form' ? 'Saving...' : editUser ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
