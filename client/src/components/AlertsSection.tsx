import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, AlertTriangle, Clock } from "lucide-react";
import { Alert } from "@/types";

type AlertsSectionProps = {
  alerts: Alert[];
};

export function AlertsSection({ alerts }: AlertsSectionProps) {
  // Get icon based on alert type
  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case "distraction":
      case "multiple_distractions":
        return (
          <div className="flex-shrink-0 h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
        );
      case "engagement_drop":
        return (
          <div className="flex-shrink-0 h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-yellow-600" />
          </div>
        );
      default:
        return (
          <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
            <Clock className="h-6 w-6 text-gray-600" />
          </div>
        );
    }
  };

  // Get time badge color based on recency
  const getTimeBadgeColor = (timeAgo: string) => {
    if (timeAgo.includes("s") || timeAgo.includes("1m")) {
      return "bg-red-100 text-red-800";
    } else if (timeAgo.includes("m") && parseInt(timeAgo) < 10) {
      return "bg-yellow-100 text-yellow-800";
    } else {
      return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="mt-5">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Alerts</CardTitle>
          <CardDescription>Potential attention issues detected</CardDescription>
        </div>
        {alerts.length > 0 && (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            {alerts.length} New
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-80 overflow-y-auto">
          <ul className="divide-y divide-gray-200">
            {alerts.map((alert) => (
              <li key={alert.id} className="py-4">
                <div className="flex items-center space-x-4">
                  {getAlertIcon(alert.alertType)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {alert.message}
                    </p>
                    <p className="text-sm text-gray-500">
                      {alert.severity === 'high' 
                        ? 'Immediate attention recommended' 
                        : 'Monitor for continued pattern'}
                    </p>
                  </div>
                  <div>
                    <Badge
                      variant="outline"
                      className={getTimeBadgeColor(alert.timeAgo)}
                    >
                      {alert.timeAgo} ago
                    </Badge>
                  </div>
                </div>
              </li>
            ))}
            {alerts.length === 0 && (
              <li className="py-4 text-center text-gray-500">
                No alerts at this time
              </li>
            )}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
