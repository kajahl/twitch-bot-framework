import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { RequestPriority, RequestQueueItem, TwitchRatelimitState } from "../types/RateLimiter.types";
import TimeCounter from "../utils/TimeCounter";
import { Logger, LoggerFactory } from "../utils/Logger";

export default class IndividualRateLimiterService {
    private readonly logger: Logger;

    constructor(
        private readonly id: string,
        loggerFactory: LoggerFactory
    ) {
        this.logger = loggerFactory.createLogger(`IndividualRateLimiterService:${id}`);
    }

    private state: TwitchRatelimitState = {
        limit: 800,
        remaining: 800,
        reset: 0,
    };
    private requestQueue: Array<RequestQueueItem> = [];
    private requestCount: number = 0;

    private requestId: number = 0;
    private getNextRequestId() {
        return this.requestId++;
    }

    // Handle queue (if exists any element in queue)

    private readonly maxRequestsPerSecond = Math.floor(800 / 60);
    private interval : NodeJS.Timeout | null = null;
    private async handleQueue() {
        if (this.requestQueue.length === 0) return;
        if (this.interval !== null) return;

        this.logger.log(`Request jam detected. Processing the queue...`);
        this.interval = setInterval(() => {
            for (let i = 0; i < this.maxRequestsPerSecond; i++) {
                const record = this.requestQueue
                    .sort((a, b) => b.priority - a.priority || a.id - b.id)
                    .shift();
                if (!record) {
                    clearInterval(this.interval as NodeJS.Timeout);
                    this.interval = null;
                    this.logger.log(`The query queue has been processed. Normal operation has been resumed.`);
                    break;
                }
                record.sendRequest();
            }
        }, 1000);
    }

    // Sending a request

    public async send<ResponseData>(
        config: AxiosRequestConfig,
        priority: RequestPriority = RequestPriority.Medium
    ) {
        this.logger.debug(`Processing request ${config.method?.toUpperCase()} ${config.url} with priority ${priority}`);
        return this.handleRequest<ResponseData>(config, priority);
    }

    // Handle single request

    private async handleRequest<ResponseData>(
        config: AxiosRequestConfig,
        priority: RequestPriority,
        retries: number = 3
    ): Promise<AxiosResponse<ResponseData>> {
        const requestId = this.getNextRequestId();
        const logPrefix = `Request#${requestId} ${config.method?.toUpperCase()} ${config.url}`;
        const log = (message: string) => this.logger.debug(`${logPrefix} ${message}`);

        return new Promise((resolve, reject) => {
            const sendRequest = (attempt: number) => {
                log(`Sending request... Attempt ${attempt}`);
                this.requestCount++;
                if (config.method == 'GET' && config.data) delete config.data;
                const timer = new TimeCounter().start();
                axios.request<ResponseData>(config)
                    .then((response) => {
                        const elapsed = timer.stop();
                        log(`Resolved request in ${elapsed}ms`);
                        this.analyzeResponse(config, response);
                        resolve(response);
                    })
                    .catch((error: AxiosError) => {
                        const elapsed = timer.stop();
                        log(`Rejected request after ${elapsed}ms`);
                        this.analyzeError(config, error);
                        if (error.response?.status !== 429) {
                            reject(error);
                            return;
                        }
                        const headers = error.response?.headers;
                        if (headers) {
                            this.state = {
                                limit: parseInt(headers['ratelimit-limit']),
                                remaining: parseInt(headers['ratelimit-remaining']),
                                reset: parseInt(headers['ratelimit-reset']),
                            };
                        }
                        if (attempt < retries) {
                            this.requestQueue.push({
                                sendRequest: () => sendRequest(attempt + 1),
                                priority,
                                id: requestId
                            });
                        } else {
                            reject(error);
                        }
                        this.handleQueue();
                    });
            };

            if (this.requestQueue.length === 0) {
                sendRequest(1);
            } else if (priority === RequestPriority.Insignificant) {
                reject(new Error('Bottleneck detected - There is a queue of requests. Request has been rejected due to low priority.'));
            } else {
                this.requestQueue.push({
                    sendRequest: () => sendRequest(1),
                    priority,
                    id: requestId
                });
            }
        });
    }

    private analyzeResponse(config: AxiosRequestConfig, response: AxiosResponse) {
        // Will be implemented in the future
    }

    private analyzeError(config: AxiosRequestConfig, error: AxiosError) {
        // Will be implemented in the future
    }
}