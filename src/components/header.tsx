import React from 'react';
import { Bell, Search, User } from 'lucide-react'; // Import icons

interface HeaderProps {
    height?: string;
    className?: string;
    title?: string;
}

const Header: React.FC<HeaderProps> = ({ height = '64px', className = '', title = 'Dashboard' }) => {
    return (
        <header
            style={{ height }}
            className={`w-full bg-white border-b border-gray-200 flex items-center justify-between px-4 ${className}`}
        >
            <h1 className="text-xl font-semibold">{title}</h1>
            <div className="flex items-center space-x-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="pl-8 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                </div>
                <button className="p-2 rounded-full hover:bg-gray-100">
                    <Bell size={20} />
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100">
                    <User size={20} />
                </button>
            </div>
        </header>
    );
};

export default Header;