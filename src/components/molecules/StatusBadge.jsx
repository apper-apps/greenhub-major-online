import React from 'react'
import Badge from '@/components/atoms/Badge'

const statusConfig = {
  // Project statuses
  'planning': { variant: 'info', icon: 'FileText', label: 'Planning' },
  'in-progress': { variant: 'warning', icon: 'Clock', label: 'In Progress' },
  'completed': { variant: 'success', icon: 'CheckCircle', label: 'Completed' },
  'on-hold': { variant: 'error', icon: 'Pause', label: 'On Hold' },
  
  // Invoice statuses
  'draft': { variant: 'default', icon: 'FileText', label: 'Draft' },
  'sent': { variant: 'info', icon: 'Send', label: 'Sent' },
  'paid': { variant: 'success', icon: 'CheckCircle', label: 'Paid' },
  'overdue': { variant: 'error', icon: 'AlertCircle', label: 'Overdue' },
  
  // Proposal statuses
  'pending': { variant: 'warning', icon: 'Clock', label: 'Pending' },
  'accepted': { variant: 'success', icon: 'CheckCircle', label: 'Accepted' },
  'rejected': { variant: 'error', icon: 'XCircle', label: 'Rejected' },
  
  // Appointment statuses
  'scheduled': { variant: 'info', icon: 'Calendar', label: 'Scheduled' },
  'completed': { variant: 'success', icon: 'CheckCircle', label: 'Completed' },
  'cancelled': { variant: 'error', icon: 'XCircle', label: 'Cancelled' }
}

const StatusBadge = ({ status, className = '', ...props }) => {
  const config = statusConfig[status] || { variant: 'default', icon: 'Circle', label: status }
  
  return (
    <Badge
      variant={config.variant}
      icon={config.icon}
      className={className}
      {...props}
    >
      {config.label}
    </Badge>
  )
}

export default StatusBadge