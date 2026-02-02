/**
 * StatusBadge - Visual indicator for status
 * 
 * Status types: draft, sent, paid, overdue, cancelled, pending, cleared, failed, active, inactive
 */

const STATUS_VARIANTS = {
  // Invoice statuses
  draft: { color: 'neutral', label: 'Draft' },
  sent: { color: 'info', label: 'Sent' },
  paid: { color: 'success', label: 'Paid' },
  overdue: { color: 'danger', label: 'Overdue' },
  cancelled: { color: 'neutral', label: 'Cancelled' },
  
  // Payment statuses
  pending: { color: 'warning', label: 'Pending' },
  cleared: { color: 'success', label: 'Cleared' },
  failed: { color: 'danger', label: 'Failed' },
  
  // Client statuses
  prospect: { color: 'info', label: 'Prospect' },
  active: { color: 'success', label: 'Active' },
  past: { color: 'neutral', label: 'Past' },
  lost: { color: 'danger', label: 'Lost' },
};

const StatusBadge = ({
  status,
  label,
  size = 'md',
  className = '',
}) => {
  const variant = STATUS_VARIANTS[status] || { color: 'neutral', label: status };
  const displayLabel = label || variant.label;
  
  const classes = [
    'status-badge',
    `status-badge--${variant.color}`,
    `status-badge--${size}`,
    className
  ].filter(Boolean).join(' ');
  
  return (
    <span className={classes}>
      <span className="status-badge__dot" />
      <span className="status-badge__label">{displayLabel}</span>
    </span>
  );
};

export default StatusBadge;
