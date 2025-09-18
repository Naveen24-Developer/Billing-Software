"use client"

import { useState, useEffect } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Card, CardContent } from '@/components/ui/card';

const chartConfig = {
  total: {
    label: 'Total',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function DashboardChart() {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // Generate data on the client-side only to prevent hydration errors
    const generateData = () => [
      { month: 'Jan', total: Math.floor(Math.random() * 2000) + 500 },
      { month: 'Feb', total: Math.floor(Math.random() * 2000) + 500 },
      { month: 'Mar', total: Math.floor(Math.random() * 2000) + 500 },
      { month: 'Apr', total: Math.floor(Math.random() * 2000) + 500 },
      { month: 'May', total: Math.floor(Math.random() * 2000) + 500 },
      { month: 'Jun', total: Math.floor(Math.random() * 2000) + 500 },
      { month: 'Jul', total: Math.floor(Math.random() * 2000) + 500 },
      { month: 'Aug', total: Math.floor(Math.random() * 2000) + 500 },
      { month: 'Sep', total: Math.floor(Math.random() * 2000) + 500 },
      { month: 'Oct', total: Math.floor(Math.random() * 2000) + 500 },
      { month: 'Nov', total: Math.floor(Math.random() * 2000) + 500 },
      { month: 'Dec', total: Math.floor(Math.random() * 2000) + 500 },
    ];
    setChartData(generateData());
  }, []);

  if (!chartData.length) {
    return (
        <div className="flex items-center justify-center min-h-[350px]">
            <p className="text-muted-foreground">Loading chart...</p>
        </div>
    );
  }

  return (
    <CardContent className="pl-2">
      <ChartContainer config={chartConfig} className="min-h-[350px] w-full">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <XAxis
              dataKey="month"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `₹${value}`}
            />
            <Tooltip
              content={<ChartTooltipContent />}
              cursor={{ fill: 'hsl(var(--accent) / 0.3)' }}
            />
            <Bar
              dataKey="total"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </CardContent>
  );
}
