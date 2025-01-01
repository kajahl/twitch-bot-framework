export type GeneralFactory = () => any;

export type GeneralContainerEntry<Factory extends GeneralFactory, Instance> = {
    id: any;
    factory: Factory;
    instance?: Instance;
    transient: boolean;
    enabled: boolean;
}

export class GeneralContainer<Factory extends GeneralFactory, Instance> {
    protected constructor() {}
    public static getInstance<Factory extends GeneralFactory, Instance>(): GeneralContainer<Factory, Instance> {
        return new GeneralContainer<Factory, Instance>();
    }

    private registry: Map<any, GeneralContainerEntry<Factory, Instance>> = new Map();

    public set(entry: GeneralContainerEntry<Factory, Instance>): void {
        this.registry.set(entry.id, entry);
    }

    /**
     * Get the instance for the given id (target)
     * @param id target id
     * @returns instance
     * @throws Error if no entry found for the given id
     * @throws Error if entry is not enabled
     */
    public get(id: any, shouldBeEnabled: boolean = false): Instance {
        const entry = this.registry.get(id);
        if (!entry) throw new Error(`No entry found for id=${id}`);
        if (shouldBeEnabled && !entry.enabled) throw new Error(`Entry with id=${id} is not enabled`);
        if (!entry.transient && !entry.instance) entry.instance = entry.factory();
        return (entry.transient ? entry.factory() : entry.instance) as Instance;
    }

    public enable(id: any): void {
        const entry = this.registry.get(id);
        if (entry) entry.enabled = true;
    }

    public disable(id: any): void {
        const entry = this.registry.get(id);
        if (entry) entry.enabled = false;
    }
}

export type GeneralRegistryEntry<Instance, Options> = {
    target: new () => Instance;
    options: Required<Options>;
    methods: (keyof Instance)[];
}

export class GeneralRegistry<Instance, Options extends { name: string }> {
    protected constructor() {}
    public static getInstance<Instance, Options extends { name: string }>(): GeneralRegistry<Instance, Options> {
        return new GeneralRegistry<Instance, Options>();
    }

    private registry: GeneralRegistryEntry<Instance, Options>[] = [];

    public register(target: new () => Instance, options: Required<Options>, methods: (keyof Instance)[]): void {
        this.registry.push({ target, options, methods });
    }

    public getRegisteredEntries(): GeneralRegistryEntry<Instance, Options>[] {
        return this.registry;
    }
}