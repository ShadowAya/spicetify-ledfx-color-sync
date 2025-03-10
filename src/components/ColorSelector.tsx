import React, { useRef, useState } from "react";
import {
  buildColor,
  COLOR_KEYS,
  getContrastColor,
  getHexString,
} from "../colors";
import { ColorData } from "../config/config";
import styles from "./ColorSelector.module.scss";
import { RGBColor } from "colorthief";
import { AddIconFill, CloseIcon } from "./Icons";
import { Entries } from "type-fest";

interface ColorSelectorProps {
  colorKey: keyof typeof COLOR_KEYS;
  colorData: ColorData[string] | undefined;
  renderedColors: SizedArray<RGBColor, 5> | null;
  setColorData: (
    colorKey: keyof typeof COLOR_KEYS,
    data: ColorData[string] | undefined
  ) => void;
}

function mapPercentage(value: number): number {
  const inMin = 0;
  const inMax = 100;
  const outMin = 2;
  const outMax = 95;
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

export default function ColorSelector({
  colorKey,
  colorData,
  renderedColors,
  setColorData,
}: ColorSelectorProps) {
  const colorDataExists = colorData !== undefined;

  if (!renderedColors) return null;

  const gradientEm = useRef<HTMLDivElement | null>(null);
  const addIcon = useRef<HTMLDivElement | null>(null);
  const [mousePosition, setMousePosition] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = gradientEm.current?.getBoundingClientRect();
    if (rect) {
      setMousePosition(e.clientX - rect.left - 12.5);
    }
  };

  const handleMouseEnter = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (e.currentTarget === e.target) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (e.currentTarget === e.target) {
      setIsHovered(false);
    }
  };

  const setGradientPart = (key: number, value: number) => {
    const newColorData = colorData
      ? { ...(colorData as Record<number, number>) }
      : {};
    newColorData[key] = value;
    setColorData(colorKey, newColorData);
  };

  const deleteGradientPart = (key: number) => {
    const newColorData = colorData
      ? { ...(colorData as Record<number, number>) }
      : {};
    delete newColorData[key];
    setColorData(colorKey, newColorData);
  };

  const addGradientPart = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const newColorData = colorData
      ? { ...(colorData as Record<number, number>) }
      : {};

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    const key = Math.round(percentage);
    newColorData[key] = 0;
    setColorData(colorKey, newColorData);
  };

  return (
    <div className={styles.container}>
      <span>{colorKey.replace("_", " ")}</span>
      {colorKey === "gradient" || typeof colorData === "object" ? (
        <div className={styles.gradientColor}>
          <div
            ref={gradientEm}
            style={{
              background: colorData
                ? buildColor(colorData, renderedColors) ?? "black"
                : "black",
            }}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={(e) => addGradientPart(e)}
          >
            <div
              ref={addIcon}
              className={styles.addIcon}
              style={{
                display: isHovered ? "block" : "none",
                position: "absolute",
                left: mousePosition,
              }}
            >
              <AddIconFill height={25} width={25} />
            </div>
            {Object.keys(colorData ?? {}).length < 2 && (
              <span className={styles.unsetText}>Unset</span>
            )}
            {colorData !== undefined &&
              (
                Object.entries(colorData) as unknown as Entries<
                  typeof colorData
                >
              ).map(([key, value]) => (
                <div
                  key={key}
                  className={styles.gradientPart}
                  style={{
                    left: `calc(${mapPercentage(key)}% - 15px)`,
                    background: buildColor(value, renderedColors) ?? "black",
                    color: getContrastColor(renderedColors[value]) ?? "white",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    const newValue =
                      value + 1 >= renderedColors.length ? 0 : value + 1;
                    setGradientPart(key, newValue);
                  }}
                >
                  <div
                    style={{
                      background: buildColor(value, renderedColors) ?? "black",
                    }}
                  />
                  <span>{value + 1}</span>
                  <span>{key}%</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteGradientPart(key);
                    }}
                    style={{
                      color: getContrastColor(renderedColors[value]) ?? "white",
                    }}
                  >
                    <CloseIcon height={12} width={12} />
                  </button>
                </div>
              ))}
          </div>
        </div>
      ) : (
        <div
          className={styles.singleColor}
          style={{
            backgroundColor: colorDataExists
              ? getHexString(...renderedColors[colorData])
              : "black",
            color: colorDataExists
              ? getContrastColor(renderedColors[colorData])
              : "white",
            opacity: 1,
          }}
          onClick={(e) => {
            e.stopPropagation();
            const newColorData = colorDataExists
              ? colorData + 1 >= renderedColors.length
                ? undefined
                : colorData + 1
              : 0;
            setColorData(colorKey, newColorData);
          }}
        >
          <span>{colorDataExists ? `Color #${colorData + 1}` : "Unset"}</span>
        </div>
      )}
    </div>
  );
}
