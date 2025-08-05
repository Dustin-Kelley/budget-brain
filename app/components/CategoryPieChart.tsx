'use client';

import * as React from 'react';
import { Label, Pie, PieChart, Cell } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { useMemo, useState } from 'react';
import { categoryColors } from '@/lib/constants';
import { Separator } from '@/components/ui/separator';

type ChartData = {
  name: string | null;
  value: number;
  color: string;
}[];

// Chart Legend Component
function ChartLegend({ 
  chartData, 
  totalIncome 
}: { 
  chartData: ChartData; 
  totalIncome: number; 
}) {
  const totalPlanned = chartData.reduce((sum, item) => sum + item.value, 0);
  const remaining = totalIncome - totalPlanned;

  return (
    <div className="flex px-2 items-center justify-center flex-col gap-3 ">
      <div className="flex flex-col gap-3 w-full">
        <h4 className="text-sm font-medium text-muted-foreground">Categories</h4>
        {chartData.map((item, index) => {
          const percentage = totalIncome > 0 ? (item.value / totalIncome) * 100 : 0;
          return (
            <div key={index} className="flex items-center justify-between  ">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full " 
                  style={{ backgroundColor: item.color }}
                />
                <div className="flex gap-2 items-center">
                  <span className="text-sm font-medium truncate">
                    {item.name || 'Unnamed'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {percentage.toFixed(1)}% 
                  </span>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">
                ${item.value.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>

      <Separator />
      
      <div className="flex flex-col items-center gap-2 ">
        <div className="flex items-center  gap-2">
          <span className="text-sm font-medium">Total Planned</span>
          <span className="text-sm font-medium">
            ${totalPlanned.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Remaining</span>
          <span className={`text-sm ${remaining < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
            ${remaining.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center  gap-2">
          <span className="text-sm font-medium">Total Income</span>
          <span className="text-sm font-medium">
            ${totalIncome.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

export function CategoryPieChart({
  totalIncome,
  chartData,
}: {
  totalIncome: number;
  chartData: ChartData;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const chartConfig = useMemo(() => {
    const config: ChartConfig = {} satisfies ChartConfig;
    chartData.forEach((category, index) => {
      if (category.name) {
        config[category.name] = {
          label: category.name,
          color: categoryColors[index % categoryColors.length],
        };
      }
    });
    return config;
  }, [chartData]);

  return (
    <Card className='flex flex-col'>
      <CardHeader className='items-center pb-0'>
        <CardTitle>Budget Breakdown</CardTitle>
        <CardDescription>Showing total planned for this month</CardDescription>
      </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 p-4 gap-6 items-center justify-center">
        <ChartContainer
          config={chartConfig}
          className='aspect-square mx-auto max-h-[250px] w-full max-w-[300px]'
        >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey='value'
                nameKey='name'
                innerRadius={60}
                strokeWidth={5}
                activeIndex={activeIndex ?? undefined}
                onMouseEnter={(_, idx) => setActiveIndex(idx)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                  />
                ))}
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                      const value =
                        activeIndex !== null && chartData[activeIndex]
                          ? chartData[activeIndex].value
                          : totalIncome;
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor='middle'
                          dominantBaseline='middle'
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className='fill-foreground text-3xl font-bold'
                          >
                            ${value.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className='fill-muted-foreground'
                          >
                            {activeIndex !== null &&
                            chartData[activeIndex] &&
                            chartData[activeIndex].name
                              ? chartData[activeIndex].name
                              : 'Total Planned'}
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
          <ChartLegend chartData={chartData} totalIncome={totalIncome} />
      </CardContent>
    </Card>
  );
}
