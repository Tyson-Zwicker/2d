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
    for (let i = this.foreground.length - 1; i >= 0; i--) {
      if (!this.foreground[i].render()) this.foreground.splice(i, 1);
    }
  }

  static renderBackground(): void {
    for (let i = this.background.length - 1; i >= 0; i--) {
      if (!this.background[i].render()) this.background.splice(i, 1);
    }
  }
}
