export interface EventData {
    owner: {
        name: string;
    } | undefined;
    type: string;
    value: unknown;
    toggled?: boolean;
}
export declare class Events {
    static events: Map<string, Map<string, EventData>>;
    static reset(): void;
    static add(type: string, ownerName: string, data: EventData): void;
    static get(type: string, ownerName: string): EventData | undefined;
    static getAll(type: string): EventData[];
    static getEvents(type: string): EventData[];
}
//# sourceMappingURL=events.d.ts.map