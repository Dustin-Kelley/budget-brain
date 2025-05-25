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

type ChartData = {
  name: string | null;
  value: number;
  color: string;
}[];

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
      <CardContent className='flex-1 pb-0'>
        <ChartContainer
          config={chartConfig}
          className='mx-auto aspect-square max-h-[250px]'
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
      </CardContent>
    </Card>
  );
}
