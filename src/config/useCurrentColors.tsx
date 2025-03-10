import { RGBColor } from "colorthief";
import { useEffect, useState } from "react";
import type ColorUpdatedEvent from "../ledfx/ColorUpdatedEvent";

export default function useCurrentColors() {
  const [colors, setColors] = useState<SizedArray<RGBColor, 5> | null>(null);

  useEffect(() => {
    const colorUpdated = (e: ColorUpdatedEvent) => {
      setColors(e.detail);
    };

    document.addEventListener("albumColorUpdated", colorUpdated);

    return () => {
      document.removeEventListener("albumColorUpdated", colorUpdated);
    };
  }, []);

  return colors;
}
