import { RGBColor } from "colorthief";

export type ColorData = Record<string, number | Record<number, number>>;
export type ParsedColorData = Record<
  string,
  RGBColor | Record<number, RGBColor>
>;

export type ConfigObj = {
  deviceId: string | null;
  ledFxUrl: string;
  sortColors: boolean;
  debug: boolean;
  presets: {
    name: string;
    colorData: ColorData;
  }[];
  selectedPreset: number;
};

export class ConfigUpdateEvent extends CustomEvent<{
  key: keyof ConfigObj;
  value: ConfigObj[keyof ConfigObj];
}> {
  constructor(key: keyof ConfigObj, value: ConfigObj[keyof ConfigObj]) {
    super("LedFxConfigUpdated", { detail: { key, value } });
  }
}

export class Config {
  public config: ConfigObj;

  private static lsKey = "color-extractor-config";
  private static defaults: ConfigObj = {
    deviceId: null,
    ledFxUrl: "http://127.0.0.1:8888/",
    sortColors: true,
    debug: false,
    presets: [
      {
        name: "Default",
        colorData: {
          gradient: {
            0: 0,
            20: 1,
            40: 2,
            60: 3,
            80: 4,
            100: 0,
          },
          strobe_color: 0,
        },
      },
    ],
    selectedPreset: 0,
  };

  constructor() {
    const configString = Spicetify.LocalStorage.get("color-extractor-config");
    let config: ConfigObj;

    if (!configString) {
      Spicetify.LocalStorage.set(Config.lsKey, JSON.stringify(Config.defaults));
      config = Config.defaults;
    } else {
      config = JSON.parse(configString);
      let missingKeys = false;
      for (const key in Config.defaults) {
        if (!(key in config)) {
          // @ts-expect-error
          config[key] = Config.defaults[key];
          missingKeys = true;
        }
      }
      if (missingKeys) {
        Spicetify.LocalStorage.set(Config.lsKey, JSON.stringify(config));
      }
    }

    this.config = config;
  }

  getAll() {
    return this.config;
  }

  set<K extends keyof ConfigObj>(key: K, value: ConfigObj[K]) {
    this.config[key] = value;
    Spicetify.LocalStorage.set(Config.lsKey, JSON.stringify(this.config));
    document.dispatchEvent(new ConfigUpdateEvent(key, value));
  }

  get<T extends keyof ConfigObj>(key: T): ConfigObj[T] {
    return this.config[key];
  }
}
