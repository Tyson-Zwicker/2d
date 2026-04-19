export class Events {
    static events = new Map();
    static reset() {
        Events.events.clear();
    }
    static add(type, ownerName, data) {
        if (!Events.events.has(type)) {
            Events.events.set(type, new Map());
        }
        Events.events.get(type).set(ownerName, data);
    }
    static get(type, ownerName) {
        return Events.events.get(type)?.get(ownerName);
    }
    static getAll(type) {
        const typeEvents = Events.events.get(type);
        if (!typeEvents)
            return [];
        return Array.from(typeEvents.values());
    }
    static getEvents(type) {
        return Events.getAll(type);
    }
}
//# sourceMappingURL=events.js.map