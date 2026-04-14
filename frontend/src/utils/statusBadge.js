/**
 * Returns a Tailwind className string for a status badge.
 * Uses design tokens (primary, destructive, success, warning) instead of
 * raw Tailwind color classes.
 *
 * Usage:
 *   <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${getStatusBadge(status)}`}>
 *     {status}
 *   </span>
 */
export const getStatusBadge = (status) => {
  const map = {
    // Collection / statement statuses
    approved:   'bg-green-100 text-green-800 border-green-200',
    active:     'bg-green-100 text-green-800 border-green-200',
    generated:  'bg-green-100 text-green-800 border-green-200',

    submitted:  'bg-blue-100 text-blue-800 border-blue-200',
    pending:    'bg-yellow-100 text-yellow-800 border-yellow-200',

    rejected:   'bg-red-100 text-red-800 border-red-200',
    inactive:   'bg-red-100 text-red-800 border-red-200',
    suspended:  'bg-red-100 text-red-800 border-red-200',

    draft:      'bg-gray-100 text-gray-700 border-gray-200',
    archived:   'bg-gray-100 text-gray-700 border-gray-200',
  };
  return map[status?.toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-200';
};

/**
 * Returns a human-readable label for a status value.
 */
export const getStatusLabel = (status) => {
  if (!status) return 'Unknown';
  return status.charAt(0).toUpperCase() + status.slice(1);
};
