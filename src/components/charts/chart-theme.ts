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

export function createTooltip(root: am5.Root, labelText: string) {
  return am5.Tooltip.new(root, {
    labelText,
    getFillFromSprite: false,
    autoTextColor: false,
  });
}

export function styleTooltip(tooltip: am5.Tooltip, colors: ReturnType<typeof getChartColors>) {
  tooltip.get('background')?.setAll({
    fill: colors.tooltipBg,
    stroke: colors.tooltipBorder,
    strokeWidth: 1,
  });
  tooltip.label.setAll({ fill: colors.tooltipText, fontSize: 12 });
}
