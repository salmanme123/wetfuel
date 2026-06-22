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

interface AreaChartProps {
  data: Record<string, string | number>[];
  categoryField: string;
  valueField: string;
  color?: string;
  fillColor?: string;
  className?: string;
  height?: string;
  valueLabel?: string;
  tooltipFormatter?: (value: number) => string;
  tooltipTextFormatter?: (ctx: ChartTooltipContext) => string;
  yAxisFormatter?: (value: number) => string;
}

export function AreaChart({
  data,
  categoryField,
  valueField,
  color = '#2563eb',
  fillColor = '#dbeafe',
  className,
  height = '100%',
  valueLabel,
  tooltipFormatter,
  tooltipTextFormatter,
  yAxisFormatter,
}: AreaChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const tooltipFormatterRef = useStableRef(tooltipFormatter);
  const tooltipTextFormatterRef = useStableRef(tooltipTextFormatter);
  const yAxisFormatterRef = useStableRef(yAxisFormatter);

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

    const xRenderer = am5xy.AxisRendererX.new(root, { minGridDistance: 30 });
    applyAxisTheme(xRenderer, colors);
    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField,
        renderer: xRenderer,
      }),
    );

    const yRenderer = am5xy.AxisRendererY.new(root, {});
    applyAxisTheme(yRenderer, colors);
    yRenderer.labels.template.adapters.add('text', (text) => {
      const formatter = yAxisFormatterRef.current;
      if (!formatter) return text;
      const num = Number(String(text).replace(/[^0-9.-]/g, ''));
      if (!Number.isNaN(num)) return formatter(num);
      return text;
    });
    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: yRenderer,
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
      am5xy.SmoothedXYLineSeries.new(root, {
        xAxis,
        yAxis,
        valueYField: valueField,
        categoryXField: categoryField,
        tooltip,
      }),
    );

    series.set('snapTooltip', true);

    series.strokes.template.setAll({
      stroke: am5.color(color),
      strokeWidth: 3,
      interactive: true,
    });
    bindSpriteTooltipText(series.strokes.template, categoryField, valueField, getTooltipConfig);

    series.fills.template.setAll({
      fill: am5.color(fillColor),
      fillOpacity: 0.5,
      visible: true,
      interactive: true,
    });
    bindSpriteTooltipText(series.fills.template, categoryField, valueField, getTooltipConfig);

    series.bullets.push(() =>
      am5.Bullet.new(root, {
        sprite: am5.Circle.new(root, {
          radius: 6,
          fill: am5.color(color),
          stroke: am5.color(color),
          interactive: true,
        }),
      }),
    );

    const cursor = chart.set(
      'cursor',
      am5xy.XYCursor.new(root, {
        behavior: 'none',
        snapToSeries: [series],
      }),
    );
    cursor.lineY.set('visible', false);
    cursor.lineX.set('visible', false);

    xAxis.data.setAll(data);
    series.data.setAll(data);
    series.appear(800);
    chart.appear(800, 100);

    return () => {
      root.dispose();
    };
  }, [data, categoryField, valueField, color, fillColor, valueLabel, theme]);

  return <div ref={chartRef} className={cn('w-full', className)} style={{ height }} />;
}
