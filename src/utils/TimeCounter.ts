export default class TimeCounter {
    private startTime: number = 0;
    private endTime: number = 0;

    constructor() {}

    /**
     * Start the timer
     * @returns {this} TimeCounter instance
     */
    public start(): this {
        this.startTime = Date.now();
        return this;
    }

    /**
     * Stop the timer
     * @returns {number} Elapsed time in milliseconds
     */
    public stop(): number {
        this.endTime = Date.now();
        return this.getElapsedTime();
    }

    /**
     * Get the elapsed time in milliseconds
     * @returns {number} Elapsed time in milliseconds
    */
    public getElapsedTime(): number {
        return this.endTime - this.startTime;
    }
}