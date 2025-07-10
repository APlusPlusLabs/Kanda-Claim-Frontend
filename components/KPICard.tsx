import { useKPIs } from '@/hooks/useKPIs';
import { Progress } from '@radix-ui/react-progress';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import Link from 'next/link';

const KPICard = () => {
  const { kpiData, loading, error } = useKPIs();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Key Performance Indicators</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Key Performance Indicators</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-red-500">
          {error}
        </CardContent>
      </Card>
    );
  }

  const renderTrendIcon = (trend: 'up' | 'down', isGoodWhenUp: boolean = true) => {
    const isPositive = (trend === 'up' && isGoodWhenUp) || (trend === 'down' && !isGoodWhenUp);
    const Icon = trend === 'up' ? TrendingUp : TrendingDown;
    const colorClass = isPositive ? 'text-green-500' : 'text-red-500';
    
    return <Icon className={`h-3 w-3 mr-1 ${colorClass}`} />;
  };

  const formatChange = (change: number, suffix: string = '') => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change}${suffix}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Key Performance Indicators</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Average Processing Time */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm">Avg. Processing Time</span>
            <span className="text-sm font-medium">{kpiData?.avg_processing_time.current} days</span>
          </div>
          <Progress value={(kpiData?.avg_processing_time.current / 20) * 100} className="h-2" />
          <div className="flex items-center mt-1 text-xs">
            {renderTrendIcon(kpiData?.avg_processing_time.trend || 'up', false)}
            <span className={`font-medium ${kpiData?.avg_processing_time.trend === 'down' ? 'text-green-500' : 'text-red-500'}`}>
              {formatChange(kpiData?.avg_processing_time.change || 0, ' days')}
            </span>
            <span className="text-muted-foreground ml-1">from last quarter</span>
          </div>
        </div>

        {/* Fraud Detection Rate */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm">Fraud Detection Rate</span>
            <span className="text-sm font-medium">{kpiData?.fraud_detection_rate.current}%</span>
          </div>
          <Progress value={kpiData?.fraud_detection_rate.current * 10} className="h-2" />
          <div className="flex items-center mt-1 text-xs">
            {renderTrendIcon(kpiData?.fraud_detection_rate.trend || 'up', true)}
            <span className={`font-medium ${kpiData?.fraud_detection_rate.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
              {formatChange(kpiData?.fraud_detection_rate.change || 0, '%')}
            </span>
            <span className="text-muted-foreground ml-1">from last quarter</span>
          </div>
        </div>

        {/* Customer Satisfaction */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm">Customer Satisfaction</span>
            <span className="text-sm font-medium">{kpiData?.customer_satisfaction.current}%</span>
          </div>
          <Progress value={kpiData?.customer_satisfaction.current} className="h-2" />
          <div className="flex items-center mt-1 text-xs">
            {renderTrendIcon(kpiData?.customer_satisfaction.trend || 'up', true)}
            <span className={`font-medium ${kpiData?.customer_satisfaction.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
              {formatChange(kpiData?.customer_satisfaction.change || 0, '%')}
            </span>
            <span className="text-muted-foreground ml-1">from last quarter</span>
          </div>
        </div>

        <div className="pt-2">
          <Button variant="outline" size="sm" className="w-full" asChild title='View all KPI'>
            <Link href="/dashboard/insurer/analytics">View All KPIs</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default KPICard;