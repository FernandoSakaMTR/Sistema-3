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

export const CogIcon = createIcon(
    <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" />
);

export const CheckIcon = createIcon(
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
);

export const XIcon = createIcon(
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
);

export const PauseIcon = createIcon(
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
);

export const DotIcon = createIcon(
    <circle cx="12" cy="12" r="8" />
);

export const TrashIcon = createIcon(
    <path d="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z" />
);

export const PencilIcon = createIcon(
    <path d="M14.06,9L15,9.94L5.92,19H5V18.08L14.06,9M17.66,3C17.41,3 17.15,3.1 16.96,3.29L15.13,5.12L18.88,8.87L20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18.17,3.09 17.92,3 17.66,3M14.06,6.19L3,17.25V21H6.75L17.81,9.94L14.06,6.19Z" />
);