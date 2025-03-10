import { useState, useEffect } from "react";
import { Config, ConfigObj } from "./config";
import { ConfigUpdateEvent } from "./config";

export const useConfig = (config: Config) => {
  const [configData, setConfigData] = useState<ConfigObj>(() =>
    config.getAll()
  );

  useEffect(() => {
    const configUpdated = ({ detail }: ConfigUpdateEvent) => {
      setConfigData((prev) => ({ ...prev, [detail.key]: detail.value }));
    };

    document.addEventListener("LedFxConfigUpdated", configUpdated);

    return () => {
      document.removeEventListener("LedFxConfigUpdated", configUpdated);
    };
  }, []);

  const setValue = (key: keyof ConfigObj, value: ConfigObj[typeof key]) => {
    config.set(key, value);
    setConfigData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const getValue = (key: keyof ConfigObj): ConfigObj[typeof key] => {
    return configData[key];
  };

  return {
    configData,
    setValue,
    getValue,
  };
};
