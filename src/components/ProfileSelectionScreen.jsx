import React from 'react';
import { LogoIcon } from './Icons';
const UserCard = ({ name, role, avatar, onClick }) => (<button onClick={onClick} className="w-full flex items-center p-4 space-x-4 bg-white dark:bg-gray-800/50 rounded-xl shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50">
        <img className="h-14 w-14 rounded-full object-cover" src={avatar} alt={name}/>
        <div className="text-left">
            <p className="font-bold text-lg text-gray-800 dark:text-white">{name}</p>
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${role === 'admin' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'}`}>
                {role}
            </span>
        </div>
    </button>);
const ProfileSelectionScreen = ({ adminUser, onSelectRole }) => {
    return (<div className="min-h-screen bg-light dark:bg-dark flex flex-col items-center justify-center p-4 font-sans transition-colors duration-300">
            <div className="w-full max-w-md mx-auto space-y-8 bg-white dark:bg-secondary p-10 rounded-2xl shadow-2xl">
                <div className="flex flex-col items-center space-y-4 text-center">
                    <LogoIcon className="h-16 w-16 text-primary"/>
                    <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Welcome to ConnectSphere</h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400">Select a profile to log in</p>
                </div>
                <div className="space-y-4">
                    <UserCard name={adminUser.name} role={adminUser.role} avatar={adminUser.avatar} onClick={() => onSelectRole('admin')}/>
                    <UserCard name="Participant User" role="participant" avatar="https://picsum.photos/seed/participant-generic/100" onClick={() => onSelectRole('participant')}/>
                </div>
            </div>
        </div>);
};
export default ProfileSelectionScreen;
