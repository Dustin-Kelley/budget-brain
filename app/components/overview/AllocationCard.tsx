'use client';

import { Pie, PieChart, Cell, Label } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { categoryColors } from '@/lib/constants';
import { formatCurrency } from '@/lib/ledger/constants';
import type { AllocationSlice } from '@/app/queries/getCashFlowSummary';

export function AllocationCard({
  allocation,
  lifestyleOutflow,
}: {
  allocation: AllocationSlice[];
  lifestyleOutflow: number;
}) {
  const chartData = allocation.map((slice, index) => ({
    name: slice.name,
    value: slice.amount,
    percent: slice.percent,
    color: categoryColors[index % categoryColors.length],
  }));

  const chartConfig = chartData.reduce((acc, item) => {
    acc[item.name] = { label: item.name, color: item.color };
    return acc;
  }, {} as ChartConfig);

  if (chartData.length === 0) {
    return (
      <section className='rounded-3xl border bg-card p-6 shadow-md'>
        <h2 className='text-lg font-semibold'>Allocation</h2>
        <p className='mt-2 text-sm text-muted-foreground'>
          Import transactions to see where lifestyle spend goes.
        </p>
      </section>
    );
  }

  return (
    <section className='rounded-3xl border bg-card p-6 shadow-md'>
      <div className='mb-2'>
        <h2 className='text-lg font-semibold'>Allocation</h2>
        <p className='text-sm text-muted-foreground'>
          % of lifestyle spend this period
        </p>
      </div>

      <div className='grid gap-6 lg:grid-cols-[1fr_1.2fr] lg:items-center'>
        <ChartContainer
          config={chartConfig}
          className='mx-auto aspect-square max-h-[240px] w-full'
        >
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => (
                    <div className='flex w-full justify-between gap-4'>
                      <span>{name}</span>
                      <span className='font-medium'>
                        {formatCurrency(Number(value))}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Pie
              data={chartData}
              dataKey='value'
              nameKey='name'
              innerRadius={55}
              outerRadius={90}
              strokeWidth={2}
            >
              {chartData.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={entry.color}
                />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
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
                          className='fill-foreground text-base font-semibold'
                        >
                          {formatCurrency(lifestyleOutflow)}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 18}
                          className='fill-muted-foreground text-xs'
                        >
                          spent
                        </tspan>
                      </text>
                    );
                  }
                  return null;
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>

        <ul className='flex flex-col gap-2'>
          {chartData.map((item) => (
            <li
              key={item.name}
              className='flex items-center justify-between gap-3 text-sm'
            >
              <div className='flex min-w-0 items-center gap-2'>
                <span
                  className='h-2.5 w-2.5 shrink-0 rounded-full'
                  style={{ backgroundColor: item.color }}
                />
                <span className='truncate'>{item.name}</span>
                <span className='text-muted-foreground'>
                  {item.percent.toFixed(1)}%
                </span>
              </div>
              <span className='shrink-0 font-medium'>
                {formatCurrency(item.value)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
