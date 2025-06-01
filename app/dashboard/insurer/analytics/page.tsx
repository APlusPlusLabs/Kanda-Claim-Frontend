"use client";

import { useState, useEffect, SetStateAction } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/date-range-picker";
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
} from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";
import { useAuth } from "@/lib/auth-provider";
import { useToast } from "@/components/ui/use-toast";
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
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

// Static data for unavailable datasets
const fraudMetricsData = [
  { metric: "Risk Score", value: 75 },
  { metric: "Detection Rate", value: 85 },
  { metric: "False Positives", value: 12 },
  { metric: "Investigation Time", value: 65 },
  { metric: "Recovery Rate", value: 80 },
];

const customerSatisfactionData = [
  { month: "Jan", satisfaction: 85 },
  { month: "Feb", satisfaction: 87 },
  { month: "Mar", satisfaction: 84 },
  { month: "Apr", satisfaction: 86 },
  { month: "May", satisfaction: 88 },
  { month: "Jun", satisfaction: 90 },
  { month: "Jul", satisfaction: 92 },
  { month: "Aug", satisfaction: 91 },
  { month: "Sep", satisfaction: 93 },
  { month: "Oct", satisfaction: 92 },
  { month: "Nov", satisfaction: 94 },
  { month: "Dec", satisfaction: 95 },
].map((item) => ({ ...item, month: `2025-${item.month}` }));

const processingEfficiencyData = [
  { stage: "Initial Review", current: 1.2, previous: 1.8 },
  { stage: "Assessment", current: 3.5, previous: 4.2 },
  { stage: "Approval", current: 2.1, previous: 2.8 },
  { stage: "Repair", current: 4.2, previous: 5.1 },
  { stage: "Settlement", current: 1.0, previous: 1.6 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL || "";
export default function AnalyticsPage() {
  const { user, apiRequest } = useAuth()
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState({
    from: new Date(2025, 0, 1),
    to: new Date(),
  });
  const [period, setPeriod] = useState("year");
  const [sortField, setSortField] = useState("claims");
  const [sortDirection, setSortDirection] = useState("desc");
  const [claimsByMonth, setClaimsByMonth] = useState<any[]>([]);
  const [claimsByType, setClaimsByType] = useState<any[]>([]);
  const [claimsByStatus, setClaimsByStatus] = useState<any[]>([]);
  const [topGarages, setTopGarages] = useState<any[]>([]);
  const [monthlyComparison, setMonthlyComparison] = useState<any[]>([]);
  const [settlementTime, setSettlementTime] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    totalClaims: { value: 0, change: 0 },
    totalPayout: { value: 0, change: 0 },
    avgClaimValue: { value: 0, change: 0 },
    approvalRate: { value: 0, change: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = {
          from: dateRange.from?.toISOString().split("T")[0],
          to: dateRange.to?.toISOString().split("T")[0],
          period,
        };
        const param = `?from=${dateRange.from?.toISOString().split("T")[0]}&to=${dateRange.to?.toISOString().split("T")[0]}&period=${period}`
        const [
          claimsByMonthRes,
          claimsByTypeRes,
          claimsByStatusRes,
          topGaragesRes,
          monthlyComparisonRes,
          settlementTimeRes,
          summaryRes,
        ] = await Promise.all([
          apiRequest(`${API_URL}analytics/${user.tenant_id}/claims-by-month${param}`, "GET"),
          apiRequest(`${API_URL}analytics/${user.tenant_id}/claims-by-type${param}`, "GET"),
          apiRequest(`${API_URL}analytics/${user.tenant_id}/claims-by-status${param}`, "GET"),
          apiRequest(`${API_URL}analytics/${user.tenant_id}/top-garages${param}`, "GET"),
          apiRequest(`${API_URL}analytics/${user.tenant_id}/monthly-comparison${param}`, "GET"),
          apiRequest(`${API_URL}analytics/${user.tenant_id}/settlement-time-by-type${param}`, "GET"),
          apiRequest(`${API_URL}analytics/${user.tenant_id}/summary${param}`, "GET"),
        ]);

        setClaimsByMonth(claimsByMonthRes);
        setClaimsByType(claimsByTypeRes);
        setClaimsByStatus(claimsByStatusRes);
        setTopGarages(topGaragesRes);
        setMonthlyComparison(monthlyComparisonRes);
        setSettlementTime(settlementTimeRes);
        setSummary(summaryRes);
      } catch (error) {
        toast({ title: "Error", description: "Failed to load analytics data", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dateRange, period, user.tenant_id, apiRequest, toast]);

  const handleSort = (field: SetStateAction<string>) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedGarageData = [...topGarages].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    return sortDirection === "asc" ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
  });

  return (
    <DashboardLayout
      user={{
        name: user.name,
        role: "Insurance Company",
        avatar: "/placeholder.svg?height=40&width=40",
      }}
      navigation={[
        { name: "Dashboard", href: "/dashboard/insurer", icon: <Building2 className="h-5 w-5" /> },
        { name: "Claims", href: "/dashboard/insurer/claims", icon: <Building2 className="h-5 w-5" /> },
        { name: "Multi-Signature Claims", href: "/dashboard/insurer/multi-signature-claims", icon: <Building2 className="h-5 w-5" /> },
        { name: "Analytics", href: "/dashboard/insurer/analytics", current: true, icon: <BarChart3 className="h-5 w-5" /> },
      ]}
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground mt-2">Comprehensive insights into claims and performance</p>
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export Report
          </Button>
        </div>

        {/* Filters Section */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-muted p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Filters:</span>
          </div>
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <DatePickerWithRange
              className="w-full md:w-auto"
              date={dateRange}
              setDate={setDateRange}
            />
            <Select value={period} onValueChange={setPeriod}>
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

        {/* Loading State or Content */}
        {loading ? (
          <p>Loading analytics data...</p>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Claims</CardTitle>
                  <CardDescription className="text-2xl font-bold">{summary.totalClaims.value}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    <span className={`${summary.totalClaims.change >= 0 ? "text-green-500" : "text-red-500"} font-medium`}>
                      {summary.totalClaims.change >= 0 ? "↑" : "↓"} {summary.totalClaims.change.toFixed(1)}%
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Payout</CardTitle>
                  <CardDescription className="text-2xl font-bold">{summary.totalPayout.value.toLocaleString()} RWF</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    <span className={`${summary.totalPayout.change >= 0 ? "text-green-500" : "text-red-500"} font-medium`}>
                      {summary.totalPayout.change >= 0 ? "↑" : "↓"} {summary.totalPayout.change.toFixed(1)}%
                    </span>{" "}
                    from previous period
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Average Claim Value</CardTitle>
                  <CardDescription className="text-2xl font-bold">{summary.avgClaimValue.value.toLocaleString()} RWF</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    <span className={`${summary.avgClaimValue.change >= 0 ? "text-green-500" : "text-red-500"} font-medium`}>
                      {summary.avgClaimValue.change >= 0 ? "↑" : "↓"} {summary.avgClaimValue.change.toFixed(1)}%
                    </span>{" "}
                    from previous period
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Approval Rate</CardTitle>
                  <CardDescription className="text-2xl font-bold">{summary.approvalRate.value}%</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    <span className={`${summary.approvalRate.change >= 0 ? "text-green-500" : "text-red-500"} font-medium`}>
                      {summary.approvalRate.change >= 0 ? "↑" : "↓"} {summary.approvalRate.change.toFixed(1)}%
                    </span>{" "}
                    from previous period
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs Section */}
            <Tabs defaultValue="claims">
              <TabsList>
                <TabsTrigger value="claims">Claims Analysis</TabsTrigger>
                <TabsTrigger value="financial">Financial Analysis</TabsTrigger>
                <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
              </TabsList>

              {/* Claims Analysis Tab */}
              <TabsContent value="claims" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Claims by Month Chart */}
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
                          <BarChart data={claimsByMonth} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                                if (name === "claims") return [`${value} claims`, "Claims"];
                                if (name === "amount") return [`${Number(value).toLocaleString()} RWF`, "Amount"];
                                return [value, name];
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
                        {claimsByMonth.slice(0, 5).map((item) => (
                          <div key={item.month} className="grid grid-cols-4 text-sm py-1 border-b border-gray-100">
                            <div className="font-medium">{item.month}</div>
                            <div className="text-right">{item.claims}</div>
                            <div className="text-right">{item.amount.toLocaleString()}</div>
                            <div className="text-right">{item.claims ? Math.round(item.amount / item.claims).toLocaleString() : 0}</div>
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

                  {/* Claims by Type Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <PieChart className="h-5 w-5 mr-2" /> Claims by Type
                      </CardTitle>
                      <CardDescription>Distribution of claims by type</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={claimsByType}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="percentage"
                              nameKey="type"
                              label={({ type, percentage }) => `${type}: ${percentage}%`}
                            >
                              {claimsByType.map((entry, index) => (
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
                        {claimsByType.map((item) => (
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

                {/* Claims by Status and Top Garages */}
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
                              data={claimsByStatus}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="percentage"
                              nameKey="status"
                              label={({ status, percentage }) => `${status}: ${percentage}%`}
                            >
                              {claimsByStatus.map((entry, index) => (
                                <Cell key={`cell-${entry.status}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${value}%`} />
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
                        {claimsByStatus.map((item) => (
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

              {/* Financial Analysis Tab */}
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
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={monthlyComparison} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="thisYear" fill="#8884d8" name="This Year" />
                            <Bar dataKey="lastYear" fill="#82ca9d" name="Last Year" />
                          </BarChart>
                        </ResponsiveContainer>
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
                            {monthlyComparison.slice(0, 6).map((item) => {
                              const change = item.lastYear ? ((item.thisYear - item.lastYear) / item.lastYear * 100) : 0;
                              return (
                                <TableRow key={item.month}>
                                  <TableCell>{item.month}</TableCell>
                                  <TableCell className="text-right">{item.thisYear}</TableCell>
                                  <TableCell className="text-right">{item.lastYear}</TableCell>
                                  <TableCell className="text-right">
                                    <span className={change >= 0 ? "text-green-500" : "text-red-500"}>
                                      {change >= 0 ? "+" : ""}{change.toFixed(1)}%
                                    </span>
                                  </TableCell>
                                </TableRow>
                              );
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
                          <BarChart data={settlementTime} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis label={{ value: "Days", angle: -90, position: "insideLeft" }} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="value" fill="#8884d8" name="Days to Settle">
                              {settlementTime.map((entry, index) => (
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
                            {settlementTime.map((item) => {
                              const benchmark = item.name === "Theft" ? 30 : item.name === "Natural Disaster" ? 25 : 15;
                              const performance = ((benchmark - item.value) / benchmark * 100);
                              return (
                                <TableRow key={item.name}>
                                  <TableCell>{item.name}</TableCell>
                                  <TableCell className="text-right">{item.value}</TableCell>
                                  <TableCell className="text-right">{benchmark}</TableCell>
                                  <TableCell className="text-right">
                                    <span className={performance >= 0 ? "text-green-500" : "text-red-500"}>
                                      {performance >= 0 ? "+" : ""}{performance.toFixed(1)}%
                                    </span>
                                  </TableCell>
                                </TableRow>
                              );
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
                        <ComposedChart data={claimsByMonth} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                            domain={[0, "dataMax"]}
                          />
                          <Tooltip
                            formatter={(value, name) => {
                              if (name === "amount") return [`${Number(value).toLocaleString()} RWF`, "Amount"];
                              if (name === "claims") return [`${value} claims`, "Claims"];
                              return [value, name];
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
                        <div className="text-2xl font-bold">{summary.totalPayout.value.toLocaleString()} RWF</div>
                        <div className="flex items-center text-sm">
                          <span className={summary.totalPayout.change >= 0 ? "text-green-500" : "text-red-500"}>
                            {summary.totalPayout.change >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                            {summary.totalPayout.change.toFixed(1)}%
                          </span>
                          <span className="text-muted-foreground ml-1">from last year</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Average Claim Value</h4>
                        <div className="text-2xl font-bold">{summary.avgClaimValue.value.toLocaleString()} RWF</div>
                        <div className="flex items-center text-sm">
                          <span className={summary.avgClaimValue.change >= 0 ? "text-green-500" : "text-red-500"}>
                            {summary.avgClaimValue.change >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                            {summary.avgClaimValue.change.toFixed(1)}%
                          </span>
                          <span className="text-muted-foreground ml-1">from last year</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Projected Annual Payout</h4>
                        <div className="text-2xl font-bold">{(summary.totalPayout.value * 1.2).toLocaleString()} RWF</div>
                        <div className="flex items-center text-sm">
                          <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                          <span className="text-green-500 font-medium">+5.8%</span>
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
                            {customerSatisfactionData.slice(0, 6).map((item, index) => {
                              const prevMonth = index > 0 ? customerSatisfactionData[index - 1].satisfaction : item.satisfaction;
                              const change = ((item.satisfaction - prevMonth) / prevMonth * 100);
                              return (
                                <TableRow key={item.month}>
                                  <TableCell>{item.month}</TableCell>
                                  <TableCell className="text-right">{item.satisfaction}%</TableCell>
                                  <TableCell className="text-right">
                                    <span className={change >= 0 ? "text-green-500" : "text-red-500"}>
                                      {change >= 0 ? "+" : ""}{change.toFixed(1)}%
                                    </span>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                      <div className="mt-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Current Satisfaction</span>
                          <span className="text-sm font-medium">95%</span>
                        </div>
                        <Progress value={95} className="h-2" />
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
                            {fraudMetricsData.map((item) => (
                              <TableRow key={item.metric}>
                                <TableCell>{item.metric}</TableCell>
                                <TableCell className="text-right">{item.value}%</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      <div className="mt-4 space-y-4">
                        {fraudMetricsData.slice(0, 2).map((metric) => (
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
                        <div className="text-2xl font-bold">12 days</div>
                        <div className="flex items-center text-sm">
                          <TrendingDown className="h-4 w-4 mr-1 text-green-500" />
                          <span className="text-green-500 font-medium">-2.5 days</span>
                          <span className="text-muted-foreground ml-1">from last quarter</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Claims per Agent</h4>
                        <div className="text-2xl font-bold">24 claims</div>
                        <div className="flex items-center text-sm">
                          <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                          <span className="text-green-500 font-medium">+3 claims</span>
                          <span className="text-muted-foreground ml-1">from last quarter</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">First Response Time</h4>
                        <div className="text-2xl font-bold">4.5 hours</div>
                        <div className="flex items-center text-sm">
                          <TrendingDown className="h-4 w-4 mr-1 text-green-500" />
                          <span className="text-green-500 font-medium">-1.2 hours</span>
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
                          {processingEfficiencyData.map((item) => {
                            const change = ((item.previous - item.current) / item.previous * 100);
                            return (
                              <TableRow key={item.stage}>
                                <TableCell>{item.stage}</TableCell>
                                <TableCell className="text-right">{item.current}</TableCell>
                                <TableCell className="text-right">{item.previous}</TableCell>
                                <TableCell className="text-right">
                                  <span className={change >= 0 ? "text-green-500" : "text-red-500"}>
                                    {change >= 0 ? "+" : ""}{change.toFixed(1)}%
                                  </span>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}