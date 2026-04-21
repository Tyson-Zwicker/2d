import { Point } from './geometry.js';
import { SimObject } from './simobject.js';

/** Base interface for all effects */
export interface Effect {
  render(): boolean;
}

export type EffectAnchor = Point | SimObject;

export function resolveEffectAnchor(anchor: EffectAnchor): Point {
  if (anchor instanceof SimObject) {
    return anchor.worldPosition;
  }
  return anchor;
}

export class Effects {
  static foreground: Effect[] = [];
  static background: Effect[] = [];

  static addForeground(effect: Effect | Effect[]): void {
    if (Array.isArray(effect)) {
      this.foreground.push(...effect);
    } else {
      this.foreground.push(effect);
    }
  }

  static addBackground(effect: Effect | Effect[]): void {
    if (Array.isArray(effect)) {
      this.background.push(...effect);
    } else {
      this.background.push(effect);
    }
  }

  static renderForeground(): void {
    const survivors: Effect[] = [];
    for (const effect of this.foreground) {
      if (effect.render()) survivors.push(effect);
    }
    this.foreground = survivors;
  }

  static renderBackground(): void {
    const survivors: Effect[] = [];
    for (const effect of this.background) {
      if (effect.render()) survivors.push(effect);
    }
    this.background = survivors;
  }
}
