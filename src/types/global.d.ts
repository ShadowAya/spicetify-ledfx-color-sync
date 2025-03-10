import type { ConfigUpdateEvent } from "../config/config";
import ColorUpdatedEvent from "../ledfx/ColorUpdatedEvent";

declare global {
  interface DocumentEventMap {
    LedFxConfigUpdated: ConfigUpdateEvent;
    albumColorUpdated: ColorUpdatedEvent;
  }
  type SizedArray<
    T,
    Size extends number,
    R extends T[] = []
  > = R["length"] extends Size ? R : SizedArray<T, Size, [...R, T]>;
}

export {};
