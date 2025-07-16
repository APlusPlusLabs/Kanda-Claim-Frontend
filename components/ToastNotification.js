import React, { useEffect, useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';

const ToastNotification = () => {
    const { notifications } = useNotifications();
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        const newNotifications = notifications.filter(n => {
            const isNew = Date.now() - new Date(n.created_at).getTime() < 5000; // 5 seconds
            return isNew && n.status === 'unread';
        });

        newNotifications.forEach(notification => {
            setToasts(prev => [...prev, { ...notification, id: `toast-${notification.id}` }]);
            
            // Remove toast after 5 seconds
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== `toast-${notification.id}`));
            }, 5000);
        });
    }, [notifications]);

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <div className="fixed top-4 right-4 space-y-2 z-50">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-80 max-w-md animate-slide-in"
                >
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h4 className="text-sm font-semibold text-gray-900">
                                {toast.title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                                {toast.description}
                            </p>
                        </div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="ml-2 text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};