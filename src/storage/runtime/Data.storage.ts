import Logger from "../../utils/Logger";

const logger = new Logger('DataStorage');

export default class DataStorage {
    private static instance: DataStorage | null = null;
    public static getInstance(): DataStorage {
        if (!DataStorage.instance) DataStorage.instance = new DataStorage();
        return DataStorage.instance;
    }

    private constructor() {}

    public readonly clientId: DataRecord<string> = new DataRecord('clientId');
    public readonly clientSecret: DataRecord<string> = new DataRecord('clientSecret');
    public readonly userId: DataRecord<string> = new DataRecord('userId');

    public readonly websocketId: DataRecord<string | null> = new DataRecord('websocketId');
}

let id = 0;
class DataRecord<T> {
    private data: T | null = null;
    constructor(private label = `label_${id++}`) {}

    public get(): T {
        if (this.data === null) throw new Error(`Data for ${this.label} is not set`);
        return this.data;
    }

    public set(data: T): void {
        logger.log(`Setting data for ${this.label} = ${data}`);
        this.data = data;
    }
}