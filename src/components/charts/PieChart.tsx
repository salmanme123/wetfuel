import { useLayoutEffect, useRef } from 'react';
import * as am5 from '@amcharts/amcharts5';
import * as am5percent from '@amcharts/amcharts5/percent';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import { useTheme } from '@/hooks/useTheme';
import { useStableRef } from '@/hooks/useStableRef';
import { cn } from '@/lib/cn';
import { getChartColors, styleTooltip } from './chart-theme';

const DEFAULT_COLORS = ['#2563eb', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444'];

interface PieChartProps {
  data: Record<string, string | number>[];
  categoryField: string;
  valueField: string;
  colors?: string[];
  className?: string;
  height?: string;
  tooltipFormatter?: (value: number) => string;
}

export function PieChart({
  data,
  categoryField,
  valueField,
  colors = DEFAULT_COLORS,
  className,
  height = '100%',
  tooltipFormatter,
}: PieChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const tooltipFormatterRef = useStableRef(tooltipFormatter);

  useLayoutEffect(() => {
    if (!chartRef.current) return;

    const root = am5.Root.new(chartRef.current);
    root.setThemes([am5themes_Animated.new(root)]);
    const chartColors = getChartColors();

    const chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        layout: root.verticalLayout,
      }),
    );

    const series = chart.series.push(
      am5percent.PieSeries.new(root, {
        valueField,
        categoryField,
        alignLabels: true,
      }),
    );

    series.set(
      'colors',
      am5.ColorSet.new(root, {
        colors: colors.map((c) => am5.color(c)),
      }),
    );

    series.slices.template.setAll({
      strokeWidth: 2,
      stroke: chartColors.tooltipBg,
    });

    series.labels.template.setAll({
      fill: chartColors.text,
      fontSize: 11,
      text: `{${categoryField}}: {valuePercentTotal.formatNumber('0')} %`,
    });

    series.ticks.template.setAll({ stroke: chartColors.text });

    const tooltip = am5.Tooltip.new(root, {
      labelText: `{${categoryField}}: {${valueField}}`,
      getFillFromSprite: false,
      autoTextColor: false,
    });
    tooltip.label.adapters.add('text', (_text, target) => {
      const formatter = tooltipFormatterRef.current;
      const ctx = target.dataItem?.dataContext as Record<string, unknown> | undefined;
      const category = ctx?.[categoryField];
      const value = ctx?.[valueField];
      if (formatter && typeof value === 'number' && typeof category === 'string') {
        return `${category}: ${formatter(value)}`;
      }
      return _text;
    });
    styleTooltip(tooltip, chartColors);
    series.set('tooltip', tooltip);

    series.data.setAll(data);
    series.appear(800, 100);

    return () => {
      root.dispose();
    };
  }, [data, categoryField, valueField, colors, theme]);

  return <div ref={chartRef} className={cn('w-full', className)} style={{ height }} />;
}
