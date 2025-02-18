import axios, { AxiosRequestConfig, Method } from 'axios';
import { Logger } from '../../utils/Logger';

// TODO: .env => API_URL = "https://api.twitch.tv/helix/"

export default abstract class BaseRequestBuilder {
    protected config: AxiosRequestConfig;
    abstract correctResponseCodes: number[];
    abstract errorResponseCodes: number[];
    constructor(
        method: Method,
        url: string,
        query: Record<string, any> = {},
        data: Record<string, any> = {},
        public readonly tokenRelatedIdQueryField: string | null = null,
        public readonly tokenRelatedIdDataField: string | null = null
    ) {
        const logger = new Logger('BaseRequestBuilder:Constructor');
        logger.debug(`Creating request builder for ${method} ${url}`);

        if (tokenRelatedIdDataField && tokenRelatedIdQueryField) {
            const errorMessage = `Both token related ID fields cannot be set at the same time (${tokenRelatedIdDataField}, ${tokenRelatedIdQueryField})`;
            logger.error(errorMessage);
            throw new Error(errorMessage);
        }

        if (tokenRelatedIdQueryField && !Object.keys(query).includes(tokenRelatedIdQueryField)) {
            const errorMessage = `Token related ID field ${tokenRelatedIdQueryField} not found in query object (${Object.keys(query)})`;
            logger.error(errorMessage);
            throw new Error(errorMessage);
        }

        if (tokenRelatedIdDataField && !Object.keys(data).includes(tokenRelatedIdDataField)) {
            const errorMessage = `Token related ID field ${tokenRelatedIdDataField} not found in data object (${Object.keys(data)})`;
            logger.error(errorMessage);
            throw new Error(errorMessage);
        }

        this.config = {
            url,
            method,
            headers: {
                Authorization: null,
                'Client-Id': null,
                'Content-Type': 'application/json',
            },
            data,
            params: query,
        };
    }

    /**
     * Get the user ID related to the token
     * @returns User ID related to the token OR empty string if not found
     */
    getUserIdRelatedToToken(): string {
        if (this.tokenRelatedIdDataField != null) {
            if (this.config.data[this.tokenRelatedIdDataField] != null) return this.config.data[this.tokenRelatedIdDataField];
            else throw new Error('Token related ID Data field is required');
        }
        if (this.tokenRelatedIdQueryField != null && this.config.params[this.tokenRelatedIdQueryField] == null) {
            if (this.config.params[this.tokenRelatedIdQueryField] != null) return this.config.params[this.tokenRelatedIdQueryField];
            else throw new Error('Token related ID Query field is required');
        }
        return '';
    }

    /**
     * Set the client ID
     * @param clientId Client ID
     * @returns this
     */
    setClientId(clientId: string): this {
        if (this.config.headers == undefined) throw new Error('Headers are required');
        this.config.headers['Client-Id'] = clientId;
        return this;
    }

    /**
     * Set the access token
     * @param accessToken Access token
     * @returns this
     */
    setAccessToken(accessToken: string): this {
        if (this.config.headers == undefined) throw new Error('Headers are required');
        this.config.headers.Authorization = `Bearer ${accessToken}`;
        return this;
    }

    /**
     * Remove null fields from an object
     * @param obj Object to clean
     * @returns Cleaned object
     */
    private removeNullFields(obj: Record<string, any>): Record<string, any> {
        return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null));
    }

    /**
     * Build an AxiosRequestConfig object
     * @returns AxiosRequestConfig
     * @throws Error if headers are not set
     * @throws Error if access token is not set
     * @throws Error if client ID is not set
     * @throws Error if types are incorrect
     */
    build(): AxiosRequestConfig {
        if (this.config.headers == undefined) throw new Error('Headers are required');
        if (this.config.headers.Authorization == null) throw new Error('Access token is required');
        if (this.config.headers['Client-Id'] == null) throw new Error('Client ID is required');
        if (!this.checkTypes()) throw new Error('Types are incorrect');

        this.config.data = this.removeNullFields(this.config.data);
        this.config.params = this.removeNullFields(this.config.params);

        if (Object.keys(this.config.data).length === 0) {
            delete this.config.data;
        }
        if (Object.keys(this.config.params).length === 0) {
            delete this.config.params;
        }

        return this.config;
    }

    abstract checkTypes(): boolean;
}
