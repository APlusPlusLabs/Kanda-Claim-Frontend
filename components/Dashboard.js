import React, { useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';

const Dashboard = () => {
    const { 
        notifications, 
        unreadCount, 
        connectionStatus, 
        connectionMethod, 
        markAsRead,
        loadNotifications 
    } = useNotifications();

    // Refresh notifications when component mounts
    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    return (
        <div className="space-y-6">
            {/* Connection Status Card */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Notification System Status</h2>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <span className={`w-3 h-3 rounded-full ${
                            connectionStatus === 'connected' ? 'bg-green-500' : 
                            connectionStatus === 'connecting' ? 'bg-yellow-500' : 
                            'bg-red-500'
                        }`}></span>
                        <span className="text-sm font-medium">
                            {connectionStatus === 'connected' ? 'Connected' : 
                             connectionStatus === 'connecting' ? 'Connecting...' : 
                             'Disconnected'}
                        </span>
                        <span className="text-xs text-gray-500">
                            via {connectionMethod.toUpperCase()}
                        </span>
                    </div>
                    <div className="text-sm text-gray-600">
                        {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                    </div>
                </div>
            </div>

            {/* Recent Notifications */}
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold">Recent Notifications</h2>
                </div>
                <div className="divide-y divide-gray-200">
                    {notifications.slice(0, 5).map((notification) => (
                        <div 
                            key={notification.id} 
                            className={`px-6 py-4 hover:bg-gray-50 cursor-pointer ${
                                notification.status === 'unread' ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => markAsRead(notification.id)}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                        <h3 className="text-sm font-medium text-gray-900">
                                            {notification.title}
                                        </h3>
                                        {notification.status === 'unread' && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                New
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {notification.description}
                                    </p>
                                    <div className="flex items-center space-x-4 mt-2">
                                        <span className="text-xs text-gray-400">
                                            {new Date(notification.created_at).toLocaleString()}
                                        </span>
                                        {notification.claim_id && (
                                            <span className="text-xs text-blue-600">
                                                Claim #{notification.claim_id}
                                            </span>
                                        )}
                                        <span className="text-xs text-gray-400">
                                            Type: {notification.type}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {notifications.length === 0 && (
                        <div className="px-6 py-8 text-center text-gray-500">
                            No notifications yet
                        </div>
                    )}
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-2">Total Notifications</h3>
                    <p className="text-3xl font-bold text-blue-600">{notifications.length}</p>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-2">Unread</h3>
                    <p className="text-3xl font-bold text-red-600">{unreadCount}</p>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-2">Connection</h3>
                    <p className="text-3xl font-bold text-green-600">
                        {connectionMethod.toUpperCase()}
                    </p>
                </div>
            </div>
        </div>
    );
};
