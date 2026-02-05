import React from 'react';
const UserAvatar = ({ user, className = 'h-10 w-10' }) => {
    if (!user)
        return <div className={`${className} bg-gray-300 rounded-full`}></div>;
    return (
        <div className={`relative inline-block ${className}`} title={user.isOnline ? 'Online' : 'Offline'}>
            <img className={`h-full w-full rounded-full object-cover`} src={user.avatar} alt={user.name}/>
            {/* Presence indicator */}
            <span className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white dark:ring-secondary ${user.isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
        </div>
    );
};
export default UserAvatar;
