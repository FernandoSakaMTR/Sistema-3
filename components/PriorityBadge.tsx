
import React from 'react';
import type { EquipmentStatus } from '../types';
import { EQUIPMENT_STATUS_COLORS } from '../constants';

interface PriorityBadgeProps {
  status: EquipmentStatus;
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ status }) => {
  const colorClass = EQUIPMENT_STATUS_COLORS[status] || 'bg-gray-500 text-white';
  return (
    <span className={`px-3 py-1 text-xs font-bold rounded-full ${colorClass}`}>
      {status.toUpperCase()}
    </span>
  );
};

export default PriorityBadge;