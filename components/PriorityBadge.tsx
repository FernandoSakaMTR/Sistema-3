
import React from 'react';
import type { Priority } from '../types';
import { PRIORITY_COLORS } from '../constants';

interface PriorityBadgeProps {
  priority: Priority;
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const colorClass = PRIORITY_COLORS[priority] || 'bg-gray-500 text-white';
  return (
    <span className={`px-3 py-1 text-xs font-bold rounded-full ${colorClass}`}>
      {priority.toUpperCase()}
    </span>
  );
};

export default PriorityBadge;
