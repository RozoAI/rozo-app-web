import { useColorScheme } from 'nativewind';
import React, { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';

import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { type DailyTrend } from '@/features/reports/types';

type RevenueTrendChartProps = {
  data: DailyTrend[];
};

export function RevenueTrendChart({ data }: RevenueTrendChartProps) {
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

  // Calculate dimensions
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Get min and max values from data
  const dataMax = Math.max(...data.map((d) => d.usd_amount));
  const dataMin = Math.min(...data.map((d) => d.usd_amount));

  // Calculate nice Y-axis range that always starts from 0 for revenue charts
  const calculateYAxisRange = (min: number, max: number, ticks: number = 5) => {
    // Always start from 0 for revenue charts
    const rangeMin = 0;

    // If all values are the same, create a small range
    if (min === max) {
      const value = max;
      if (value === 0) {
        return { min: 0, max: 1, values: [0, 0.25, 0.5, 0.75, 1] };
      }
      // Create range from 0 to slightly above the value
      const rangeMax = value * 1.2;
      const step = rangeMax / (ticks - 1);
      const values = Array.from({ length: ticks }, (_, i) => i * step);
      return { min: rangeMin, max: rangeMax, values };
    }

    // Calculate a nice max value
    let niceMax: number;

    if (max < 1) {
      // For very small values (less than $1), round up to nearest 0.1, 0.5, or 1
      if (max <= 0.1) {
        niceMax = Math.ceil(max * 100) / 100; // Round to nearest 0.01
      } else if (max <= 0.5) {
        niceMax = Math.ceil(max * 10) / 10; // Round to nearest 0.1
      } else {
        niceMax = 1;
      }
    } else if (max < 10) {
      // For values less than 10, round up to nearest whole number
      niceMax = Math.ceil(max);
    } else {
      // For larger values, round up to nice numbers
      const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
      niceMax = Math.ceil(max / magnitude) * magnitude;
    }

    // Add 10% padding to the top
    niceMax = niceMax * 1.1;

    // Generate tick values
    const step = niceMax / (ticks - 1);
    const values = Array.from({ length: ticks }, (_, i) => i * step);

    return { min: rangeMin, max: niceMax, values };
  };

  const yAxisConfig = calculateYAxisRange(dataMin, dataMax, 5);
  const yAxisMin = yAxisConfig.min;
  const yAxisMax = yAxisConfig.max;
  const yAxisValues = yAxisConfig.values;
  const yAxisRange = yAxisMax - yAxisMin;

  // Calculate points for the line
  const points = data.map((item, index) => {
    const x = padding.left + (index / (data.length - 1 || 1)) * innerWidth;
    const y = padding.top + innerHeight - ((item.usd_amount - yAxisMin) / yAxisRange) * innerHeight;
    return { x, y, value: item.usd_amount, date: item.date };
  });

  // Create path for the line (only if we have 2+ points)
  const linePath =
    points.length >= 2 ? points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ') : '';

  // Create path for the area fill (only if we have 2+ points)
  const areaPath =
    points.length >= 2
      ? `${linePath} L ${points[points.length - 1].x} ${chartHeight - padding.bottom} L ${padding.left} ${
          chartHeight - padding.bottom
        } Z`
      : '';

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <Card className="border border-background-300 bg-background-0 p-4">
      <VStack space="md">
        <Box>
          <Text className="text-lg font-semibold">{t('reports.revenueTrend')}</Text>
          <Text className="text-xs text-gray-400">{t('reports.dailyRevenueUSD')}</Text>
        </Box>

        <Box className="w-full" onLayout={handleLayout}>
          <Svg width="100%" height={chartHeight}>
            {/* Grid lines */}
            {yAxisValues.map((value, i) => {
              const y = padding.top + innerHeight - ((value - yAxisMin) / yAxisRange) * innerHeight;
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

            {/* Area fill - only render if we have multiple points */}
            {areaPath && <Path d={areaPath} fill="rgba(3, 105, 161, 0.1)" />}

            {/* Line - only render if we have multiple points */}
            {linePath && <Path d={linePath} stroke="#0369A1" strokeWidth="2" fill="none" />}

            {/* Data points - always render, larger for single points */}
            {points.map((point, index) => (
              <Fragment key={index}>
                <Circle
                  cx={point.x}
                  cy={point.y}
                  r={points.length === 1 ? 8 : 4}
                  fill="#0369A1"
                  stroke="#FFFFFF"
                  strokeWidth={points.length === 1 ? 2 : 0}
                />
                {/* Show value label for single point */}
                {points.length === 1 && (
                  <SvgText
                    x={point.x}
                    y={point.y - 15}
                    fontSize="12"
                    fill={isDark ? '#F3F4F6' : '#1F2937'}
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    ${point.value.toFixed(2)}
                  </SvgText>
                )}
              </Fragment>
            ))}

            {/* Y-axis labels */}
            {yAxisValues.map((value, i) => {
              const y = padding.top + innerHeight - ((value - yAxisMin) / yAxisRange) * innerHeight;
              // Format based on value size
              const formattedValue = yAxisMax < 1 ? value.toFixed(2) : yAxisMax < 10 ? value.toFixed(1) : value.toFixed(0);
              return (
                <SvgText
                  key={i}
                  x={padding.left - 10}
                  y={y + 4}
                  fontSize="10"
                  fill={isDark ? '#9CA3AF' : '#6B7280'}
                  textAnchor="end"
                >
                  ${formattedValue}
                </SvgText>
              );
            })}

            {/* X-axis labels (show first, middle, last) */}
            {[0, Math.floor(data.length / 2), data.length - 1].map((index) => {
              if (index >= data.length) return null;
              const point = points[index];
              return (
                <SvgText
                  key={index}
                  x={point.x}
                  y={chartHeight - padding.bottom + 20}
                  fontSize="10"
                  fill={isDark ? '#9CA3AF' : '#6B7280'}
                  textAnchor="middle"
                >
                  {formatDate(data[index].date)}
                </SvgText>
              );
            })}
          </Svg>
        </Box>
      </VStack>
    </Card>
  );
}
