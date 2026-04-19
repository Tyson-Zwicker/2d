import { SimObject } from './simobject.js';
export declare class Main {
    static delta: number;
    static time: number;
    static oldTime: number;
    static creatorsFunction: (() => void) | undefined;
    static currentFrame: number;
    static maxLoopTime: number;
    static continue: boolean;
    static fpsMillis: number;
    static loopTime: number;
    static collisions: Map<string, SimObject[]>;
    static run(fps?: number): void;
    static loop(startTime?: number): void;
    static doWork(): void;
    static checkMouse(): void;
    static showDelta(): void;
}
//# sourceMappingURL=main.d.ts.map