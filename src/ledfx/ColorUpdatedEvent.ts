import { RGBColor } from "colorthief";

type ColorEvent = SizedArray<RGBColor, 5> | null;

export default class ColorUpdatedEvent extends CustomEvent<ColorEvent> {
  constructor(detail: ColorEvent) {
    super("albumColorUpdated", { detail });
  }
}
