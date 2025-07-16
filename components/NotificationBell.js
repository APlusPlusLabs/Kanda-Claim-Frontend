import React, { useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';

const NotificationBell = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { 
        notifications, 
        unreadCount, 
        connectionStatus, 
        connectionMethod, 
        markAsRead, 
        retryConnection 
    } = useNotifications();

    const getConnectionColor = () => {
        switch (connectionStatus) {
            case 'connected': return 'text-green-500';
            case 'connecting': return 'text-yellow-500';
            case 'error': return 'text-red-500';
            default: return 'text-gray-500';
        }
    };

    const getConnectionText = () => {
        switch (connectionStatus) {
            case 'connected': return `Connected (${connectionMethod.toUpperCase()})`;
            case 'connecting': return 'Connecting...';
            case 'error': return 'Connection Error';
            default: return 'Disconnected';
        }
    };

    return (
        <div className="relative">
            {/* Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
            >
                <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                </svg>
                
                {/* Unread Count Badge */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Notifications</h3>
                            <div className="flex items-center space-x-2">
                                <span className={`text-xs ${getConnectionColor()}`}>
                                    ●
                                </span>
                                <span className="text-xs text-gray-500">
                                    {getConnectionText()}
                                </span>
                                {connectionStatus === 'error' && (
                                    <button
                                        onClick={retryConnection}
                                        className="text-xs text-blue-500 hover:text-blue-700"
                                    >
                                        Retry
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                No notifications yet
                            </div>
                        ) : (
                            notifications.slice(0, 10).map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                                        notification.status === 'unread' ? 'bg-blue-50' : ''
                                    }`}
                                    onClick={() => markAsRead(notification.id)}
                                >
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0">
                                            {notification.status === 'unread' && (
                                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900">
                                                {notification.title}
                                            </p>
                                            <p className="text-sm text-gray-500 truncate">
                                                {notification.description}
                                            </p>
                                            <div className="flex items-center justify-between mt-1">
                                                <span className="text-xs text-gray-400">
                                                    {new Date(notification.created_at).toLocaleString()}
                                                </span>
                                                {notification.claim_id && (
                                                    <span className="text-xs text-blue-500">
                                                        Claim #{notification.claim_id}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 10 && (
                        <div className="px-4 py-2 border-t border-gray-200">
                            <button className="text-sm text-blue-500 hover:text-blue-700">
                                View all notifications
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};