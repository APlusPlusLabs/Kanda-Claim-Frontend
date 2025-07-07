// hooks/useKPIs.ts
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-provider';

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL || "";
interface KPIData {
    avg_processing_time: {
        current: number;
        previous: number;
        change: number;
        change_percent: number;
        trend: 'up' | 'down';
    };
    fraud_detection_rate: {
        current: number;
        previous: number;
        change: number;
        trend: 'up' | 'down';
    };
    customer_satisfaction: {
        current: number;
        previous: number;
        change: number;
        trend: 'up' | 'down';
    };
    last_updated: string;
}

export const useKPIs = () => {
    const { user, apiRequest } = useAuth()
    const [kpiData, setKpiData] = useState<KPIData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchKPIs = async () => {
        try {
            setLoading(true);
            const response = await apiRequest(`${API_URL}kpis/${user.tenant_id}/dashboard`, 'GET');
            setKpiData(response);
            setError(null);
        } catch (err) {
            setError('Failed to fetch KPI data');
            console.error('KPI fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKPIs();
    }, []);

    return { kpiData, loading, error, refetch: fetchKPIs };
};