import React from 'react';
const UserAvatar = ({ user, className = 'h-10 w-10' }) => {
    if (!user)
        return <div className={`${className} bg-gray-300 rounded-full`}></div>;
    return <img className={`${className} rounded-full object-cover`} src={user.avatar} alt={user.name}/>;
};
export default UserAvatar;
