import React, { useEffect, useMemo, useState } from "react";
import { ColorData, Config, ConfigObj } from "../config/config";
import { useConfig } from "../config/useConfig";
import Dropdown from "./Dropdown";
import styles from "./ColorsConfigMenu.module.scss";
import { AddIcon, CancelIcon, CheckIcon, DeleteIcon, EditIcon } from "./Icons";
import { SetFn } from "./SettingsModal";
import { SimpleField, StaticField } from "./Field";
import ColorsSubmenu from "./ColorsSubmenu";
import LedFx from "../ledfx/ledfx";
const cn = Spicetify.classnames;

interface ColorsConfigMenuProps {
  config: Config;
  hasChanges: boolean;
  presetsChanged: (newPresets: ConfigObj["presets"]) => void;
  selectedPresetChanged: (newPreset: number) => void;
}

export default function ColorsConfigMenu({
  config,
  hasChanges,
  presetsChanged,
  selectedPresetChanged,
}: ColorsConfigMenuProps) {
  const { configData } = useConfig(config);
  const ledfx = useMemo(() => new LedFx(config), []);

  const [currentAction, setCurrentAction] = useState<
    "delete" | "add" | "rename" | null
  >(null);

  const [selectedPresetIndex, setSelectedPresetIndex] = useState(
    configData.selectedPreset
  );
  const [newPresetsConfig, setNewPresetsConfig] = useState<
    ConfigObj["presets"]
  >(configData.presets);
  const selectedPreset = newPresetsConfig[selectedPresetIndex];

  useEffect(() => {
    if (!hasChanges) {
      setNewPresetsConfig(configData.presets);
      setSelectedPresetIndex(configData.selectedPreset);
    }
  }, [hasChanges]);

  useEffect(() => {
    presetsChanged(newPresetsConfig);
  }, [newPresetsConfig]);

  useEffect(() => {
    selectedPresetChanged(selectedPresetIndex);
  }, [selectedPresetIndex]);

  const setSelectedPreset: SetFn = (_, value) => {
    setSelectedPresetIndex(parseInt(value as string));
  };

  const deletePreset = () => {
    const index = selectedPresetIndex;
    if (index === 0) return;
    setNewPresetsConfig((prev) => {
      const newPresets = [...prev];
      newPresets.splice(index, 1);
      return newPresets;
    });
    setSelectedPresetIndex(0);
  };

  const [newPresetName, setNewPresetName] = useState("");
  const addPreset = () => {
    setNewPresetsConfig((prev) => [
      ...prev,
      {
        name: newPresetName,
        colorData: {},
      },
    ]);
    setSelectedPresetIndex(newPresetsConfig.length);
  };

  const [renamePresetName, setRenamePresetName] = useState("");
  const renamePreset = () => {
    setNewPresetsConfig((prev) => {
      const newPresets = [...prev];
      newPresets[selectedPresetIndex].name = renamePresetName;
      return newPresets;
    });
  };

  const confirmAction = () => {
    if (currentAction === "delete") {
      deletePreset();
    } else if (currentAction === "add") {
      addPreset();
    } else if (currentAction === "rename") {
      renamePreset();
    }
    setCurrentAction(null);
  };

  const setData = (data: ColorData) => {
    setNewPresetsConfig((prev) => {
      const newPresets = JSON.parse(JSON.stringify(prev));
      newPresets[selectedPresetIndex].colorData = data;
      return newPresets;
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.select}>
        {currentAction === "rename" ? (
          <SimpleField
            value={renamePresetName}
            setValue={setRenamePresetName}
            label="Rename Preset"
          />
        ) : currentAction === "delete" ? (
          <StaticField value={selectedPreset.name} label="Delete Preset" />
        ) : currentAction === "add" ? (
          <SimpleField
            value={newPresetName}
            setValue={setNewPresetName}
            label="Add Preset"
          />
        ) : (
          <Dropdown
            value={selectedPresetIndex.toString()}
            originalValue={""}
            options={newPresetsConfig.map((preset, i) => ({
              title: preset.name,
              value: i.toString(),
            }))}
            objKey="selectedPreset"
            setFn={setSelectedPreset}
            label="Active Preset"
            noNull
          />
        )}
        <div>
          {!currentAction ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setNewPresetName("New Preset");
                  setCurrentAction("add");
                }}
              >
                <AddIcon height={18} width={18} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setRenamePresetName(selectedPreset.name);
                  setCurrentAction("rename");
                }}
                disabled={selectedPresetIndex === 0}
              >
                <EditIcon height={18} width={18} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentAction("delete");
                }}
                disabled={selectedPresetIndex === 0}
              >
                <DeleteIcon height={18} width={18} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  confirmAction();
                }}
              >
                <CheckIcon height={18} width={18} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentAction(null);
                }}
              >
                <CancelIcon height={18} width={18} />
              </button>
            </>
          )}
        </div>
      </div>
      <ColorsSubmenu
        data={selectedPreset.colorData}
        setData={setData}
        ledFx={ledfx}
      />
    </div>
  );
}
