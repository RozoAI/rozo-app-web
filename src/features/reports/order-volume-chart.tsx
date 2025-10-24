import { useColorScheme } from 'nativewind';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { LayoutChangeEvent } from 'react-native';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';

import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { type OrderVolume } from '@/features/reports/types';

type OrderVolumeChartProps = {
  data: OrderVolume[];
};

export function OrderVolumeChart({ data }: OrderVolumeChartProps) {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [containerWidth, setContainerWidth] = useState(300); // Default width
  const chartHeight = 200;
  const padding = { top: 20, right: 10, bottom: 30, left: 50 };

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  };

  const chartWidth = containerWidth;

  if (!data || data.length === 0) {
    return null;
  }

  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const maxCount = Math.max(...data.map((d) => d.count));
  const barWidth = innerWidth / data.length - 8;

  // Calculate nice Y-axis values for order counts (always integers starting from 0)
  const calculateYAxisValues = (max: number, ticks: number = 5) => {
    // Always start from 0 for count charts
    if (max === 0) {
      return [0, 1, 2, 3, 4];
    }

    // For very small values (1-4), create evenly spaced values
    if (max <= 4) {
      const values = [0];
      for (let i = 1; i < ticks; i++) {
        values.push(Math.ceil((i * max) / (ticks - 1)));
      }
      // Remove duplicates and ensure we have unique values
      return [...new Set(values)].sort((a, b) => a - b);
    }

    // For values 5-20, use increments of 1 or 2
    if (max <= 20) {
      const step = Math.ceil(max / (ticks - 1));
      return Array.from({ length: ticks }, (_, i) => i * step);
    }

    // For larger values, round up to nice numbers (multiples of 5)
    const step = Math.ceil(max / (ticks - 1));
    const niceStep = Math.ceil(step / 5) * 5;
    return Array.from({ length: ticks }, (_, i) => i * niceStep);
  };

  const yAxisValues = calculateYAxisValues(maxCount, 5);
  const yAxisMax = Math.max(...yAxisValues);
  const yAxisRange = yAxisMax;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <Card className="border border-background-300 bg-background-0 p-4">
      <VStack space="md">
        <Box>
          <Text className="text-lg font-semibold">{t('reports.orderVolume')}</Text>
          <Text className="text-xs text-gray-400">{t('reports.dailyOrderCount')}</Text>
        </Box>

        <Box className="w-full" onLayout={handleLayout}>
          <Svg width="100%" height={chartHeight}>
            {/* Grid lines */}
            {yAxisValues.map((value, i) => {
              const y = padding.top + innerHeight - (value / yAxisRange) * innerHeight;
              return (
                <Line
                  key={i}
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth - padding.right}
                  y2={y}
                  stroke={isDark ? '#374151' : '#E5E7EB'}
                  strokeWidth="1"
                  strokeDasharray="4,4"
                />
              );
            })}

            {/* Bars */}
            {data.map((item, index) => {
              const barHeight = (item.count / yAxisRange) * innerHeight;
              const x = padding.left + (index * innerWidth) / data.length + 4;
              const y = chartHeight - padding.bottom - barHeight;

              return (
                <React.Fragment key={index}>
                  <Rect x={x} y={y} width={barWidth} height={barHeight} fill="#0369A1" rx="4" />
                  {/* Value label on top of bar */}
                  <SvgText
                    x={x + barWidth / 2}
                    y={y - 5}
                    fontSize="10"
                    fill={isDark ? '#F3F4F6' : '#1F2937'}
                    textAnchor="middle"
                  >
                    {item.count}
                  </SvgText>
                </React.Fragment>
              );
            })}

            {/* Y-axis labels */}
            {yAxisValues.map((value, i) => {
              const y = padding.top + innerHeight - (value / yAxisRange) * innerHeight;
              return (
                <SvgText
                  key={i}
                  x={padding.left - 10}
                  y={y + 4}
                  fontSize="10"
                  fill={isDark ? '#9CA3AF' : '#6B7280'}
                  textAnchor="end"
                >
                  {value}
                </SvgText>
              );
            })}

            {/* X-axis labels */}
            {data.map((item, index) => {
              // Show labels for first, middle, and last items
              if (index !== 0 && index !== Math.floor(data.length / 2) && index !== data.length - 1) {
                return null;
              }
              const x = padding.left + (index * innerWidth) / data.length + barWidth / 2 + 4;
              return (
                <SvgText
                  key={index}
                  x={x}
                  y={chartHeight - padding.bottom + 20}
                  fontSize="10"
                  fill={isDark ? '#9CA3AF' : '#6B7280'}
                  textAnchor="middle"
                >
                  {formatDate(item.date)}
                </SvgText>
              );
            })}
          </Svg>
        </Box>
      </VStack>
    </Card>
  );
}
