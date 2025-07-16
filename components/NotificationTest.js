import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const NotificationTest = () => {
    const { apiRequest } = useAuth();
    const API_URL = process.env.NEXT_PUBLIC_APP_API_URL;

    const testNotification = async (type) => {
        try {
            const testData = {
                type: type,
                title: `Test ${type} Notification`,
                description: `This is a test ${type} notification sent at ${new Date().toLocaleString()}`,
                claim_id: 1,
                status: 'unread',
                target_roles: ['insurer', 'assessor'],
                metadata: {
                    test: true,
                    timestamp: new Date().toISOString()
                }
            };

            await apiRequest(`${API_URL}notifications/test`, "POST", testData);
            console.log(`Test ${type} notification sent`);
        } catch (error) {
            console.error('Error sending test notification:', error);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Test Notifications</h3>
            <div className="space-x-4">
                <button
                    onClick={() => testNotification('claim_submitted')}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Test Claim Submitted
                </button>
                <button
                    onClick={() => testNotification('claim_approved')}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                    Test Claim Approved
                </button>
                <button
                    onClick={() => testNotification('assessment_required')}
                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                    Test Assessment Required
                </button>
                <button
                    onClick={() => testNotification('urgent_review')}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                    Test Urgent Review
                </button>
            </div>
        </div>
    );
};

export default NotificationTest;