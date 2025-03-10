import { type RGBColor } from "colorthief";
import { ColorData } from "./config/config";

export const COLOR_KEYS = {
  background_color: [
    "gradient",
    "fade",
    "rainbow",
    "random_flash",
    "singleColor",
    "bar",
    "multiBar",
    "strobe",
    "blade_power_plus",
    "energy",
    "magnitude",
    "pitchSpectrum",
    "power",
    "rain",
    "real_strobe",
    "scan",
    "scan_and_flare",
    "scan_multi",
    "scroll",
    "scroll_plus",
    "spectrum",
    "wavelength",
    "block_reflections",
    "crawler",
    "energy2",
    "fire",
    "glitch",
    "lava_lamp",
    "marching",
    "melt",
    "melt_and_sparkle",
    "water",
    "bands",
    "bands_matrix",
    "blocks",
    "equalizer",
    "equalizer2d",
    "noise2d",
    "plasma2d",
    "plasmawled",
    "texter2d",
    "metro",
    "pixels",
  ],
  gradient: [
    "gradient",
    "fade",
    "bar",
    "multiBar",
    "strobe",
    "blade_power_plus",
    "magnitude",
    "pitchSpectrum",
    "power",
    "real_strobe",
    "scan",
    "scan_and_flare",
    "scan_multi",
    "wavelength",
    "block_reflections",
    "crawler",
    "energy2",
    "fire",
    "glitch",
    "lava_lamp",
    "marching",
    "melt",
    "melt_and_sparkle",
    "water",
    "bands",
    "bands_matrix",
    "blocks",
    "equalizer",
    "digitalrain2d",
    "equalizer2d",
    "noise2d",
    "plasma2d",
    "plasmawled",
    "texter2d",
  ],
  hit_color: ["random_flash"],
  color: ["singleColor"],
  color_high: [
    "energy",
    "rain",
    "scan_multi",
    "scroll",
    "scroll_plus",
    "vumeter",
  ],
  color_lows: ["energy", "rain", "scan_multi", "scroll", "scroll_plus"],
  color_mids: [
    "energy",
    "rain",
    "scan_multi",
    "scroll",
    "scroll_plus",
    "vumeter",
  ],
  sparks_color: ["power"],
  strobe_color: ["real_strobe"],
  color_scan: ["scan", "scan_and_flare"],
  text_color: ["texter2d"],
  flash_color: ["metro"],
  pixel_color: ["pixels"],
  color_max: ["vumeter"],
  color_min: ["vumeter"],
} as const;

export const EFFECT_NAMES = {
  gradient: "Gradient",
  fade: "Fade",
  rainbow: "Rainbow",
  random_flash: "Random Flash",
  singleColor: "Single Color",
  bar: "Bar",
  multiBar: "Multicolor Bar",
  strobe: "BPM Strobe",
  blade_power_plus: "Blade Power+",
  energy: "Energy",
  magnitude: "Magnitude",
  pitchSpectrum: "Pitch Spectrum",
  power: "Power",
  rain: "Rain",
  real_strobe: "Strobe",
  scan: "Scan",
  scan_and_flare: "Scan and Flare",
  scan_multi: "Scan Multi",
  scroll: "Scroll",
  scroll_plus: "Scroll+",
  spectrum: "Spectrum",
  wavelength: "Wavelength",
  block_reflections: "Block Reflections",
  crawler: "Crawler",
  energy2: "Energy 2",
  fire: "Fire",
  glitch: "Glitch",
  lava_lamp: "Lava Lamp",
  marching: "Marching",
  melt: "Melt",
  melt_and_sparkle: "Melt and Sparkle",
  water: "Water",
  bands: "Bands",
  bands_matrix: "Bands Matrix",
  blocks: "Blocks",
  equalizer: "Equalizer",
  digitalrain2d: "Digital Rain",
  equalizer2d: "Equalizer2d",
  noise2d: "Noise",
  plasma2d: "Plasma",
  plasmawled: "PlasmaWled2d",
  texter2d: "Texter",
  metro: "Metro",
  pixels: "Pixels",
  vumeter: "VuMeter",
} as const;

function logColorInfoAsTable(
  color: RGBColor,
  expLum: number,
  lum: number,
  expSat: number,
  sat: number,
  priority: number
) {
  const rgbString = getRgbString(...color);

  console.log(`%c          `, `background: ${rgbString}; font-size: 20px;`);

  console.table({
    "Color (RGB)": [color.join(", ")],
    Luminance: [lum, expLum],
    Saturation: [sat, expSat],
    Priority: [priority],
  });
}

export function clampHex(value: number): number {
  return Math.min(255, Math.max(0, value));
}

export function getHexString(r: number, g: number, b: number): string {
  const rHex = clampHex(r).toString(16).padStart(2, "0");
  const gHex = clampHex(g).toString(16).padStart(2, "0");
  const bHex = clampHex(b).toString(16).padStart(2, "0");

  return `#${rHex}${gHex}${bHex}`.toUpperCase();
}

export function getRgbString(r: number, g: number, b: number): string {
  return `rgb(${r}, ${g}, ${b})`;
}

function luminance([r, g, b]: RGBColor): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function saturation([r, g, b]: RGBColor): number {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return (max - min) / 255;
}

export function getContrastColor(col: RGBColor | undefined) {
  if (!col) return undefined;
  return luminance(col) > 128 ? "#000000" : "#ffffff";
}

function customExp(
  value: number,
  minValue: number,
  maxValue: number,
  exponent: number
): number {
  const normalizedValue = (value - minValue) / (maxValue - minValue);
  const clampedValue = Math.min(1, Math.max(0.001, normalizedValue));
  return Math.pow(clampedValue, exponent);
}

const LUM_MIN = 0; // 0
const LUM_MAX = 90; // 255
const SAT_MIN = 0; // 0
const SAT_MAX = 0.9; // 1

export function sortColors(
  colors: RGBColor[],
  debug: boolean = false
): RGBColor[] {
  function calculatePriority(color: RGBColor, debug: boolean = false): number {
    const lum = luminance(color);
    const sat = saturation(color);

    const expLum = Math.min(customExp(lum, LUM_MIN, LUM_MAX, 3), 0.5);
    const expSat = customExp(sat, SAT_MIN, SAT_MAX, 1.1);

    let priority = Math.max(expSat * expLum, 0.00001);

    if (debug) logColorInfoAsTable(color, expLum, lum, expSat, sat, priority);

    return priority;
  }

  const sorted = colors.sort((a, b) => {
    return calculatePriority(b) - calculatePriority(a);
  });

  if (debug)
    for (const color of sorted) {
      calculatePriority(color, true);
    }

  return sorted;
}

export function buildColor(
  colorData: ColorData[string],
  colors: SizedArray<RGBColor, 5>
) {
  if (typeof colorData === "number") {
    const color = colors[colorData];
    return getHexString(color[0], color[1], color[2]);
  } else {
    if (Object.keys(colorData).length < 2) return null;

    let ret = "linear-gradient(90deg, ";
    for (const [key, value] of Object.entries(colorData)) {
      const color = colors[value];
      ret += `${getRgbString(color[0], color[1], color[2])} ${key}%, `;
    }
    ret = ret.slice(0, -2) + ")";
    return ret;
  }
}
