import React, { useMemo } from "react";
import styles from "./ColorsSubmenu.module.scss";
import { type ColorData } from "../config/config";
import { EFFECT_NAMES, COLOR_KEYS } from "../colors";
import { ResetIcon, SparkleIcon } from "./Icons";
import LedFx from "../ledfx/ledfx";
import ColorSelector from "./ColorSelector";
import useCurrentColors from "../config/useCurrentColors";
const cn = Spicetify.classnames;

interface ColorsSubmenuProps {
  data: ColorData;
  setData: (data: ColorData) => void;
  ledFx: LedFx;
}

export default function ColorsSubmenu({
  data,
  setData,
  ledFx,
}: ColorsSubmenuProps) {
  const colors = useCurrentColors();
  const [selectedEffects, setSelectedEffects] = React.useState<
    (keyof typeof EFFECT_NAMES)[]
  >([]);

  const check = (effectValue: string, active: boolean) => {
    if (active) {
      setSelectedEffects([
        ...selectedEffects,
        effectValue as keyof typeof EFFECT_NAMES,
      ]);
    } else {
      setSelectedEffects(
        selectedEffects.filter((effect) => effect !== effectValue)
      );
    }
  };

  const activeColors = useMemo(() => {
    if (selectedEffects.length === 0)
      return Object.keys(COLOR_KEYS) as (keyof typeof COLOR_KEYS)[];

    const activeColors: (keyof typeof COLOR_KEYS)[] = [];
    Object.entries(COLOR_KEYS).forEach(([key, colorKey]) => {
      if (colorKey.some((k) => selectedEffects.includes(k))) {
        activeColors.push(key as keyof typeof COLOR_KEYS);
      }
    });
    return activeColors;
  }, [selectedEffects]);

  const autoSelectFilter = async () => {
    const activeConfig = await ledFx.getEffect();
    if (!activeConfig) return;
    const effectName = activeConfig.type;
    if (selectedEffects.includes(effectName)) {
      setSelectedEffects(
        selectedEffects.filter((effect) => effect !== effectName)
      );
    } else {
      setSelectedEffects([
        ...selectedEffects,
        effectName as keyof typeof EFFECT_NAMES,
      ]);
    }
  };

  const resetFilters = () => {
    setSelectedEffects([]);
  };

  return (
    <div className={styles.container}>
      <div>
        <span>Filters</span>
        <div className={styles.pills}>
          <div>
            <button
              onClick={autoSelectFilter}
              className={styles.active}
              title="Auto-select curent effect"
            >
              <SparkleIcon width={20} height={20} />
            </button>
            <button
              onClick={resetFilters}
              className={cn(styles.active, styles.padRight)}
              title="Reset effect filters"
            >
              <ResetIcon width={16} height={16} />
            </button>
            {Object.entries(EFFECT_NAMES)
              .sort(([keyA], [keyB]) => {
                const isCheckedA = selectedEffects.includes(
                  keyA as keyof typeof EFFECT_NAMES
                );
                const isCheckedB = selectedEffects.includes(
                  keyB as keyof typeof EFFECT_NAMES
                );
                return isCheckedA === isCheckedB ? 0 : isCheckedA ? -1 : 1;
              })
              .map(([key, effectName]) => (
                <EffectPill
                  key={effectName}
                  checked={selectedEffects.includes(
                    key as keyof typeof EFFECT_NAMES
                  )}
                  effectName={effectName}
                  effectValue={key as keyof typeof EFFECT_NAMES}
                  check={check}
                />
              ))}
          </div>
        </div>
      </div>
      <div className={styles.colors}>
        {activeColors.map((colorKey) => (
          <ColorSelector
            key={colorKey}
            colorKey={colorKey}
            colorData={data[colorKey]}
            renderedColors={colors}
            setColorData={(colorKey, newData) => {
              const res = { ...data };
              if (newData === undefined) delete res[colorKey];
              else res[colorKey] = newData;
              setData(res);
            }}
          />
        ))}
      </div>
    </div>
  );
}

interface EffectPillProps {
  effectName: (typeof EFFECT_NAMES)[keyof typeof EFFECT_NAMES];
  effectValue: keyof typeof EFFECT_NAMES;
  checked: boolean;
  check: (effectValue: string, active: boolean) => void;
}

function EffectPill({
  effectName,
  effectValue,
  check,
  checked,
}: EffectPillProps) {
  return (
    <button
      onClick={() => check(effectValue, !checked)}
      className={cn(checked && styles.active)}
    >
      {effectName}
    </button>
  );
}
