"use client"

import { useState, useEffect, JSX } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { DatePickerWithRange } from "@/components/date-range-picker"
import {
  Building2,
  BarChart3,
  PieChart,
  LineChart,
  Download,
  Filter,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Calendar,
  ArrowUpDown,
} from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/lib/auth-provider"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Line,
  Bar,
  Pie,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  BarChart,
  PieChart as RechartsPieChart,
  Area,
  ComposedChart,
} from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"

// API base URL (replace with your actual API base URL)
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/"

// Colors for charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]



interface ClaimsByMonth {
  month: string;
  claims: number;
  amount: number;
}

interface ClaimsByType {
  type: string;
  count: number;
  percentage: string;
}

interface ClaimsByStatus {
  status: string;
  count: number;
  percentage: string;
  color: string;
}

interface TopGarages {
  name: string;
  claims: number;
  amount: number;
}

interface MonthlyComparison {
  month: string;
  thisYear: number;
  lastYear: number;
}

interface SettlementTime {
  name: string;
  value: number;
}

interface FraudMetrics {
  metric: string;
  value: number;
}

interface CustomerSatisfaction {
  month: string;
  satisfaction: number;
}

// interface SummaryData {
//   total_count: number;
//   total_amount: number;
//   total_approved_amount: number;
//   average_claim_value: number;
//   approval_rate: number;
//   total_count_change?: number;
//   total_payout_change?: number;
//   avg_claim_value_change?: number;
//   approval_rate_change?: number;
//   avg_processing_time: number;
//   claims_per_agent: number;
//   first_response_time: number;
//   avg_processing_time_change?: number;
//   claims_per_agent_change?: number;
//   first_response_time_change?: number;
//   stages?: {
//     initial_review: number;
//     initial_review_prev: number;
//     assessment: number;
//     assessment_prev: number;
//     approval: number;
//     approval_prev: number;
//     repair: number;
//     repair_prev: number;
//     settlement: number;
//     settlement_prev: number;
//   };
// }
interface SummaryData {
  total_count: number;
  total_amount: number;
  total_approved_amount: number;
  average_claim_value: number;
  approval_rate: number;
  total_count_change: number; // Add as required
  total_payout_change: number; // Add as required
  avg_claim_value_change: number; // Add as required
  approval_rate_change: number; // Add as required
  avg_processing_time: number;
  claims_per_agent: number;
  first_response_time: number;
  avg_processing_time_change: number; // Add as required
  claims_per_agent_change: number; // Add as required
  first_response_time_change: number; // Add as required
  stages?: {
    initial_review: number;
    initial_review_prev: number;
    assessment: number;
    assessment_prev: number;
    approval: number;
    approval_prev: number;
    repair: number;
    repair_prev: number;
    settlement: number;
    settlement_prev: number;
  };
}
interface AnalyticsData {
  claimsByMonth: ClaimsByMonth[];
  claimsByType: ClaimsByType[];
  claimsByStatus: ClaimsByStatus[];
  topGarages: TopGarages[];
  monthlyComparison: MonthlyComparison[];
  settlementTime: SettlementTime[];
  fraudMetrics: FraudMetrics[];
  customerSatisfaction: CustomerSatisfaction[];
  summary: SummaryData;
}

interface User {
  firstName?: string;
  lastName?: string;
  tenant_id?: number;
  role?: { name: string };
}

interface NavigationItem {
  name: string;
  href: string;
  icon: JSX.Element;
}

interface DashboardLayoutProps {
  user: {
    name: string;
    role: string;
    avatar: string;
  };
  navigation: NavigationItem[];
  children: React.ReactNode;
}

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface DatePickerWithRangeProps {
  className?: string;
  onChange?: (range: DateRange) => void;
  value?: DateRange;
}
// Type for apiRequest hook
type ApiRequest = (
  api_url: string,
  data?: any,
  method?: "get" | "post" | "put" | "delete"
) => Promise<any>;
export default function AnalyticsPage() {
  const { user, apiRequest, logout } = useAuth();
  const [dateRange, setDateRange] = useState({
    from: new Date(2025, 0, 1),
    to: new Date(),
  })
  const [period, setPeriod] = useState("year")
  const [sortField, setSortField] = useState("claims")
  const [sortDirection, setSortDirection] = useState("desc")
  const [analyticsData, setAnalyticsData] = useState({
    claimsByMonth: [],
    claimsByType: [],
    claimsByStatus: [],
    topGarages: [],
    monthlyComparison: [],
    settlementTime: [],
    fraudMetrics: [],
    customerSatisfaction: [],
    summary: {
      total_count: 0,
      total_amount: 0,
      total_approved_amount: 0,
      average_claim_value: 0,
      approval_rate: 0,
      avg_processing_time: 0,
      claims_per_agent: 0,
      first_response_time: 0,
    },
  })
  const [isLoading, setIsLoading] = useState(true)

  // Format date for API
  const formatDate = (date: Date) => date.toISOString().split("T")[0]

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true)
      try {
        
        const dfrm = "2025-01-01"
        const dto = "2025-05-17"
        // const dfrm = formatDate(dateRange.from)
        // const dto = formatDate(dateRange.to)
        // Fetch summary data
        const summaryResponse = await apiRequest(
          `${API_URL}claims/summary?start_date=${dfrm}&end_date=${dto}`
        )
        
        // Fetch claims by month
        const claimsByMonthResponse = await apiRequest(
          `${API_URL}claims/analytics?group_by=created_at&start_date=${dfrm}&end_date=${dto}`
        )
        
        // Fetch claims by type
        const claimsByTypeResponse = await apiRequest(
          `${API_URL}claims/analytics?group_by=claim_type_id&start_date=${dfrm}&end_date=${dto}`
        )
        
        // Fetch claims by status
        const claimsByStatusResponse = await apiRequest(
          `${API_URL}claims/analytics?group_by=status&start_date=${dfrm}&end_date=${dto}`
        )
        
        // Fetch top garages (assuming garage data is tied to assessments or claims)
        const topGaragesResponse = await apiRequest(
          `${API_URL}claims/analytics?group_by=garage&start_date=${dfrm}&end_date=${dto}`
        )
        
        // Fetch monthly comparison (current vs. previous year)
        const monthlyComparisonResponse = await apiRequest(
          `${API_URL}claims/analytics?group_by=created_at&compare_year=true&start_date=${dfrm}&end_date=${dto}`
        )
        
        // Fetch settlement time by claim type
        const settlementTimeResponse = await apiRequest(
          `${API_URL}claims/analytics?group_by=claim_type_id&metric=settlement_time&start_date=${dfrm}&end_date=${dto}`
        )
        
        // Fetch fraud metrics (assuming a separate endpoint or static for now)
        const fraudMetricsResponse = await apiRequest(
          `${API_URL}claims/analytics?group_by=fraud_metrics&start_date=${dfrm}&end_date=${dto}`
        )
        
        // Fetch customer satisfaction
        const customerSatisfactionResponse = await apiRequest(
          `${API_URL}claims/analytics?group_by=created_at&metric=customer_satisfaction&start_date=${dfrm}&end_date=${dto}`
        )

        // Process data
        const claimsByMonth = claimsByMonthResponse.map((item: { created_at: string | number | Date; count: any; total_amount: any }) => ({
          month: new Date(item.created_at).toLocaleString("default", { month: "short" }),
          claims: item.count,
          amount: item.total_amount,
        }))

        const claimsByType = claimsByTypeResponse.map((item: { claim_type_name: any; count: number }, index: number) => ({
          type: item.claim_type_name || `Type ${index + 1}`,
          count: item.count,
          percentage: ((item.count / summaryResponse.total_count) * 100).toFixed(1),
        }))

        const claimsByStatus = claimsByStatusResponse.map((item: { status: any; count: number }, index: number) => ({
          status: item.status,
          count: item.count,
          percentage: ((item.count / summaryResponse.total_count) * 100).toFixed(1),
          color: COLORS[index % COLORS.length],
        }))

        const topGarages = topGaragesResponse.map((item: { garage_name: any; garage_id: any; count: any; total_amount: any }) => ({
          name: item.garage_name || `Garage ${item.garage_id}`,
          claims: item.count,
          amount: item.total_amount,
        }))

        const monthlyComparison = monthlyComparisonResponse.map((item: { created_at: string | number | Date; this_year_count: any; count: any; last_year_count: any }) => ({
          month: new Date(item.created_at).toLocaleString("default", { month: "short" }),
          thisYear: item.this_year_count || item.count,
          lastYear: item.last_year_count || 0,
        }))

        const settlementTime = settlementTimeResponse.map((item: { claim_type_name: any; claim_type_id: any; avg_settlement_days: any }) => ({
          name: item.claim_type_name || `Type ${item.claim_type_id}`,
          value: item.avg_settlement_days || 0,
        }))

        const fraudMetrics = fraudMetricsResponse.length > 0 ? fraudMetricsResponse : [
          { metric: "Risk Score", value: 75 },
          { metric: "Detection Rate", value: 85 },
          { metric: "False Positives", value: 12 },
          { metric: "Investigation Time", value: 65 },
          { metric: "Recovery Rate", value: 80 },
        ]

        const customerSatisfaction = customerSatisfactionResponse.map((item: { created_at: string | number | Date; avg_satisfaction: any }) => ({
          month: `2025-${new Date(item.created_at).toLocaleString("default", { month: "short" })}`,
          satisfaction: item.avg_satisfaction || 90,
        }))

        setAnalyticsData({
          claimsByMonth,
          claimsByType,
          claimsByStatus,
          topGarages,
          monthlyComparison,
          settlementTime,
          fraudMetrics,
          customerSatisfaction,
          summary: {
            total_count: summaryResponse.total_count || 0,
            total_amount: summaryResponse.total_amount || 0,
            total_approved_amount: summaryResponse.total_approved_amount || 0,
            average_claim_value: summaryResponse.total_count ? (summaryResponse.total_amount / summaryResponse.total_count) : 0,
            approval_rate: summaryResponse.by_status.find((s: { status: string }) => s.status === "Approved")?.percentage || 0,
            avg_processing_time: summaryResponse.avg_processing_time || 12,
            claims_per_agent: summaryResponse.claims_per_agent || 24,
            first_response_time: summaryResponse.first_response_time || 4.5,
          },
        })
      } catch (error) {
        console.error("Error fetching analytics:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [dateRange, period])

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Sort garage data based on sort field and direction
  const sortedGarageData = [...analyticsData.topGarages].sort((a, b) => {
    const aValue = a[sortField as keyof typeof a]
    const bValue = b[sortField as keyof typeof b]
    return sortDirection === "asc" ? (aValue > bValue ? 1 : -1) : aValue < bValue ? 1 : -1
  })

  // Update date range from DatePicker
  // const handleDateRangeChange = (range: { from: any; to: any }) => {
  //   setDateRange({
  //     from: range.from || new Date(2025, 0, 1),
  //     to: range.to || new Date(),
  //   })
  // }
  // app/dashboard/insurer/analytics/page.tsx
const handleDateRangeChange = (range: DateRange) => {
  setDateRange({
    from: range.from || new Date(2025, 0, 1),
    to: range.to || new Date(),
  });
};

  if (isLoading) {
    return <div>Loading analytics...</div>
  }

  return (
    <DashboardLayout
      user={{
        name: user?.first_name ? `${user.first_name} ${user.last_name}` : "Sanlam Alianz",
        role: user?.role.name+" @ "+user?.tenant.name,
        avatar: "/placeholder.svg?height=40&width=40",
      }}
      navigation={[
        { name: "Dashboard", href: "/dashboard/insurer", icon: <Building2 className="h-5 w-5" /> },
        { name: "Analytics", href: "/dashboard/insurer/analytics", icon: <BarChart3 className="h-5 w-5" /> },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground mt-2">Comprehensive insights into claims and performance</p>
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export Report
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-muted p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Filters:</span>
          </div>
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <DatePickerWithRange className="w-full md:w-auto" />
            <Select defaultValue={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Claims</CardTitle>
              <CardDescription className="text-2xl font-bold">{analyticsData.summary.total_count.toLocaleString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                <span className={analyticsData.summary.total_count >= 0 ? "text-green-500" : "text-red-500" + " font-medium"}>
                  {analyticsData.summary.total_count >= 0 ? "↑" : "↓"} {Math.abs(analyticsData.summary.total_count || 0).toFixed(1)}%
                </span> from previous period
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Payout</CardTitle>
              <CardDescription className="text-2xl font-bold">{analyticsData.summary.total_approved_amount.toLocaleString()} RWF</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                <span className={analyticsData.summary.total_approved_amount >= 0 ? "text-green-500" : "text-red-500" + " font-medium"}>
                  {analyticsData.summary.total_approved_amount >= 0 ? "↑" : "↓"} {Math.abs(analyticsData.summary.total_approved_amount || 0).toFixed(1)}%
                </span> from previous period
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average Claim Value</CardTitle>
              <CardDescription className="text-2xl font-bold">{Math.round(analyticsData.summary.average_claim_value).toLocaleString()} RWF</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                <span className={analyticsData.summary.average_claim_value >= 0 ? "text-green-500" : "text-red-500" + " font-medium"}>
                  {analyticsData.summary.average_claim_value >= 0 ? "↑" : "↓"} {Math.abs(analyticsData.summary.average_claim_value || 0).toFixed(1)}%
                </span> from previous period
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Approval Rate</CardTitle>
              <CardDescription className="text-2xl font-bold">{analyticsData.summary.approval_rate.toFixed(1)}%</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                <span className={analyticsData.summary.approval_rate >= 0 ? "text-green-500" : "text-red-500" + " font-medium"}>
                  {analyticsData.summary.approval_rate >= 0 ? "↑" : "↓"} {Math.abs(analyticsData.summary.approval_rate || 0).toFixed(1)}%
                </span> from previous period
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="claims">
          <TabsList>
            <TabsTrigger value="claims">Claims Analysis</TabsTrigger>
            <TabsTrigger value="financial">Financial Analysis</TabsTrigger>
            <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="claims" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <LineChart className="h-5 w-5 mr-2" /> Claims by Month
                  </CardTitle>
                  <CardDescription>Number of claims processed each month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analyticsData.claimsByMonth} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                        <XAxis dataKey="month" tick={{ fill: "#888888" }} axisLine={{ stroke: "#e0e0e0" }} />
                        <YAxis
                          yAxisId="left"
                          orientation="left"
                          tickFormatter={(value) => `${value}`}
                          domain={[0, "auto"]}
                          tick={{ fill: "#888888" }}
                          axisLine={{ stroke: "#e0e0e0" }}
                          label={{
                            value: "Claims",
                            angle: -90,
                            position: "insideLeft",
                            offset: -5,
                            fill: "#888888",
                            fontSize: 12,
                          }}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                          domain={[0, "auto"]}
                          tick={{ fill: "#888888" }}
                          axisLine={{ stroke: "#e0e0e0" }}
                          label={{
                            value: "Amount (RWF)",
                            angle: 90,
                            position: "insideRight",
                            offset: 5,
                            fill: "#888888",
                            fontSize: 12,
                          }}
                        />
                        <Tooltip
                          formatter={(value, name) => {
                            if (name === "claims") return [`${value} claims`, "Claims"]
                            if (name === "amount") return [`${Number(value).toLocaleString()} RWF`, "Amount"]
                            return [value, name]
                          }}
                          labelFormatter={(label) => `Month: ${label}`}
                          contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                            borderRadius: "6px",
                            border: "1px solid #e0e0e0",
                          }}
                        />
                        <Legend wrapperStyle={{ paddingTop: 10 }} />
                        <Bar yAxisId="left" dataKey="claims" fill="#8884d8" radius={[4, 4, 0, 0]} name="Claims" />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="amount"
                          stroke="#82ca9d"
                          strokeWidth={3}
                          dot={{ r: 4, strokeWidth: 2 }}
                          activeDot={{ r: 6, strokeWidth: 2 }}
                          name="Amount (RWF)"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-6 space-y-2">
                    <div className="grid grid-cols-4 text-sm font-medium">
                      <div>Month</div>
                      <div className="text-right">Claims</div>
                      <div className="text-right">Amount (RWF)</div>
                      <div className="text-right">Avg. Value</div>
                    </div>
                    {analyticsData.claimsByMonth.slice(0, 5).map((item) => (
                      <div key={item.month} className="grid grid-cols-4 text-sm py-1 border-b border-gray-100">
                        <div className="font-medium">{item.month}</div>
                        <div className="text-right">{item.claims}</div>
                        <div className="text-right">{item.amount.toLocaleString()}</div>
                        <div className="text-right">{Math.round(item.amount / item.claims).toLocaleString()}</div>
                      </div>
                    ))}
                    <div className="pt-2">
                      <Button variant="outline" size="sm" className="w-full">
                        View All Months
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2" /> Claims by Type
                  </CardTitle>
                  <CardDescription>Distribution of claims by incident type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={analyticsData.claimsByType}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="percentage"
                          nameKey="type"
                          label={({ type, percentage }) => `${type}: ${percentage}%`}
                        >
                          {analyticsData.claimsByType.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="grid grid-cols-3 text-sm font-medium">
                      <div>Type</div>
                      <div className="text-right">Count</div>
                      <div className="text-right">Percentage</div>
                    </div>
                    {analyticsData.claimsByType.map((item) => (
                      <div key={item.type} className="grid grid-cols-3 text-sm">
                        <div>{item.type}</div>
                        <div className="text-right">{item.count}</div>
                        <div className="text-right">{item.percentage}%</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2" /> Claims by Status
                  </CardTitle>
                  <CardDescription>Current status of all claims</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={analyticsData.claimsByStatus}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="percentage"
                          nameKey="status"
                          label={({ status, percentage }) => `${status}: ${percentage}%`}
                        >
                          {analyticsData.claimsByStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="grid grid-cols-3 text-sm font-medium">
                      <div>Status</div>
                      <div className="text-right">Count</div>
                      <div className="text-right">Percentage</div>
                    </div>
                    {analyticsData.claimsByStatus.map((item) => (
                      <div key={item.status} className="grid grid-cols-3 text-sm">
                        <div>{item.status}</div>
                        <div className="text-right">{item.count}</div>
                        <div className="text-right">{item.percentage}%</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" /> Top Garages
                  </CardTitle>
                  <CardDescription>Garages with the most claims</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={sortedGarageData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" width={100} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="claims" fill="#8884d8" name="Claims" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="grid grid-cols-3 text-sm font-medium">
                      <div>
                        <Button variant="ghost" className="p-0 font-semibold" onClick={() => handleSort("name")}>
                          Garage
                          {sortField === "name" && (
                            <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                          )}
                        </Button>
                      </div>
                      <div className="text-right">
                        <Button variant="ghost" className="p-0 font-semibold" onClick={() => handleSort("claims")}>
                          Claims
                          {sortField === "claims" && (
                            <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                          )}
                        </Button>
                      </div>
                      <div className="text-right">
                        <Button variant="ghost" className="p-0 font-semibold" onClick={() => handleSort("amount")}>
                          Amount (RWF)
                          {sortField === "amount" && (
                            <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                          )}
                        </Button>
                      </div>
                    </div>
                    {sortedGarageData.map((item) => (
                      <div key={item.name} className="grid grid-cols-3 text-sm">
                        <div className="truncate">{item.name}</div>
                        <div className="text-right">{item.claims}</div>
                        <div className="text-right">{item.amount.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <LineChart className="h-5 w-5 mr-2" /> Monthly Comparison
                  </CardTitle>
                  <CardDescription>Claims comparison with previous year</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 w-full">
                    <ChartContainer
                      config={{
                        thisYear: {
                          label: "This Year",
                          color: "hsl(var(--chart-1))",
                        },
                        lastYear: {
                          label: "Last Year",
                          color: "hsl(var(--chart-2))",
                        },
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsData.monthlyComparison} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend />
                          <Bar dataKey="thisYear" fill="var(--color-thisYear)" name="This Year" />
                          <Bar dataKey="lastYear" fill="var(--color-lastYear)" name="Last Year" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                  <div className="mt-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Month</TableHead>
                          <TableHead className="text-right">This Year</TableHead>
                          <TableHead className="text-right">Last Year</TableHead>
                          <TableHead className="text-right">Change</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {analyticsData.monthlyComparison.slice(0, 6).map((item) => {
                          const change = item.lastYear ? ((item.thisYear - item.lastYear) / item.lastYear) * 100 : 0
                          return (
                            <TableRow key={item.month}>
                              <TableCell>{item.month}</TableCell>
                              <TableCell className="text-right">{item.thisYear}</TableCell>
                              <TableCell className="text-right">{item.lastYear}</TableCell>
                              <TableCell className="text-right">
                                <span className={change >= 0 ? "text-green-500" : "text-red-500"}>
                                  {change >= 0 ? "+" : ""}
                                  {change.toFixed(1)}%
                                </span>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" /> Settlement Time by Claim Type
                  </CardTitle>
                  <CardDescription>Average days to settle claims by type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analyticsData.settlementTime} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis label={{ value: "Days", angle: -90, position: "insideLeft" }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#8884d8" name="Days to Settle">
                          {analyticsData.settlementTime.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Claim Type</TableHead>
                          <TableHead className="text-right">Avg. Days to Settle</TableHead>
                          <TableHead className="text-right">Benchmark</TableHead>
                          <TableHead className="text-right">Performance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {analyticsData.settlementTime.map((item) => {
                          const benchmark = item.name === "Theft" ? 30 : item.name === "Natural Disaster" ? 25 : 15
                          const performance = ((benchmark - item.value) / benchmark) * 100
                          return (
                            <TableRow key={item.name}>
                              <TableCell>{item.name}</TableCell>
                              <TableCell className="text-right">{item.value}</TableCell>
                              <TableCell className="text-right">{benchmark}</TableCell>
                              <TableCell className="text-right">
                                <span className={performance >= 0 ? "text-green-500" : "text-red-500"}>
                                  {performance >= 0 ? "+" : ""}
                                  {performance.toFixed(1)}%
                                </span>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" /> Financial Trends
                </CardTitle>
                <CardDescription>Monthly claim amounts and payouts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={analyticsData.claimsByMonth} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorPayout" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" />
                      <YAxis
                        yAxisId="left"
                        tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                        domain={[0, "dataMax + 1000000"]}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        tickFormatter={(value) => `${value}`}
                        domain={[0, "dataMax * 0.8"]}
                      />
                      <Tooltip
                        formatter={(value, name) => {
                          if (name === "claims") return [`${value} claims`, "Claims"]
                          if (name === "amount") return [`${Number(value).toLocaleString()} RWF`, "Amount"]
                          return [value, name]
                        }}
                        labelFormatter={(label) => `Month: ${label}`}
                      />
                      <Legend />
                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="amount"
                        stroke="#8884d8"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorAmount)"
                        name="Claim Amount (RWF)"
                      />
                      <Bar yAxisId="right" dataKey="claims" barSize={20} fill="#82ca9d" name="Number of Claims" />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="amount"
                        stroke="#ff7300"
                        strokeWidth={3}
                        dot={{ r: 5 }}
                        activeDot={{ r: 8 }}
                        name="Trend Line"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Total Claims Amount</h4>
                    <div className="text-2xl font-bold">{analyticsData.summary.total_amount.toLocaleString()} RWF</div>
                    <div className="flex items-center text-sm">
                      <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                      <span className="text-green-500 font-medium">+{analyticsData.summary.total_amount?.toFixed(1) || 0}%</span>
                      <span className="text-muted-foreground ml-1">from last year</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Average Claim Value</h4>
                    <div className="text-2xl font-bold">{Math.round(analyticsData.summary.average_claim_value).toLocaleString()} RWF</div>
                    <div className="flex items-center text-sm">
                      <TrendingDown className="h-4 w-4 mr-1 text-red-500" />
                      <span className="text-red-500 font-medium">{analyticsData.summary.average_claim_value?.toFixed(1) || 0}%</span>
                      <span className="text-muted-foreground ml-1">from last year</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Projected Annual Payout</h4>
                    <div className="text-2xl font-bold">{(analyticsData.summary.total_approved_amount * 1.2).toLocaleString()} RWF</div>
                    <div className="flex items-center text-sm">
                      <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                      <span className="text-green-500 font-medium">+{analyticsData.summary.total_approved_amount?.toFixed(1) || 0}%</span>
                      <span className="text-muted-foreground ml-1">from last year</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <LineChart className="h-5 w-5 mr-2" /> Customer Satisfaction
                  </CardTitle>
                  <CardDescription>Monthly customer satisfaction scores</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mt-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Month</TableHead>
                          <TableHead className="text-right">Satisfaction</TableHead>
                          <TableHead className="text-right">Change</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {analyticsData.customerSatisfaction.slice(0, 6).map((item, index) => {
                          const prevMonth =
                            index > 0 ? analyticsData.customerSatisfaction[index - 1].satisfaction : item.satisfaction
                          const change = prevMonth ? ((item.satisfaction - prevMonth) / prevMonth) * 100 : 0
                          return (
                            <TableRow key={item.month}>
                              <TableCell>{item.month}</TableCell>
                              <TableCell className="text-right">{item.satisfaction}%</TableCell>
                              <TableCell className="text-right">
                                <span className={change >= 0 ? "text-green-500" : "text-red-500"}>
                                  {change >= 0 ? "+" : ""}
                                  {change.toFixed(1)}%
                                </span>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Current Satisfaction</span>
                      <span className="text-sm font-medium">{analyticsData.customerSatisfaction[analyticsData.customerSatisfaction.length - 1]?.satisfaction || 0}%</span>
                    </div>
                    <Progress value={analyticsData.customerSatisfaction[analyticsData.customerSatisfaction.length - 1]?.satisfaction || 0} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" /> Fraud Detection Metrics
                  </CardTitle>
                  <CardDescription>Key fraud detection performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mt-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Metric</TableHead>
                          <TableHead className="text-right">Value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {analyticsData.fraudMetrics.map((item) => (
                          <TableRow key={item.metric}>
                            <TableCell>{item.metric}</TableCell>
                            <TableCell className="text-right">{item.value}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="mt-4 space-y-4">
                    {analyticsData.fraudMetrics.slice(0, 2).map((metric) => (
                      <div key={metric.metric} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{metric.metric}</span>
                          <span className="text-sm font-medium">{metric.value}%</span>
                        </div>
                        <Progress value={metric.value} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" /> Processing Efficiency
                </CardTitle>
                <CardDescription>Claims processing time and efficiency metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Avg. Processing Time</h4>
                    <div className="text-2xl font-bold">{analyticsData.summary.avg_processing_time} days</div>
                    <div className="flex items-center text-sm">
                      <TrendingDown className="h-4 w-4 mr-1 text-green-500" />
                      <span className="text-green-500 font-medium">{analyticsData.summary.avg_processing_time_change?.toFixed(1) || 0} days</span>
                      <span className="text-muted-foreground ml-1">from last quarter</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Claims per Agent</h4>
                    <div className="text-2xl font-bold">{analyticsData.summary.claims_per_agent} claims</div>
                    <div className="flex items-center text-sm">
                      <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                      <span className="text-green-500 font-medium">+{analyticsData.summary.claims_per_agent_change?.toFixed(1) || 0} claims</span>
                      <span className="text-muted-foreground ml-1">from last quarter</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">First Response Time</h4>
                    <div className="text-2xl font-bold">{analyticsData.summary.first_response_time} hours</div>
                    <div className="flex items-center text-sm">
                      <TrendingDown className="h-4 w-4 mr-1 text-green-500" />
                      <span className="text-green-500 font-medium">{analyticsData.summary.first_response_time_change?.toFixed(1) || 0} hours</span>
                      <span className="text-muted-foreground ml-1">from last quarter</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Stage</TableHead>
                        <TableHead className="text-right">Current (days)</TableHead>
                        <TableHead className="text-right">Previous (days)</TableHead>
                        <TableHead className="text-right">Change</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        { stage: "Initial Review", current: analyticsData.summary.stages?.initial_review || 1.2, previous: analyticsData.summary.stages?.initial_review_prev || 1.8 },
                        { stage: "Assessment", current: analyticsData.summary.stages?.assessment || 3.5, previous: analyticsData.summary.stages?.assessment_prev || 4.2 },
                        { stage: "Approval", current: analyticsData.summary.stages?.approval || 2.1, previous: analyticsData.summary.stages?.approval_prev || 2.8 },
                        { stage: "Repair", current: analyticsData.summary.stages?.repair || 4.2, previous: analyticsData.summary.stages?.repair_prev || 5.1 },
                        { stage: "Settlement", current: analyticsData.summary.stages?.settlement || 1.0, previous: analyticsData.summary.stages?.settlement_prev || 1.6 },
                      ].map((item) => {
                        const change = item.previous ? ((item.previous - item.current) / item.previous) * 100 : 0
                        return (
                          <TableRow key={item.stage}>
                            <TableCell>{item.stage}</TableCell>
                            <TableCell className="text-right">{item.current}</TableCell>
                            <TableCell className="text-right">{item.previous}</TableCell>
                            <TableCell className="text-right">
                              <span className={change >= 0 ? "text-green-500" : "text-red-500"}>
                                {change >= 0 ? "+" : ""}
                                {change.toFixed(1)}%
                              </span>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}