import ColorThief, { RGBColor } from "colorthief";
import { sortColors } from "./colors";
import { waitForImageElement } from "./elementLoaders";
import { registerContextMenuItem } from "./components";
import SettingsModal from "./components/SettingsModal";
import React from "react";
import { Config, ConfigUpdateEvent } from "./config/config";
import LedFx from "./ledfx/ledfx";
import ColorUpdatedEvent from "./ledfx/ColorUpdatedEvent";

function ColorExtractor() {
  console.log("LedFX Color Extractor Loaded");
  updateColor();

  const config = new Config();
  const ledfx = new LedFx(config);

  const modalEm = document.createElement("div");
  Spicetify.ReactDOM.render(<SettingsModal config={config} />, modalEm);

  registerContextMenuItem("Set up LedFx", () => {
    Spicetify.PopupModal.display({
      title: "Set up LedFx",
      content: modalEm,
      isLarge: true,
    });
  });

  async function getDominantColorFromImage(attempts = 0) {
    const img = await waitForImageElement(
      ".main-image-image.cover-art-image.main-image-loaded"
    );
    if (!img) return null;
    try {
      const colorThief = new ColorThief();
      let colorPalette = colorThief.getPalette(img, 5);
      if (!colorPalette) return null;
      if (!config.get("sortColors"))
        return colorPalette as SizedArray<RGBColor, 5>;
      return sortColors(colorPalette, config.get("debug")) as SizedArray<
        RGBColor,
        5
      >;
    } catch (error) {
      if (attempts < 3) {
        console.error("Error extracting color, retrying...");
        return getDominantColorFromImage(attempts + 1);
      } else {
        console.error("Error extracting color, giving up.");
        return null;
      }
    }
  }

  async function updateColor() {
    const colors = await getDominantColorFromImage();
    if (!colors) return;

    const deviceId = config.get("deviceId");

    if (deviceId) ledfx.setEffectColors(deviceId, colors);

    document.dispatchEvent(new ColorUpdatedEvent(colors));
  }

  function updateColorOnSongChange() {
    setTimeout(updateColor, 500);
  }

  function updateColorOnSortChange(e: ConfigUpdateEvent) {
    if (e.detail.key === "sortColors") updateColor();
  }

  document.addEventListener("LedFxConfigUpdated", updateColorOnSortChange);
  Spicetify.Player.addEventListener("songchange", updateColorOnSongChange);
}

export default ColorExtractor;
