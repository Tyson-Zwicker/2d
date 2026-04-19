import { Camera, View } from './view.js';
import { Effects } from './effects.js';
import { Events } from './events.js';
import { Sim } from './sim.js';
import { GUI } from './gui.js';
import { RectBounds } from './geometry.js';
export class Main {
    static delta = 0;
    static time = 0;
    static oldTime = 0;
    static creatorsFunction = undefined;
    static currentFrame = 0;
    static maxLoopTime = 0;
    static continue = false;
    static fpsMillis = 0;
    static loopTime = 0;
    static collisions = new Map();
    static {
        View.initialize();
        GUI.initialize();
        console.log('Main initialized...');
    }
    static run(fps = 0) {
        const startTime = Date.now();
        Main.loopTime = 0;
        if (fps === 0) {
            View.bgColor = '#302';
            Main.continue = false;
            Main.fpsMillis = 1 / 24;
        }
        else {
            View.bgColor = '#000';
            Main.continue = true;
            Main.fpsMillis = 1000 / fps;
        }
        Main.loop(startTime);
    }
    static loop(startTime) {
        if (startTime)
            Main.oldTime = startTime;
        Main.time = Date.now();
        Main.delta = (Main.time - Main.oldTime) / 1000;
        Main.oldTime = Main.time;
        Main.doWork();
        Main.currentFrame++;
        if (Main.continue) {
            setTimeout(Main.loop, Main.fpsMillis);
        }
        else {
            console.log('stopping..');
        }
    }
    static doWork() {
        const t = Date.now();
        try {
            Events.reset();
            Sim.rebuildQuadTrees();
            View.clear();
            if (Camera.isPanning)
                Camera.move();
            const dynamicOnScreen = Sim.dynamicQuadtree.findInRange(Camera.cameraBounds);
            const staticOnScreen = Sim.staticQuadtree.findInRange(Camera.cameraBounds);
            for (const candidate of dynamicOnScreen) {
                if (candidate.canMove === 'onscreen') {
                    candidate.move(Main.delta);
                }
            }
            for (const simObject of Sim.dynamicObjects.values()) {
                if (simObject.canMove === 'always') {
                    simObject.move(Main.delta);
                }
            }
            Effects.renderBackground();
            for (const candidate of staticOnScreen) {
                candidate.render();
            }
            for (const candidate of dynamicOnScreen) {
                candidate.render();
            }
            Effects.renderForeground();
            GUI.render();
            // Collisions
            Main.collisions = new Map();
            for (const simObject of Sim.dynamicObjects.values()) {
                if (simObject.collides) {
                    const bounds = new RectBounds(simObject.worldPosition.x - simObject.radius, simObject.worldPosition.y - simObject.radius, simObject.worldPosition.x + simObject.radius, simObject.worldPosition.y + simObject.radius);
                    const dynamicCandidates = Sim.dynamicQuadtree.findInRange(bounds);
                    for (const candidate of dynamicCandidates) {
                        if (candidate.collides) {
                            const r = candidate.radius + simObject.radius;
                            const d = Math.hypot(candidate.position.x - simObject.position.x, candidate.position.y - simObject.position.y);
                            if (r <= d) {
                                if (!Main.collisions.has(simObject.name)) {
                                    Main.collisions.set(simObject.name, []);
                                }
                                Main.collisions.get(simObject.name).push(candidate);
                            }
                        }
                    }
                }
            }
            Main.checkMouse();
            Main.showDelta();
            if (Main.creatorsFunction)
                Main.creatorsFunction();
            Main.loopTime = Date.now() - t;
            if (Main.loopTime > Main.maxLoopTime && Main.currentFrame > 10) {
                Main.maxLoopTime = Main.loopTime;
            }
        }
        catch (error) {
            Main.continue = false;
            throw error;
        }
    }
    static checkMouse() {
        let interactionOccured = false;
        for (const panel of GUI.panels) {
            if (panel.isVisible()) {
                for (const element of panel.elements) {
                    if (element.button) {
                        if (element.button.checkForMouse())
                            interactionOccured = true;
                    }
                }
            }
        }
        for (const object of Sim.simObjects.values()) {
            if (object.button && object.button.checkForMouse()) {
                interactionOccured = true;
            }
        }
        View.handleCameraDrag(interactionOccured);
    }
    static showDelta() {
        View.context.textBaseline = 'top';
        View.context.fillStyle = '#FFFFFF';
        View.context.strokeStyle = '#FFFFFF';
        const oldfont = View.context.font;
        View.context.font = 'bold 14px Arial';
        const frameStr = 'Φ ' + String(Main.currentFrame).padStart(4, '0');
        const deltaStr = 'Δ ' + String(Math.trunc(Main.delta * 1000)).padStart(4, '0');
        const loopTimeStr = 'Σ ' + String(Main.loopTime).padStart(4, '0');
        const maxLoopTimeStr = 'Ω ' + String(Main.maxLoopTime).padStart(4, '0');
        View.context.fillText(frameStr, 20, 8);
        View.context.fillText(deltaStr, 20, View.canvas.height - 20);
        View.context.fillText(loopTimeStr, View.canvas.width - 70, 8);
        View.context.fillText(maxLoopTimeStr, View.canvas.width - 70, 25);
        View.context.fillText(`ζ ${Camera.zoom}`, View.canvas.width - 70, View.canvas.height - 20);
        View.context.font = oldfont;
    }
}
//# sourceMappingURL=main.js.map