// Spinner
export const Spinner = ({ size = 'md', className = '' }) => {
  const s = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' }[size];
  return (
    <div className={`animate-spin rounded-full border-2 border-gray-200 border-t-primary-600 ${s} ${className}`} />
  );
};

export const LoadingPage = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Spinner size="lg" />
  </div>
);

// Badge
const badgeColors = {
  STUDENT: 'bg-blue-100 text-blue-800',
  TEACHER: 'bg-purple-100 text-purple-800',
  ADMIN: 'bg-red-100 text-red-800',
  CURATOR: 'bg-orange-100 text-orange-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  GRADED: 'bg-green-100 text-green-800',
  REVIEWED: 'bg-blue-100 text-blue-800',
  published: 'bg-green-100 text-green-800',
  draft: 'bg-gray-100 text-gray-600',
};

export const Badge = ({ label, type }) => (
  <span className={`badge ${badgeColors[type] || badgeColors[label] || 'bg-gray-100 text-gray-600'}`}>
    {label}
  </span>
);

// Empty state
export const Empty = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    {Icon && <Icon className="h-12 w-12 text-gray-300 mb-4" />}
    <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
    {description && <p className="text-sm text-gray-500 mb-4">{description}</p>}
    {action}
  </div>
);

// Modal
export const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// Confirm dialog
export const ConfirmDialog = ({ open, onClose, onConfirm, title, message, danger }) => (
  <Modal open={open} onClose={onClose} title={title}>
    <p className="text-sm text-gray-600 mb-6">{message}</p>
    <div className="flex justify-end gap-3">
      <button className="btn-secondary" onClick={onClose}>Cancel</button>
      <button className={danger ? 'btn-danger' : 'btn-primary'} onClick={() => { onConfirm(); onClose(); }}>
        Confirm
      </button>
    </div>
  </Modal>
);

// Pagination
export const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.pages <= 1) return null;
  const { page, pages } = pagination;
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button className="btn-secondary px-3 py-1.5 text-xs" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        ← Prev
      </button>
      <span className="text-sm text-gray-600">Page {page} of {pages}</span>
      <button className="btn-secondary px-3 py-1.5 text-xs" disabled={page >= pages} onClick={() => onPageChange(page + 1)}>
        Next →
      </button>
    </div>
  );
};
