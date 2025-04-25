import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BarChart3, LineChart, PieChart, CalendarDays, Download, Filter } from "lucide-react";
import { AlertsSection } from "@/components/AlertsSection";
import { EngagementChart } from "@/components/EngagementChart";
import { useAuth } from "@/hooks/use-auth";
import { WebSocketProvider } from "@/components/ui/websocket-provider";
import { Alert, EngagementChartData } from "@/types";

export default function ReportsPage() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [studentCount, setStudentCount] = useState(0);

  // Sample data for demonstration
  const dailyEngagement: EngagementChartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    data: [65, 72, 68, 81, 76, 60, 70]
  };

  const weeklyEngagement: EngagementChartData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    data: [70, 75, 78, 82]
  };

  const monthlyEngagement: EngagementChartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    data: [65, 68, 72, 78, 82, 85]
  };

  return (
    <WebSocketProvider>
      <DashboardLayout
        title="Reports & Analytics"
        subtitle="View detailed insights on student engagement"
        studentCount={studentCount}
      >
        {/* Report time period selector */}
        <div className="flex items-center justify-between mb-6">
          <Tabs defaultValue="daily" className="w-[400px]">
            <TabsList>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Date Range
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Report content */}
        <Tabs defaultValue="engagement">
          <TabsList className="mb-6">
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
          </TabsList>

          {/* Engagement Reports Tab */}
          <TabsContent value="engagement">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Overall Attention</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">76%</div>
                  <p className="text-xs text-muted-foreground">
                    +2.5% from previous period
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Participation Rate</CardTitle>
                    <LineChart className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">68%</div>
                  <p className="text-xs text-muted-foreground">
                    +5.2% from previous period
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Distraction Count</CardTitle>
                    <PieChart className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground">
                    -3.1% from previous period
                  </p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="daily" className="mb-6">
              <TabsContent value="daily">
                <EngagementChart data={dailyEngagement} />
              </TabsContent>
              <TabsContent value="weekly">
                <EngagementChart data={weeklyEngagement} />
              </TabsContent>
              <TabsContent value="monthly">
                <EngagementChart data={monthlyEngagement} />
              </TabsContent>
            </Tabs>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Engagement by Time of Day</CardTitle>
                  <CardDescription>Average attention levels throughout the day</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    Chart visualization goes here
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Engagement by Session Type</CardTitle>
                  <CardDescription>Comparing different session formats</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    Chart visualization goes here
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Alerts Reports Tab */}
          <TabsContent value="alerts">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Alert Trends</CardTitle>
                <CardDescription>History of attention alerts over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Alert trend chart visualization goes here
                </div>
              </CardContent>
            </Card>

            <AlertsSection alerts={alerts} />
          </TabsContent>

          {/* Students Reports Tab */}
          <TabsContent value="students">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Student Performance</CardTitle>
                <CardDescription>Individual attention and participation metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                  Student performance visualization goes here
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">View Detailed Student Reports</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </DashboardLayout>
    </WebSocketProvider>
  );
}