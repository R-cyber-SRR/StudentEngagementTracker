import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Eye, MessageSquare, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { EngagementData } from "@/types";

type EngagementSummaryProps = {
  data: EngagementData;
};

export function EngagementSummary({ data }: EngagementSummaryProps) {
  return (
    <div className="py-4">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Class Attention */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary rounded-md p-3">
                <Eye className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Class Attention</dt>
                <dd>
                  <div className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {data.overallAttention}%
                    </div>
                    {data.distractionChange > 0 ? (
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        <TrendingUp className="h-5 w-5 self-center flex-shrink-0 text-green-500" />
                        <span className="sr-only">Increased by</span>
                        {data.distractionChange}%
                      </div>
                    ) : (
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-red-600">
                        <TrendingDown className="h-5 w-5 self-center flex-shrink-0 text-red-500" />
                        <span className="sr-only">Decreased by</span>
                        {Math.abs(data.distractionChange)}%
                      </div>
                    )}
                  </div>
                </dd>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 px-6">
            <div className="text-sm">
              <a href="#" className="font-medium text-primary hover:text-indigo-700">
                View detailed stats
              </a>
            </div>
          </CardFooter>
        </Card>

        {/* Participation Level */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-secondary rounded-md p-3">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Participation Level</dt>
                <dd>
                  <div className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {data.participationLevel}
                    </div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-gray-600">
                      {data.participationCount} questions asked
                    </div>
                  </div>
                </dd>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 px-6">
            <div className="text-sm">
              <a href="#" className="font-medium text-primary hover:text-indigo-700">
                Prompt participation
              </a>
            </div>
          </CardFooter>
        </Card>

        {/* Distraction Alerts */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-alert rounded-md p-3">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Distraction Alerts</dt>
                <dd>
                  <div className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {data.distractionAlerts}
                    </div>
                    {data.distractionAlerts > 0 ? (
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-red-600">
                        <TrendingUp className="h-5 w-5 self-center flex-shrink-0 text-red-500" />
                        <span className="sr-only">Increased by</span>
                        {data.distractionAlerts}
                      </div>
                    ) : (
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        <TrendingDown className="h-5 w-5 self-center flex-shrink-0 text-green-500" />
                        <span className="sr-only">No increase</span>
                        0
                      </div>
                    )}
                  </div>
                </dd>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 px-6">
            <div className="text-sm">
              <a href="#" className="font-medium text-primary hover:text-indigo-700">
                View details
              </a>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
