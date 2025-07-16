import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Pusher from 'pusher-js';

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL;

export const useHybridNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [connectionStatus, setConnectionStatus] = useState('connecting');
    const [unreadCount, setUnreadCount] = useState(0);
    
    const { user, apiRequest } = useAuth();
    const pusherRef = useRef(null);
    const sseRef = useRef(null);
    const pollingIntervalRef = useRef(null);
    const lastCheckRef = useRef(new Date());
    
    // Connection priority: WebSocket -> SSE -> Polling
    const [connectionMethod, setConnectionMethod] = useState('websocket');

    // Add new notification
    const addNotification = useCallback((notification) => {
        setNotifications(prev => {
            // Avoid duplicates
            const exists = prev.find(n => n.id === notification.id);
            if (exists) return prev;
            
            const newNotifications = [notification, ...prev];
            
            // Show browser notification
            if (Notification.permission === 'granted') {
                new Notification(notification.title, {
                    body: notification.description,
                    icon: '/notification-icon.png',
                    tag: `notification-${notification.id}`
                });
            }
            
            return newNotifications;
        });
        
        // Update unread count
        setUnreadCount(prev => prev + 1);
    }, []);

    // Mark notification as read
    const markAsRead = useCallback(async (notificationId) => {
        try {
            await apiRequest(`${API_URL}notifications/${notificationId}/read`, "PATCH");
            
            setNotifications(prev => 
                prev.map(n => 
                    n.id === notificationId 
                        ? { ...n, status: 'read' }
                        : n
                )
            );
            
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }, [apiRequest]);

    // Load initial notifications
    const loadNotifications = useCallback(async () => {
        try {
            const response = await apiRequest(`${API_URL}notifications`, "GET");
            setNotifications(response.data || []);
            setUnreadCount(response.data?.filter(n => n.status === 'unread').length || 0);
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }, [apiRequest]);

    // WebSocket connection
    const connectWebSocket = useCallback(() => {
        if (!user) return;
        
        try {
            const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
                wsHost: process.env.NEXT_PUBLIC_PUSHER_HOST || '127.0.0.1',
                wsPort: process.env.NEXT_PUBLIC_PUSHER_PORT || 6001,
                forceTLS: false,
                disableStats: true,
                enabledTransports: ['ws', 'wss'],
                cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1',
            });

            pusherRef.current = pusher;

            // Subscribe to user-specific channel
            const userChannel = pusher.subscribe(`notifications.${user.id}`);
            
            // Subscribe to tenant-wide channel
            const tenantChannel = pusher.subscribe(`tenant.${user.tenant_id}.notifications`);

            const handleNotification = (data) => {
                if (data.target_user_id === user.id) {
                    addNotification(data);
                }
            };

            userChannel.bind('notification.created', handleNotification);
            tenantChannel.bind('notification.created', handleNotification);

            pusher.connection.bind('connected', () => {
                setConnectionStatus('connected');
                setConnectionMethod('websocket');
                console.log('WebSocket connected');
            });

            pusher.connection.bind('error', (error) => {
                console.error('WebSocket error:', error);
                setConnectionStatus('error');
                // Fallback to SSE
                setTimeout(() => connectSSE(), 2000);
            });

            pusher.connection.bind('disconnected', () => {
                setConnectionStatus('disconnected');
                console.log('WebSocket disconnected');
                // Fallback to SSE
                setTimeout(() => connectSSE(), 2000);
            });

        } catch (error) {
            console.error('WebSocket connection failed:', error);
            setConnectionStatus('error');
            // Fallback to SSE
            setTimeout(() => connectSSE(), 2000);
        }
    }, [user, addNotification]);

    // SSE connection
    const connectSSE = useCallback(() => {
        if (!user || connectionMethod === 'websocket') return;
        
        try {
            // Close existing SSE connection
            if (sseRef.current) {
                sseRef.current.close();
            }

            const eventSource = new EventSource(`${API_URL}notifications/stream`, {
                withCredentials: true
            });

            sseRef.current = eventSource;

            eventSource.onopen = () => {
                setConnectionStatus('connected');
                setConnectionMethod('sse');
                console.log('SSE connected');
            };

            eventSource.onmessage = (event) => {
                try {
                    const notification = JSON.parse(event.data);
                    addNotification(notification);
                } catch (error) {
                    console.error('Error parsing SSE message:', error);
                }
            };

            eventSource.onerror = (error) => {
                console.error('SSE error:', error);
                setConnectionStatus('error');
                eventSource.close();
                
                // Fallback to polling
                setTimeout(() => startPolling(), 2000);
            };

        } catch (error) {
            console.error('SSE connection failed:', error);
            setConnectionStatus('error');
            // Fallback to polling
            setTimeout(() => startPolling(), 2000);
        }
    }, [user, addNotification, connectionMethod]);

    // Polling fallback
    const startPolling = useCallback(() => {
        if (connectionMethod === 'websocket' || connectionMethod === 'sse') return;
        
        const pollNotifications = async () => {
            try {
                const response = await apiRequest(`${API_URL}notifications/unread`, "GET", {
                    since: lastCheckRef.current.toISOString()
                });
                
                if (response.notifications?.length > 0) {
                    response.notifications.forEach(notification => {
                        addNotification(notification);
                    });
                }
                
                lastCheckRef.current = new Date();
                setConnectionStatus('connected');
                setConnectionMethod('polling');
                
            } catch (error) {
                console.error('Error polling notifications:', error);
                setConnectionStatus('error');
            }
        };

        // Initial poll
        pollNotifications();
        
        // Set up interval (every 10 seconds)
        pollingIntervalRef.current = setInterval(pollNotifications, 10000);
        
        console.log('Started polling for notifications');
    }, [addNotification, apiRequest, connectionMethod]);

    // Initialize connection
    useEffect(() => {
        if (!user) return;

        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        // Load initial notifications
        loadNotifications();

        // Try connections in order: WebSocket -> SSE -> Polling
        connectWebSocket();

        // Cleanup
        return () => {
            if (pusherRef.current) {
                pusherRef.current.disconnect();
            }
            if (sseRef.current) {
                sseRef.current.close();
            }
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, [user, loadNotifications, connectWebSocket]);

    // Retry connection
    const retryConnection = useCallback(() => {
        setConnectionStatus('connecting');
        
        // Try WebSocket first
        setConnectionMethod('websocket');
        connectWebSocket();
        
        // If WebSocket fails, try SSE after 3 seconds
        setTimeout(() => {
            if (connectionStatus !== 'connected') {
                setConnectionMethod('sse');
                connectSSE();
            }
        }, 3000);
        
        // If SSE fails, start polling after 6 seconds
        setTimeout(() => {
            if (connectionStatus !== 'connected') {
                setConnectionMethod('polling');
                startPolling();
            }
        }, 6000);
    }, [connectionStatus, connectWebSocket, connectSSE, startPolling]);

    return {
        notifications,
        unreadCount,
        connectionStatus,
        connectionMethod,
        markAsRead,
        retryConnection,
        loadNotifications
    };
};