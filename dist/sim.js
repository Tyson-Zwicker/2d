import { RectBounds } from './geometry.js';
import { QuadTree } from './quadtree.js';
export class Sim {
    static simObjects = new Map();
    /*
     * There are two quadtrees. One is for things that don't move (static) and the other is
     * for things that do move (dynamic). This is because moving objects will need to be removed
     * and re-added to the quadtree frequently (dynamic tree every frame), and the other never changes.
     */
    static names = new Set();
    static staticObjects = new Map();
    static dynamicObjects = new Map();
    static staticQuadTreeInvalidated = false;
    static staticQuadtree = new QuadTree(new RectBounds(-500000, -500000, 500000, 500000));
    static dynamicQuadtree = new QuadTree(new RectBounds(-500000, -500000, 500000, 500000));
    static add(obj, position, rotation = 0) {
        if (typeof position.x !== 'number') {
            throw new Error(`Bad position parameter for ${obj.name} = ${position.x},${position.y}`);
        }
        if (typeof position.y !== 'number') {
            throw new Error(`Bad position parameter for ${obj.name} = ${position.x},${position.y}`);
        }
        if (Sim.names.has(obj.name)) {
            throw new Error('SimObject with name already exists: ' + obj.name);
        }
        if (!obj.finalized) {
            throw new Error(`SimObject not finalized: ${obj.name}`);
        }
        Sim.simObjects.set(obj.name, obj);
        Sim.names.add(obj.name);
        obj.worldPosition = position;
        obj.worldRotation = rotation;
        if (obj.canMove === 'always' || obj.canMove === 'onscreen') {
            Sim.dynamicQuadtree.insert(obj);
            Sim.dynamicObjects.set(obj.name, obj);
        }
        else if (obj.canMove === 'never') {
            Sim.staticQuadtree.insert(obj);
            Sim.staticObjects.set(obj.name, obj);
            Sim.staticQuadTreeInvalidated = true;
        }
        else {
            throw new Error(`unexpected canMove property ${obj.canMove}`);
        }
    }
    static get(name) {
        if (Sim.simObjects.has(name)) {
            return Sim.simObjects.get(name);
        }
        throw new Error(`unknown object [${name}]`);
    }
    static remove(name) {
        if (Sim.simObjects.has(name)) {
            Sim.simObjects.delete(name);
            Sim.names.delete(name);
            Sim.staticObjects.delete(name);
            Sim.dynamicObjects.delete(name);
        }
        else {
            throw new Error('unknown object: ' + name);
        }
    }
    static rebuildQuadTrees() {
        if (Sim.staticQuadTreeInvalidated) {
            Sim.staticQuadTreeInvalidated = false;
            Sim.staticQuadtree.clear();
            for (const simObject of Sim.staticObjects.values()) {
                Sim.staticQuadtree.insert(simObject);
            }
        }
        Sim.dynamicQuadtree.clear();
        for (const simObject of Sim.dynamicObjects.values()) {
            Sim.dynamicQuadtree.insert(simObject);
        }
    }
}
//# sourceMappingURL=sim.js.map