import React from 'react';
import type { RequestStatus } from '../types';
import { STATUS_COLORS } from '../constants';

interface StatusBadgeProps {
  status: RequestStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const colorClass = STATUS_COLORS[status] || 'bg-gray-200 text-gray-800';
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-md ${colorClass}`}>
      {status}
    </span>
  );
};

export default StatusBadge;