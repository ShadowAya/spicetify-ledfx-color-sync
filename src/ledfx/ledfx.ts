import { RGBColor } from "colorthief";
import {
  buildColor,
  EFFECT_NAMES,
  getHexString,
  getRgbString,
} from "../colors";
import { ColorData, Config, ParsedColorData } from "../config/config";

interface GenericResponse {
  status?: "success" & (string | {});
}

interface DeviceListResponse extends GenericResponse {
  devices: {
    [deviceId: string]: {
      config: {
        center_offset: number;
        create_segments: boolean;
        icon_name: string;
        ip_address: string;
        name: string;
        pixel_count: number;
        refresh_rate: number;
        rgbw_led: boolean;
        sync_mode: string;
        timeout: number;
      };
      id: string;
      type: string;
      online: boolean;
      virtuals: string[];
      active_virtuals: string[];
    };
  };
}

interface EffectListResponse extends GenericResponse {
  effect: {
    config: Record<string, unknown>;
    name: string;
    type: keyof typeof EFFECT_NAMES;
  };
}

interface VirtualsResponse extends GenericResponse {
  virtuals: Record<string, unknown>;
}

const EFFECT_COLOR_OVERRIDES = {
  lows_color: "color_lows",
  mids_color: "color_mids",
  high_color: "color_high",
  color_low: "color_lows",
  color_mid: "color_mids",
  color_peak: "color_high",
};

function removeTrailingSlash(url: string) {
  const urlTrimmed = url.trim();
  return urlTrimmed.endsWith("/") ? urlTrimmed.slice(0, -1) : urlTrimmed;
}

function objectFilter<
  K extends string | number | symbol,
  V,
  Ret extends "k" | "v" | "e"
>(
  obj: Record<K, V>,
  returns: Ret,
  predicate: (key: K, value: V) => boolean
): Ret extends "e" ? Record<K, V> : Ret extends "k" ? K[] : V[] {
  const filtered = (Object.entries(obj) as [K, V][]).filter(([key, value]) =>
    predicate(key, value)
  );
  if (returns === "k") return filtered.map(([key]) => key) as any;
  if (returns === "v") return filtered.map(([, value]) => value) as any;
  return Object.fromEntries(filtered) as any;
}

export type LedFxDevice = {
  id: string;
  name: string;
};

export default class LedFx {
  constructor(private config: Config) {}

  private urlOrNull(): string | null {
    const url = this.config.get("ledFxUrl");
    if (!url) return null;

    return `${removeTrailingSlash(url)}/api`;
  }

  private async makeRequest<T extends Record<any, any>>(
    endpoint: string,
    method: "GET" | "POST" | "PUT",
    body?: Record<string, unknown>
  ): Promise<T | null> {
    const url = this.urlOrNull();
    if (!url) return null;

    try {
      const res = await fetch(`${url}/${endpoint}`, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!res.ok) return null;

      const data = (await res.json()) as GenericResponse;

      if (data.status && data.status !== "success") return null;

      return data as T;
    } catch {
      return null;
    }
  }

  async listDevices(): Promise<LedFxDevice[] | null> {
    const url = this.urlOrNull();
    if (!url) return null;

    const data = await this.makeRequest<DeviceListResponse>("devices", "GET");

    if (!data) return null;

    const devices = Object.entries(data.devices).map(([key, value]) => ({
      id: key,
      name: value.config.name,
    }));

    return devices;
  }

  async listVirtuals() {
    const url = this.urlOrNull();
    if (!url) return null;

    const data = await this.makeRequest<VirtualsResponse>("virtuals", "GET");

    if (!data) return null;

    const virtuals = Object.keys(data.virtuals);

    return virtuals;
  }

  async getEffect(deviceId?: string) {
    if (!deviceId) deviceId = this.config.config.deviceId ?? undefined;
    if (!deviceId) return null;

    const url = this.urlOrNull();
    if (!url) return null;

    const data = await this.makeRequest<EffectListResponse>(
      `virtuals/${deviceId}/effects`,
      "GET"
    );

    if (!data) return null;

    return data.effect;
  }

  async setEffectColors(deviceId: string, colors: SizedArray<RGBColor, 5>) {
    const effect = await this.getEffect(deviceId);
    if (!effect) return false;

    const newData: Partial<EffectListResponse["effect"]> = {
      config: {},
      type: effect?.type,
    };

    const colorConfig =
      this.config.config.presets[this.config.config.selectedPreset].colorData;

    const colorKeys = extractColorData(effect);
    const activeOverrides = Object.keys(EFFECT_COLOR_OVERRIDES).filter((key) =>
      colorKeys.includes(key)
    ) as (keyof typeof EFFECT_COLOR_OVERRIDES)[];

    for (const [key, colorI] of Object.entries(colorConfig)) {
      const colorString = buildColor(colorI, colors);
      if (!colorString || !colorKeys.includes(key)) continue;
      newData.config![key] = colorString;
    }

    for (const key of activeOverrides) {
      const colorString = buildColor(
        colorConfig[EFFECT_COLOR_OVERRIDES[key]],
        colors
      );
      if (!colorString) continue;
      newData.config![key] = colorString;
    }

    const res = await this.makeRequest(
      `virtuals/${deviceId}/effects`,
      "PUT",
      newData
    );
    return res !== null;
  }
}

function extractColorData(effect: EffectListResponse["effect"]) {
  const colors = objectFilter(
    effect.config,
    "k",
    (_, v) =>
      typeof v === "string" &&
      (v.includes("#") || v.includes("linear-gradient(90deg"))
  );
  return colors;
}
