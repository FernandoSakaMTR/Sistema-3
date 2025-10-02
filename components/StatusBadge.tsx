
import React from 'react';
import type { RequestStatus } from '../types';
import { STATUS_COLORS } from '../constants';

interface StatusBadgeProps {
  status: RequestStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const colorClass = STATUS_COLORS[status] || 'bg-gray-200 text-gray-800';
  return (
    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${colorClass}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
