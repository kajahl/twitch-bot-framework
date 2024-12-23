export default class Logger {
    constructor(private readonly name: string) {}

    public log(message: string): void {
        console.log(`[${this.name}] ${message}`);
    }

    public error(message: string): void {
        console.error(`[${this.name}] ${message}`);
    }

    public warn(message: string): void {
        console.warn(`[${this.name}] ${message}`);
    }
}