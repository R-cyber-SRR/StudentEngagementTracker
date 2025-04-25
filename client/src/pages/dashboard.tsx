import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { EngagementSummary } from "@/components/EngagementSummary";
import { EngagementChart } from "@/components/EngagementChart";
import { ConnectedStudents } from "@/components/ConnectedStudents";
import { AlertsSection } from "@/components/AlertsSection";
import { WebSocketProvider } from "@/components/ui/websocket-provider";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { 
  type Student, 
  type Alert, 
  type EngagementData, 
  type EngagementChartData,
  type EngagementUpdate,
  type AlertEvent
} from "@/types";

export default function Dashboard() {
  const [sessionInfo, setSessionInfo] = useState({ name: "Introduction to Programming Concepts" });
  const [students, setStudents] = useState<Student[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [engagementData, setEngagementData] = useState<EngagementData>({
    overallAttention: 0,
    participationLevel: "Medium",
    distractionAlerts: 0,
    distractionChange: 0,
    participationCount: 0
  });
  const [chartData, setChartData] = useState<EngagementChartData>({
    labels: Array.from({ length: 30 }, (_, i) => `${i + 1}m ago`).reverse(),
    data: Array(30).fill(0)
  });

  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Use session ID 1 as default for this demo
        const sessionId = 1;
        
        // Get session data
        const sessionResponse = await apiRequest("GET", `/api/sessions/${sessionId}`);
        const sessionData = await sessionResponse.json();
        if (sessionData) {
          setSessionInfo(sessionData);
        }
        
        // Get engagement history
        const engagementResponse = await apiRequest("GET", `/api/sessions/${sessionId}/engagement`);
        const engagementHistory = await engagementResponse.json();
        if (engagementHistory && engagementHistory.length > 0) {
          // Use the data to update chart
          setChartData({
            labels: Array.from({ length: engagementHistory.length }, (_, i) => 
              `${engagementHistory.length - i}m ago`
            ).reverse(),
            data: engagementHistory
          });
          
          // Update engagement summary with the latest data
          setEngagementData(prev => ({
            ...prev,
            overallAttention: engagementHistory[engagementHistory.length - 1] || 0,
            distractionChange: calculateChange(engagementHistory)
          }));
        }
        
        // Get alerts
        const alertsResponse = await apiRequest("GET", `/api/sessions/${sessionId}/alerts`);
        const alertsData = await alertsResponse.json();
        if (alertsData) {
          // Process alerts and add time ago
          const processedAlerts = alertsData.map((alert: any) => ({
            ...alert,
            timeAgo: formatDistanceToNow(new Date(alert.timestamp), { addSuffix: false })
          }));
          setAlerts(processedAlerts);
          setEngagementData(prev => ({
            ...prev,
            distractionAlerts: processedAlerts.length
          }));
        }
      } catch (error) {
        console.error("Failed to load initial data:", error);
      }
    };

    loadInitialData();
  }, []);

  // Calculate percentage change in engagement
  const calculateChange = (data: number[]): number => {
    if (data.length < 2) return 0;
    const current = data[data.length - 1];
    const previous = data[data.length - 2];
    return previous === 0 ? 0 : Math.round(((current - previous) / previous) * 100);
  };

  // Update chart data with new engagement data
  const updateChartData = (newValue: number) => {
    setChartData(prev => {
      const newLabels = [...prev.labels.slice(1), 'now'];
      const newData = [...prev.data.slice(1), newValue];
      return { labels: newLabels, data: newData };
    });
  };

  // Handle WebSocket engagement updates
  const handleEngagementUpdate = (data: EngagementUpdate) => {
    setStudents(data.studentsData);
    setEngagementData(prev => ({
      ...prev,
      overallAttention: data.overallAttention,
      participationLevel: getParticipationLevel(data.overallAttention),
      participationCount: Math.floor(data.overallAttention / 10)
    }));
    updateChartData(data.overallAttention);
  };

  // Handle WebSocket alert events
  const handleAlertReceived = (data: AlertEvent) => {
    const newAlert: Alert = {
      id: data.alertId,
      alertType: data.alertType,
      message: data.message,
      severity: data.severity,
      timestamp: data.timestamp,
      timeAgo: 'just now'
    };
    
    setAlerts(prev => [newAlert, ...prev]);
    setEngagementData(prev => ({
      ...prev,
      distractionAlerts: prev.distractionAlerts + 1
    }));
  };

  // Get participation level based on overall attention
  const getParticipationLevel = (attention: number): string => {
    if (attention >= 80) return "High";
    if (attention >= 50) return "Medium";
    return "Low";
  };

  return (
    <WebSocketProvider 
      onEngagementUpdate={handleEngagementUpdate}
      onAlertReceived={handleAlertReceived}
    >
      <DashboardLayout 
        title="Live Class Session Dashboard"
        subtitle={`Current session: ${sessionInfo.name}`}
        studentCount={students.length}
      >
        <EngagementSummary data={engagementData} />
        
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <EngagementChart data={chartData} />
          <ConnectedStudents students={students} />
        </div>
        
        <AlertsSection alerts={alerts} />
      </DashboardLayout>
    </WebSocketProvider>
  );
}
