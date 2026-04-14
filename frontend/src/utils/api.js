/**
 * Central API utility — all fetch calls go through here.
 * Reads the auth token from localStorage automatically.
 */

const BASE_URL = '/api';

const getToken = () => {
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    return userInfo?.token || null;
  } catch {
    return null;
  }
};

const headers = (extra = {}) => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
  ...extra,
});

const request = async (method, path, body) => {
  const opts = { method, headers: headers() };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE_URL}${path}`, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Request failed');
  }
  return res.json();
};

// ── Collections ──────────────────────────────────────────────────────────────

export const submitCollection = (data) => request('POST', '/collections', data);

export const getMyCollections = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request('GET', `/collections/my${qs ? `?${qs}` : ''}`);
};

export const getAllCollections = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request('GET', `/collections${qs ? `?${qs}` : ''}`);
};

export const getCollectionsByMovie = (movie_id, params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request('GET', `/collections/movie/${movie_id}${qs ? `?${qs}` : ''}`);
};

export const getMovieAnalytics = (movie_id) =>
  request('GET', `/collections/movie/${movie_id}/analytics`);

export const approveCollection = (id) => request('PUT', `/collections/${id}/approve`, {});

export const rejectCollection = (id, reason) => request('PUT', `/collections/${id}/reject`, { reason });

export const getAdminStats = () => request('GET', '/collections/admin/stats');

// ── Ledger ───────────────────────────────────────────────────────────────────

export const getMyLedger = () => request('GET', '/ledger/my');

export const getLedgerByExhibitor = (exhibitor_id) =>
  request('GET', `/ledger/${exhibitor_id}`);

// ── Closing Statements ───────────────────────────────────────────────────────

export const generateStatement = (data) => request('POST', '/statements/generate', data);

export const listStatements = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request('GET', `/statements${qs ? `?${qs}` : ''}`);
};

export const getStatementById = (id) => request('GET', `/statements/${id}`);

export const getStatementPDFUrl = (id) => `${BASE_URL}/statements/${id}/pdf`;

// For triggering PDF download with auth
export const downloadStatementPDF = async (id, filename = 'closing-statement.pdf') => {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/statements/${id}/pdf`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Failed to download PDF');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

// ── Analytics ────────────────────────────────────────────────────────────────

export const getDashboardAnalytics = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request('GET', `/analytics/dashboard${qs ? `?${qs}` : ''}`);
};

export const getExportUrl = (type, params = {}) => {
  const token = getToken();
  const qs = new URLSearchParams(params).toString();
  return `${BASE_URL}/analytics/export/${type}${qs ? `?${qs}&token=${token}` : `?token=${token}`}`;
};

export const downloadCSV = async (path, filename) => {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Export failed');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportCollectionsCSV = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return downloadCSV(`/analytics/export/collections${qs ? `?${qs}` : ''}`, `collections_${Date.now()}.csv`);
};

export const exportLedgerCSV = (exhibitor_id) =>
  downloadCSV(`/analytics/export/ledger/${exhibitor_id}`, `ledger_${exhibitor_id}_${Date.now()}.csv`);

// ── Users ────────────────────────────────────────────────────────────────────

export const getUsers = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request('GET', `/users${qs ? `?${qs}` : ''}`);
};

export const createUser = (data) => request('POST', '/users', data);
export const updateUser = (id, data) => request('PUT', `/users/${id}`, data);
export const toggleUserStatus = (id) => request('PUT', `/users/${id}/toggle-status`, {});
export const resetUserPassword = (id) => request('PUT', `/users/${id}/reset-password`, {});
export const getMe = () => request('GET', '/users/me');

// ── Exhibitors ───────────────────────────────────────────────────────────────

export const getExhibitorById = (id) => request('GET', `/exhibitors/${id}`);
export const getExhibitors = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request('GET', `/exhibitors${qs ? `?${qs}` : ''}`);
};
export const createExhibitor = (data) => request('POST', '/exhibitors', data);
export const updateExhibitor = (id, data) => request('PUT', `/exhibitors/${id}`, data);
export const deleteExhibitor = (id) => request('DELETE', `/exhibitors/${id}`);

// ── Assignments ──────────────────────────────────────────────────────────────

export const getAssignmentsByExhibitor = (exhibitor_id) =>
  request('GET', `/assignments/exhibitor/${exhibitor_id}`);

export const removeAssignment = (assignment_id) =>
  request('DELETE', `/assignments/${assignment_id}`);

// ── Auth / Movies ────────────────────────────────────────────────────────────

export const getMovies = () => request('GET', '/movies');

export const createMovie = (data) => request('POST', '/movies', data);

export const uploadPoster = async (movie_id, file) => {
  const token = getToken();
  const formData = new FormData();
  formData.append('poster', file);
  const res = await fetch(`${BASE_URL}/upload/movie/${movie_id}/poster`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Upload failed');
  }
  return res.json();
};

export const deletePoster = (movie_id) => request('DELETE', `/upload/movie/${movie_id}/poster`);

export const updateMovie = (id, data) => request('PUT', `/movies/${id}`, data);

export const deleteMovie = (id) => request('DELETE', `/movies/${id}`);

export const updateMe = (data) => request('PUT', '/users/me', data);

export const getAssignmentsByMovie = (movie_id) =>
  request('GET', `/assignments/movie/${movie_id}`);
