import { tailwindcssPaletteGenerator } from '@bobthered/tailwindcss-palette-generator';
import convert from 'color-convert';

export type PaletteColor = {
  tag_bg_color: string;
  colors?: Record<string | number, string>;
  colorVars: string;
};

/**
 * Generate color
 *
 * @link https://github.com/javisperez/tailwindcolorshades/blob/master/src/composables/colors.ts
 * @link https://uicolors.app/create
 */
export function getColor(baseColor?: string | null, isPreviewFrame?: boolean): PaletteColor | undefined {
  if (!baseColor) {
    return { colorVars: '', tag_bg_color: '' };
  }

  const { primary: colors } = tailwindcssPaletteGenerator({ colors: [baseColor] });

  const colorVars = Object.entries(colors).map(([k, v]) => {
    const [h, s, l] = convert.hex.hsl(v);
    return `--primary-${k}:${h} ${s}% ${l}%;`;
  });

  const [ph, ps, pl] = convert.hex.hsl(colors[400]);
  colorVars.push(`--primary:${ph} ${ps}% ${pl}%;`);

  const cssVars = isPreviewFrame
    ? `.preview-frame-scope {${colorVars.join('\n')}}`
    : `:root {${colorVars.join('\n')}}\n.dark {${colorVars.join('\n')}}`;

  const res: PaletteColor = {
    tag_bg_color: colors[400],
    colors,
    colorVars: cssVars
  };

  return res;
}
