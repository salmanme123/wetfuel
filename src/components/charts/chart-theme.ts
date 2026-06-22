import * as am5 from '@amcharts/amcharts5';
import type * as am5xy from '@amcharts/amcharts5/xy';

export function isDarkMode(): boolean {
  return document.documentElement.classList.contains('dark');
}

export function getChartColors() {
  const dark = isDarkMode();
  return {
    text: am5.color(dark ? 0xaaaaaa : 0x666666),
    grid: am5.color(dark ? 0x333333 : 0xf0f0f0),
    tooltipBg: am5.color(dark ? 0x262626 : 0xffffff),
    tooltipText: am5.color(dark ? 0xf5f5f5 : 0x1a1a1a),
    tooltipBorder: am5.color(dark ? 0x404040 : 0xe5e5e5),
  };
}

export function applyAxisTheme(
  renderer: am5xy.AxisRendererX | am5xy.AxisRendererY,
  colors: ReturnType<typeof getChartColors>,
) {
  renderer.grid.template.setAll({ stroke: colors.grid, strokeOpacity: 1 });
  renderer.labels.template.setAll({ fill: colors.text, fontSize: 12 });
}

export function createTooltip(root: am5.Root, categoryField: string, valueField: string) {
  return am5.Tooltip.new(root, {
    labelText: `{${categoryField}}\n{${valueField}}`,
    getFillFromSprite: false,
    autoTextColor: false,
    pointerOrientation: 'vertical',
  });
}

export interface ChartTooltipContext {
  category: string;
  value: number;
  data: Record<string, string | number>;
}

export interface ChartTooltipConfig {
  categoryField: string;
  valueField: string;
  valueLabel?: string;
  tooltipFormatter?: (value: number) => string;
  tooltipTextFormatter?: (ctx: ChartTooltipContext) => string;
}

export function formatTooltipText(
  ctx: ChartTooltipContext,
  config: ChartTooltipConfig,
): string {
  if (config.tooltipTextFormatter) {
    return config.tooltipTextFormatter(ctx);
  }

  const formatted = config.tooltipFormatter
    ? config.tooltipFormatter(ctx.value)
    : String(ctx.value);
  const label = config.valueLabel ?? 'Value';

  return `${ctx.category}\n${label}: ${formatted}`;
}

function resolveTooltipDataContext(target: am5.Sprite): Record<string, string | number> | undefined {
  let node: am5.Sprite | undefined = target;
  while (node) {
    const ctx = node.dataItem?.dataContext;
    if (ctx) return ctx as Record<string, string | number>;
    node = node.parent;
  }
  return undefined;
}

function formatTooltipFromContext(
  dataContext: Record<string, string | number>,
  categoryField: string,
  valueField: string,
  getConfig: () => ChartTooltipConfig,
): string {
  const category = String(dataContext[categoryField] ?? '');
  const value = Number(dataContext[valueField] ?? 0);
  return formatTooltipText({ category, value, data: dataContext }, getConfig());
}

export function bindTooltipLabel(
  tooltip: am5.Tooltip,
  categoryField: string,
  valueField: string,
  getConfig: () => ChartTooltipConfig,
) {
  tooltip.set('labelText', `{${categoryField}}\n{${valueField}}`);

  tooltip.label.adapters.add('text', (text, target) => {
    const dataContext = resolveTooltipDataContext(target);
    if (dataContext) {
      return formatTooltipFromContext(dataContext, categoryField, valueField, getConfig);
    }

    const config = getConfig();
    if (config.tooltipTextFormatter && text) {
      const [category = '', rawValue = ''] = text.split('\n');
      const value = Number(String(rawValue).replace(/[^0-9.-]/g, ''));
      if (!Number.isNaN(value)) {
        return formatTooltipText({ category, value, data: {} }, config);
      }
    }

    return text;
  });
}

export function bindSpriteTooltipText(
  template: unknown,
  categoryField: string,
  valueField: string,
  getConfig: () => ChartTooltipConfig,
) {
  const t = template as {
    adapters: { add: (key: string, fn: (text: string, target: am5.Sprite) => string) => void };
  };
  t.adapters.add('tooltipText', (_text: string, target: am5.Sprite) => {
    const dataContext = resolveTooltipDataContext(target);
    if (!dataContext) return _text;
    return formatTooltipFromContext(dataContext, categoryField, valueField, getConfig);
  });
}

export function styleTooltip(tooltip: am5.Tooltip, colors: ReturnType<typeof getChartColors>) {
  tooltip.get('background')?.setAll({
    fill: colors.tooltipBg,
    stroke: colors.tooltipBorder,
    strokeWidth: 1,
  });
  tooltip.label.setAll({
    fill: colors.tooltipText,
    fontSize: 12,
    textAlign: 'center',
  });
}

export function createStyledTooltip(
  root: am5.Root,
  categoryField: string,
  valueField: string,
  getConfig: () => ChartTooltipConfig,
) {
  const colors = getChartColors();
  const tooltip = createTooltip(root, categoryField, valueField);
  bindTooltipLabel(tooltip, categoryField, valueField, getConfig);
  styleTooltip(tooltip, colors);
  return tooltip;
}
