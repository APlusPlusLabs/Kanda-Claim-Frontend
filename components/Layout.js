import React from 'react';
import { NotificationProvider } from '../contexts/NotificationContext';
import NotificationBell from './NotificationBell';
import ToastNotification from './ToastNotification';

const Layout = ({ children }) => {
    return (
        <NotificationProvider>
            <div className="min-h-screen bg-gray-100">
                {/* Header */}
                <header className="bg-white shadow-sm border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center">
                                <h1 className="text-xl font-semibold text-gray-900">
                                    Insurance Dashboard
                                </h1>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                                <NotificationBell />
                                {/* Other header items */}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    {children}
                </main>

                {/* Toast Notifications */}
                <ToastNotification />
            </div>
        </NotificationProvider>
    );
};
