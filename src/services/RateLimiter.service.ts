/*

// Normal API
Source: https://dev.twitch.tv/docs/api/guide/

Twitch uses a token-bucket algorithm to ensure the limits are respected. Your app is given a bucket of points. 
Each endpoint is assigned a points value (the default points value per request for an endpoint is 1). 
When your app calls the endpoint, the endpoint’s points value is subtracted from the remaining points in your bucket. 
If your bucket runs out of points within 1 minute, the request returns status code 429.

Your app is given a bucket for app access requests and a bucket for user access requests. 
For requests that specify a user access token, the limits are applied per client ID per user per minute.

If an endpoint uses a non-default points value, or specifies different limit values, the endpoint’s documentation identifies the differences.

The API includes the following headers with each response to help you stay within your request limits.

    Ratelimit-Limit — The rate at which points are added to your bucket.
    Ratelimit-Remaining — The number of points in your bucket.
    Ratelimit-Reset — A Unix epoch timestamp that identifies when your bucket is reset to full.

If you receive HTTP status code 429, use the Ratelimit-Reset header to learn how long you must wait before making another request.

*/

import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { RequestPriority, RequestQueueItem, TwitchRatelimitState } from "../types/RateLimiter.types";
import Logger from "../utils/Logger";

const logger = new Logger('RateLimiterService');

export default class RateLimiterService {
    private static instances: Map<string, RateLimiterService> = new Map();
    private constructor(private id: string) {}
    static forUser(userId: string) {
        if(!RateLimiterService.instances.has(userId)) RateLimiterService.instances.set(userId, new RateLimiterService(userId));
        return RateLimiterService.instances.get(userId) as RateLimiterService;
    }
    static forApp() {
        if(!RateLimiterService.instances.has('app')) RateLimiterService.instances.set('app', new RateLimiterService('app'));
        return RateLimiterService.instances.get('app') as RateLimiterService;
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
        if(this.requestQueue.length == 0) return;
        if(this.interval !== null) return;
        logger.log(`Request jam detected for api=${this.id} A query queue has been introduced.`);
        this.interval = setInterval(() => {
            for(let i = 0; i < this.maxRequestsPerSecond; i++) {
                const record = this.requestQueue.sort((a,b) => b.priority - a.priority == 0 ? a.id - b.id : b.priority - a.priority).shift();
                if(record == undefined) {
                    clearInterval(this.interval as NodeJS.Timeout);
                    this.interval = null;
                    logger.log(`The query queue has been processed. Normal operation has been resumed.`);
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
    ): Promise<AxiosResponse> {

        return this.handleRequest<ResponseData>(config, priority);
    }

    // Handle single request

    private async handleRequest<ResponseData>(
        config: AxiosRequestConfig,
        priority: RequestPriority,
        retries: number = 3
    ): Promise<AxiosResponse<ResponseData>> {
        const requestId = this.getNextRequestId();
        const logPrefix = `#${requestId} ${config.method?.toUpperCase()} ${config.url}`;
        const log = (message: string) => logger.log(`${logPrefix} ${message}`);

        return new Promise((resolve, reject) => {
            const sendRequest = (attempt: number) => {
                log(`Sending request... Attempt ${attempt}`);
                this.requestCount++;
                axios<ResponseData>(config)
                    .then((response) => {
                        log(`Resolved request`);
                        this.analyzeResponse(response);
                        resolve(response);
                    })
                    .catch((error: AxiosError) => {
                        log(`Rejected request`);
                        if (error.response?.status !== 429) {
                            reject(error);
                            return
                        };
                        const headers = error.response?.headers;
                        if(headers) {
                            this.state = {
                                limit: parseInt(headers['ratelimit-limit']),
                                remaining: parseInt(headers['ratelimit-remaining']),
                                reset: parseInt(headers['ratelimit-reset']),
                            };
                        }
                        if (attempt < retries) {
                            const record : RequestQueueItem = {
                                sendRequest: () => sendRequest(attempt + 1),
                                priority: priority,
                                id: requestId
                            };
                            this.requestQueue.push(record);
                        } else {
                            reject(error);
                        }
                        this.analyzeError(error);
                        this.handleQueue();
                    });
            };

            // Queue is empty - no bottleneck
            // If sended request will be rejected - it will be added to queue and handled later (with whole queue)
            if(this.requestQueue.length == 0) sendRequest(1);
            // If priority is insignificant - reject request
            else if(priority == RequestPriority.Insignificant) reject(new Error('`Bottleneck detected - There is a queue of requests. Request has been rejected due to low priority.`'));
            // Queue is not empty - add to queue
            else {
                const record : RequestQueueItem = {
                    sendRequest: () => sendRequest(1),
                    priority: priority,
                    id: requestId
                };
                this.requestQueue.push(record);
            }
        });
    }

    private analyzeResponse(response: AxiosResponse) {
        // Will be implemented in the future
    }

    private analyzeError(error: AxiosError) {
        // Will be implemented in the future
    }

}