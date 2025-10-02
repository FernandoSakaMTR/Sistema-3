import React from 'react';
import type { RequestStatus } from '../types';
import { RequestStatus as StatusEnum } from '../types';
import { STATUS_COLORS } from '../constants';
import { CheckIcon, XIcon, PauseIcon, WrenchIcon, DotIcon } from './icons';

interface StatusBadgeProps {
  status: RequestStatus;
}

const statusIcons: Record<RequestStatus, React.ReactNode> = {
    [StatusEnum.OPEN]: <DotIcon className="h-3.5 w-3.5" />,
    [StatusEnum.VIEWED]: <DotIcon className="h-3.5 w-3.5" />,
    [StatusEnum.ACCEPTED]: <DotIcon className="h-3.5 w-3.5" />,
    [StatusEnum.IN_PROGRESS]: <WrenchIcon className="h-3.5 w-3.5" />,
    [StatusEnum.PAUSED]: <PauseIcon className="h-3.5 w-3.5" />,
    [StatusEnum.COMPLETED]: <CheckIcon className="h-3.5 w-3.5" />,
    [StatusEnum.CANCELED]: <XIcon className="h-3.5 w-3.5" />,
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const colorClass = STATUS_COLORS[status] || 'bg-gray-200 text-gray-800';
  const icon = statusIcons[status];
  
  return (
    <span className={`inline-flex items-center gap-x-1.5 px-2 py-0.5 text-xs font-medium rounded-md ${colorClass}`}>
      {icon}
      {status}
    </span>
  );
};

export default StatusBadge;