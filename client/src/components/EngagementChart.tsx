import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Chart from "chart.js/auto";
import { EngagementChartData } from "@/types";

type EngagementChartProps = {
  data: EngagementChartData;
};

export function EngagementChart({ data }: EngagementChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    // Create the chart
    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: data.labels,
        datasets: [
          {
            label: "Class Engagement %",
            data: data.data,
            fill: true,
            backgroundColor: "rgba(79, 70, 229, 0.1)",
            borderColor: "rgba(79, 70, 229, 1)",
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointBackgroundColor: "rgba(79, 70, 229, 1)",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            min: 0,
            max: 100,
            ticks: {
              callback: function (value) {
                return value + "%";
              },
            },
            grid: {
              drawBorder: false,
            },
          },
          x: {
            grid: {
              display: false,
              drawBorder: false,
            },
            ticks: {
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 10,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            mode: "index",
            intersect: false,
            callbacks: {
              label: function (context) {
                return `Engagement: ${context.raw}%`;
              },
            },
          },
        },
        interaction: {
          mode: "index",
          intersect: false,
        },
      },
    });

    // Clean up on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Class Engagement Trend</CardTitle>
        <CardDescription>Last 30 minutes of activity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <canvas ref={chartRef} />
        </div>
      </CardContent>
    </Card>
  );
}
