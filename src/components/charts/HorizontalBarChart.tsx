import { useLayoutEffect, useRef } from 'react';
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import { useTheme } from '@/hooks/useTheme';
import { useStableRef } from '@/hooks/useStableRef';
import { cn } from '@/lib/cn';
import {
  applyAxisTheme,
  bindSpriteTooltipText,
  createStyledTooltip,
  getChartColors,
  type ChartTooltipContext,
} from './chart-theme';

interface HorizontalBarChartProps {
  data: Record<string, string | number>[];
  categoryField: string;
  valueField: string;
  color?: string;
  className?: string;
  height?: string;
  valueLabel?: string;
  tooltipFormatter?: (value: number) => string;
  tooltipTextFormatter?: (ctx: ChartTooltipContext) => string;
  xAxisFormatter?: (value: number) => string;
}

export function HorizontalBarChart({
  data,
  categoryField,
  valueField,
  color = '#f59e0b',
  className,
  height = '100%',
  valueLabel,
  tooltipFormatter,
  tooltipTextFormatter,
  xAxisFormatter,
}: HorizontalBarChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const tooltipFormatterRef = useStableRef(tooltipFormatter);
  const tooltipTextFormatterRef = useStableRef(tooltipTextFormatter);
  const xAxisFormatterRef = useStableRef(xAxisFormatter);

  useLayoutEffect(() => {
    if (!chartRef.current) return;

    const root = am5.Root.new(chartRef.current);
    root.setThemes([am5themes_Animated.new(root)]);
    const colors = getChartColors();

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        wheelX: 'none',
        wheelY: 'none',
        paddingLeft: 0,
        paddingRight: 8,
      }),
    );

    const yRenderer = am5xy.AxisRendererY.new(root, { inversed: true, minGridDistance: 20 });
    applyAxisTheme(yRenderer, colors);
    const yAxis = chart.yAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField,
        renderer: yRenderer,
      }),
    );

    const xRenderer = am5xy.AxisRendererX.new(root, {});
    applyAxisTheme(xRenderer, colors);
    xRenderer.labels.template.adapters.add('text', (text) => {
      const formatter = xAxisFormatterRef.current;
      if (!formatter) return text;
      const num = Number(String(text).replace(/[^0-9.-]/g, ''));
      if (!Number.isNaN(num)) return formatter(num);
      return text;
    });
    const xAxis = chart.xAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: xRenderer,
      }),
    );

    const getTooltipConfig = () => ({
      categoryField,
      valueField,
      valueLabel,
      tooltipFormatter: tooltipFormatterRef.current,
      tooltipTextFormatter: tooltipTextFormatterRef.current,
    });

    const tooltip = createStyledTooltip(root, categoryField, valueField, getTooltipConfig);

    const series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        xAxis,
        yAxis,
        valueXField: valueField,
        categoryYField: categoryField,
        tooltip,
      }),
    );

    series.columns.template.setAll({
      fill: am5.color(color),
      stroke: am5.color(color),
      cornerRadiusTR: 4,
      cornerRadiusBR: 4,
      height: am5.percent(70),
      interactive: true,
    });
    bindSpriteTooltipText(series.columns.template, categoryField, valueField, getTooltipConfig);

    yAxis.data.setAll(data);
    series.data.setAll(data);
    series.appear(800);
    chart.appear(800, 100);

    return () => {
      root.dispose();
    };
  }, [data, categoryField, valueField, color, valueLabel, theme]);

  return <div ref={chartRef} className={cn('w-full', className)} style={{ height }} />;
}
