
import React from 'react';

const createIcon = (path: React.ReactNode): React.FC<React.SVGProps<SVGSVGElement>> => {
    const IconComponent: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
            {path}
        </svg>
    );
    IconComponent.displayName = 'Icon';
    return IconComponent;
};

export const DashboardIcon = createIcon(
    <path d="M13 3V9H21V3M13 21H21V11H13M3 21H11V15H3M3 13H11V3H3V13Z" />
);

export const ListIcon = createIcon(
    <path d="M3 13H9V7H3M3 17H9V15H3M11 13H21V7H11M11 17H21V15H11M3 5V3H21V5" />
);

export const PlusIcon = createIcon(
    <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
);

export const LogoutIcon = createIcon(
    <path d="M16 17V14H9V10H16V7L21 12L16 17M14 2A2 2 0 0 1 16 4V6H14V4H5V20H14V18H16V20A2 2 0 0 1 14 22H5A2 2 0 0 1 3 20V4A2 2 0 0 1 5 2H14Z" />
);

export const UserIcon = createIcon(
    <path d="M12 4A4 4 0 0 1 16 8A4 4 0 0 1 12 12A4 4 0 0 1 8 8A4 4 0 0 1 12 4M12 14C16.42 14 20 15.79 20 18V20H4V18C4 15.79 7.58 14 12 14Z" />
);

export const WrenchIcon = createIcon(
    <path d="M22.7,19L20.8,20.9C20.4,21.3 19.8,21.5 19.2,21.5C18.6,21.5 18,21.3 17.6,20.9L12.9,16.2C12.5,15.8 12.5,15.2 12.9,14.8L14.8,12.9C15.2,12.5 15.8,12.5 16.2,12.9L20.9,17.6C21.7,18.4 21.7,19.6 20.9,20.4V20.4H20.9L22.7,19ZM11.4,14.3L10.7,15L4.8,9.1C4.4,8.7 4.4,8.1 4.8,7.7L5.5,7L9.4,3.1C9.8,2.7 10.4,2.7 10.8,3.1L12.2,4.5L11.5,5.2L9.1,2.8L8.4,3.5L4.5,7.4C4.1,7.8 4.1,8.4 4.5,8.8L10.4,14.7L11.1,14L12.5,15.4L11.4,14.3ZM2.3,15.3L1,16.6C0.6,17 0.4,17.6 0.4,18.2C0.4,18.8 0.6,19.4 1,19.8L2.9,21.7C3.3,22.1 3.9,22.3 4.5,22.3C5.1,22.3 5.7,22.1 6.1,21.7L7.4,20.4L2.3,15.3Z" />
);

export const ChevronDownIcon = createIcon(
    <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
);

export const ExternalLinkIcon = createIcon(
    <path d="M19 19H5V5h7V3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
);

export const LockIcon = createIcon(
    <path d="M12,17C10.89,17 10,16.1 10,15C10,13.89 10.89,13 12,13C13.11,13 14,13.89 14,15C14,16.1 13.11,17 12,17M18,8H17V6C17,3.24 14.76,1 12,1C9.24,1 7,3.24 7,6V8H6C4.89,8 4,8.89 4,10V20C4,21.11 4.89,22 6,22H18C19.11,22 20,21.11 20,20V10C20,8.89 19.11,8 18,8M12,3C13.66,3 15,4.34 15,6V8H9V6C9,4.34 10.34,3 12,3Z" />
);