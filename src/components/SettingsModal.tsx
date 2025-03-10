import React, { useEffect, useMemo, useState } from "react";
import { useConfig } from "../config/useConfig";
import { type Config, type ConfigObj } from "../config/config";
import styles from "./SettingsModal.module.scss";
import LedFx, { LedFxDevice } from "../ledfx/ledfx";
import useCurrentColors from "../config/useCurrentColors";
import { getRgbString } from "../colors";
import Dropdown from "./Dropdown";
import Field from "./Field";
import Toggle from "./Toggle";
import ColorsConfigMenu from "./ColorsConfigMenu";

const cn = Spicetify.classnames;

export const titles: Record<keyof ConfigObj, string> = {
  deviceId: "Device",
  ledFxUrl: "LedFx URL",
  presets: "Presets",
  sortColors: "Sort colors by vibrance and lightness",
  debug: "Debug in console",
  selectedPreset: "Active Preset",
};

export type SetFn = (
  key: keyof ConfigObj,
  value: ConfigObj[typeof key]
) => void;

export interface AnyInputProps {
  objKey: keyof ConfigObj;
  setFn: SetFn;
  error?: string;
}

interface SettingsModalProps {
  config: Config;
}

export default function SettingsModal({ config }: SettingsModalProps) {
  const { setValue, configData } = useConfig(config);
  const colors = useCurrentColors();
  const ledfx = useMemo(() => new LedFx(config), []);

  const [newConfig, setNewConfig] = useState(configData);
  const [deviceList, setDeviceList] = useState<LedFxDevice[] | null>(null);
  const [virtualsList, setVirtualsList] = useState<string[] | null>(null);

  const diff = useMemo(() => {
    return Object.entries(configData).reduce((acc, [key, value]) => {
      const newValue = newConfig[key as keyof ConfigObj];
      if (Array.isArray(newValue)) {
        if (JSON.stringify(newValue) === JSON.stringify(value)) return acc;
        // @ts-expect-error
        acc[key] = newConfig[key];
      } else {
        if (newValue === value) return acc;
        // @ts-expect-error
        acc[key] = newConfig[key];
      }
      return acc;
    }, {} as Partial<ConfigObj>);
  }, [configData, newConfig]);

  const getDevices = async () => {
    const devices = await ledfx.listDevices();
    const virtuals =
      (await ledfx.listVirtuals())?.filter(
        (v) => !devices || !devices.some((d) => d.id === v)
      ) || null;
    setDeviceList(devices);
    setVirtualsList(virtuals);
  };

  const keysFromDiff = (keys: (keyof ConfigObj)[]) => {
    const filteredDiff = {} as Partial<ConfigObj>;
    for (const key of keys) {
      if (key in diff) {
        // @ts-expect-error
        filteredDiff[key] = diff[key];
      }
    }
    return filteredDiff;
  };

  const diffDeviceConfig = keysFromDiff(["ledFxUrl", "deviceId"]);
  const savableDeviceConfig =
    Object.keys(diffDeviceConfig).length > 0 && newConfig.ledFxUrl;

  const diffColorsConfig = keysFromDiff([
    "sortColors",
    "selectedPreset",
    "presets",
  ]);
  const savableColorConfig = Object.keys(diffColorsConfig).length > 0;

  useEffect(() => {
    getDevices();
  }, [configData.ledFxUrl, configData.deviceId]);

  const set: SetFn = (key, value) => {
    setNewConfig((prev) => ({ ...prev, [key]: value }));
  };

  const save = (diffValues: Partial<ConfigObj>) => {
    for (const key in diffValues) {
      // @ts-expect-error
      setValue(key, diffValues[key]);
    }
  };

  const reset = () => {
    setNewConfig(configData);
  };

  const presetsChanged = (newPresets: ConfigObj["presets"]) => {
    setNewConfig((prev) => ({ ...prev, presets: newPresets }));
  };

  const selectedPresetChanged = (newPreset: number) => {
    setNewConfig((prev) => ({ ...prev, selectedPreset: newPreset }));
  };

  return (
    <div className={styles.parent}>
      <h2>Device</h2>
      <Field objKey="ledFxUrl" value={newConfig.ledFxUrl} setFn={set} />
      <Dropdown
        objKey="deviceId"
        originalValue={configData.deviceId}
        value={newConfig.deviceId}
        options={(
          deviceList?.map((v) => ({
            title: v.name,
            subtitle: "Device with ID " + v.id,
            value: v.id,
          })) ?? []
        ).concat(
          virtualsList?.map((v) => ({
            title: v,
            subtitle: "Virtual device",
            value: v,
          })) ?? []
        )}
        setFn={set}
        error={
          deviceList ? undefined : "No devices found, check LedFx URL/instance"
        }
      />
      <Spicetify.ReactComponent.ButtonPrimary
        disabled={!savableDeviceConfig}
        onClick={() => save(diffDeviceConfig)}
      >
        Save device config
      </Spicetify.ReactComponent.ButtonPrimary>
      <h2>Colors</h2>
      <h4>Current Colors</h4>
      <div className={styles.colorDisplay}>
        {colors
          ? colors.map((color, i) => (
              <div
                key={i}
                style={{ backgroundColor: getRgbString(...color), opacity: 1 }}
              />
            ))
          : "No colors found"}
      </div>
      <Toggle objKey="sortColors" value={newConfig.sortColors} setFn={set} />
      <h4>Color Settings</h4>
      <ColorsConfigMenu
        config={config}
        hasChanges={savableColorConfig}
        presetsChanged={presetsChanged}
        selectedPresetChanged={selectedPresetChanged}
      />
      <span className={styles.subtitle}>
        Note: After changing back to Unset, you still need to reset the color
        inside LedFx dashboard!
      </span>
      <div className={styles.saveButtons}>
        <Spicetify.ReactComponent.ButtonPrimary
          disabled={!savableColorConfig}
          onClick={() => save(diffColorsConfig)}
        >
          Save color config
        </Spicetify.ReactComponent.ButtonPrimary>
        <Spicetify.ReactComponent.ButtonSecondary
          disabled={!savableColorConfig}
          onClick={reset}
        >
          Reset color config
        </Spicetify.ReactComponent.ButtonSecondary>
      </div>
    </div>
  );
}
