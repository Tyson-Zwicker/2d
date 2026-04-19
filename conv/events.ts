export interface EventData {
  owner: { name: string } | undefined;
  type: string;
  value: unknown;
  toggled?: boolean;
}

export class Events {
  static events: Map<string, Map<string, EventData>> = new Map();

  static reset(): void {
    Events.events.clear();
  }

  static add(type: string, ownerName: string, data: EventData): void {
    if (!Events.events.has(type)) {
      Events.events.set(type, new Map());
    }
    Events.events.get(type)!.set(ownerName, data);
  }

  static get(type: string, ownerName: string): EventData | undefined {
    return Events.events.get(type)?.get(ownerName);
  }

  static getAll(type: string): EventData[] {
    const typeEvents = Events.events.get(type);
    if (!typeEvents) return [];
    return Array.from(typeEvents.values());
  }

  static getEvents(type: string): EventData[] {
    return Events.getAll(type);
  }
}
