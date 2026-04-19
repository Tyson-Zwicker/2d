import { Vec, RectBounds } from './geometry.js';
import { Camera, View } from './view.js';
// ============================================================================
// Part
// ============================================================================
export class Part {
    root = undefined;
    ownPosition = { x: 0, y: 0 };
    ownRotation = 0;
    parent = undefined;
    localPosition = { x: 0, y: 0 };
    localRotation = 0;
    spin = 0;
    name;
    parts = [];
    polygons;
    radius;
    depth = 0;
    button = undefined;
    constructor(name, polygons) {
        if (!name || !polygons) {
            throw new Error(`Missing parameter. name=${name} polygons=${polygons}`);
        }
        this.name = name;
        if (Array.isArray(polygons)) {
            this.polygons = [...polygons];
        }
        else {
            this.polygons = [polygons];
        }
        this.radius = this.calcRadius();
    }
    calcRadius() {
        let maxDistance = 0;
        for (const polygon of this.polygons) {
            for (const point of polygon.points) {
                const distance = Math.sqrt(point.x * point.x + point.y * point.y);
                maxDistance = Math.max(maxDistance, distance);
            }
        }
        return maxDistance;
    }
    clone() {
        return new Part(this.name, this.polygons);
    }
    get worldPosition() {
        if (!this.root)
            throw new Error('Part not attached to SimObject');
        return Vec.add(this.root.worldPosition, this.localPosition);
    }
    get worldRotation() {
        if (!this.root)
            throw new Error('Part not attached to SimObject');
        return (this.root.worldRotation + this.localRotation) % 360;
    }
    calculateLocals() {
        if (!this.parent)
            throw new Error('Part has no parent');
        this.localRotation = (this.ownRotation + this.parent.localRotation) % 360;
        this.localPosition = Vec.add(this.parent.localPosition, Vec.rotate(this.ownPosition, this.parent.localRotation));
    }
    addTo(parent, offset, rotation = 0, depthModifier = 0) {
        if (!parent)
            throw new Error('Missing parameter (parent): ' + this.name);
        if (!offset)
            throw new Error('Missing parameter (offset): ' + this.name);
        if (isNaN(rotation))
            throw new Error('Missing parameter (rotation): ' + this.name);
        if (parent instanceof SimObject) {
            this.root = parent;
            parent.body = this;
        }
        else {
            if (parent.root === undefined) {
                throw new Error('Cannot attach to an unattached object. Attach objects in parent first order.');
            }
            this.root = parent.root;
            parent.parts.push(this);
        }
        this.parent = parent;
        this.ownPosition = offset;
        this.ownRotation = rotation;
        this.depth = parent.depth + 1 + depthModifier;
        this.calculateLocals();
    }
    get(name) {
        if (this.name === name) {
            return this;
        }
        for (const part of this.parts) {
            try {
                return part.get(name);
            }
            catch {
                // Continue searching
            }
        }
        throw new Error(`Part [${name}] not found.`);
    }
    getWorldPolygons() {
        if (!this.root)
            throw new Error('Part not attached to SimObject');
        const worldPolygons = [];
        for (const polygon of this.polygons) {
            const worldPolygon = { mien: polygon.mien, points: [] };
            for (const point of polygon.points) {
                let p = { x: point.x, y: point.y };
                p = Vec.rotate(p, this.localRotation);
                p = Vec.add(p, this.localPosition);
                p = Vec.rotate(p, this.root.worldRotation);
                p = Vec.add(p, this.root.worldPosition);
                p = Vec.sub(p, Camera);
                p = Vec.scale(p, Camera.zoom);
                p = Vec.add(p, View.screenCenter);
                worldPolygon.points.push(p);
            }
            worldPolygons.push(worldPolygon);
        }
        return worldPolygons;
    }
}
// ============================================================================
// SimObject
// ============================================================================
export class SimObject {
    static moveStates = ['always', 'never', 'onscreen'];
    #localPosition = { x: 0, y: 0 };
    #localRotation = 0;
    get localPosition() {
        return this.#localPosition;
    }
    get localRotation() {
        return this.#localRotation;
    }
    worldPosition = { x: 0, y: 0 };
    worldRotation = 0;
    velocity = { x: 0, y: 0 };
    spin = 0;
    name;
    body = undefined;
    allParts = [];
    spinningParts = [];
    radius = 0;
    canMove = 'always';
    finalized = false;
    depth = 0;
    button = undefined;
    collides = false;
    steerable = false;
    rudder = 0;
    speed = 0;
    // For QuadTree compatibility
    get position() {
        return this.worldPosition;
    }
    // Parts array (always empty for SimObject itself, children attach via body)
    get parts() {
        return this.body?.parts ?? [];
    }
    constructor(name, canMove = 'always') {
        if (!name || !SimObject.moveStates.includes(canMove)) {
            throw new Error(`Bad parameters: name [${name}] canMove [${canMove}] must be 'never', 'onscreen' or 'always.'`);
        }
        this.name = name;
        this.canMove = canMove;
    }
    finalize() {
        if (this.body === undefined) {
            throw new Error(`SimObject [${this.name}] has no body.`);
        }
        this.allParts = this.getAllParts(this.body);
        this.allParts.sort((a, b) => a.depth - b.depth);
        this.radius = this.calcRadius();
        this.spinningParts = this.getSpinningParts();
        this.finalized = true;
    }
    getPart(name) {
        for (const part of this.allParts) {
            if (part.name === name)
                return part;
        }
        return undefined;
    }
    getAllParts(part, found = []) {
        for (const innerPart of part.parts) {
            this.getAllParts(innerPart, found);
        }
        found.push(part);
        return found;
    }
    getSpinningParts() {
        const spinningParts = [];
        for (const part of this.allParts) {
            if (part.parts.length === 0 && part.spin !== 0) {
                spinningParts.push(part);
            }
        }
        return spinningParts;
    }
    calcRadius() {
        let maxDistance = 0;
        for (const part of this.allParts) {
            const distance = Math.sqrt(part.localPosition.x ** 2 + part.localPosition.y ** 2) +
                part.radius;
            if (distance > maxDistance) {
                maxDistance = distance;
            }
        }
        return maxDistance;
    }
    static isMouseIn(simObject) {
        const mouseWorld = View.mouseToWorld();
        const bounds = new RectBounds(simObject.worldPosition.x - simObject.radius, simObject.worldPosition.y - simObject.radius, simObject.worldPosition.x + simObject.radius, simObject.worldPosition.y + simObject.radius);
        return bounds.isPointInside(mouseWorld.x, mouseWorld.y);
    }
    move(delta) {
        if (this.canMove !== 'never') {
            if (this.steerable) {
                this.worldPosition.x +=
                    Math.cos(this.worldRotation * Vec.radians) * this.speed * delta;
                this.worldPosition.y +=
                    Math.sin(this.worldRotation * Vec.radians) * this.speed * delta;
                this.worldRotation += this.rudder * delta;
            }
            else {
                this.worldPosition = Vec.add(this.worldPosition, Vec.scale(this.velocity, delta));
                this.worldRotation = this.worldRotation + this.spin * delta;
            }
            if (this.body) {
                this.moveParts(this.body);
            }
        }
    }
    moveParts(part) {
        part.ownRotation = (part.ownRotation + part.spin) % 360;
        part.calculateLocals();
        for (const innerPart of part.parts) {
            this.moveParts(innerPart);
        }
    }
    render() {
        if (this.allParts.length === 0) {
            throw new Error('No Parts found to render. SimObject has no body, or it has not been finalized.');
        }
        for (const part of this.allParts) {
            try {
                const polygons = part.getWorldPolygons();
                for (const polygon of polygons) {
                    if (!polygon.mien) {
                        throw new Error(`Polygon has no Mien. SimObject.render: Object Name: ${this.name}`);
                    }
                    let fillStyle = polygon.mien.normal.bgColor;
                    let strokeStyle = polygon.mien.normal.borderColor;
                    let lineWidth = polygon.mien.normal.borderWidth;
                    if (part.button) {
                        if (part.button.hovered) {
                            fillStyle = polygon.mien.hovered.bgColor;
                            strokeStyle = polygon.mien.hovered.borderColor;
                            lineWidth = polygon.mien.hovered.borderWidth;
                        }
                        else if (part.button.pressed) {
                            fillStyle = polygon.mien.pressed.bgColor;
                            strokeStyle = polygon.mien.pressed.borderColor;
                            lineWidth = polygon.mien.pressed.borderWidth;
                        }
                    }
                    View.context.fillStyle = fillStyle;
                    View.context.strokeStyle = strokeStyle;
                    View.context.lineWidth = lineWidth;
                    const path = new Path2D();
                    const points = polygon.points;
                    if (points.length === 0)
                        continue;
                    path.moveTo(points[0].x, points[0].y);
                    for (let i = 1; i < points.length; i++) {
                        path.lineTo(points[i].x, points[i].y);
                    }
                    path.closePath();
                    View.context.fill(path);
                    View.context.stroke(path);
                }
            }
            catch (e) {
                const err = e;
                throw new Error('Rendering Part [' + part.name + ']: ' + err.message + ' : ' + err.stack);
            }
        }
    }
}
//# sourceMappingURL=simobject.js.map