import axios, { AxiosRequestConfig, Method } from "axios";

// TODO: .env => API_URL = "https://api.twitch.tv/helix/"

export default abstract class BaseRequestBuilder {
    protected config: AxiosRequestConfig;
    abstract correctResponseCodes: number[];
    abstract errorResponseCodes: number[];
    constructor(
        method: Method, 
        url: string, 
        data: Record<string, unknown>, 
        public readonly tokenRelatedIdField: string | null
    ) {
        if (!Object.values(data).includes(tokenRelatedIdField)) {
            throw new Error('tokenRelatedIdField must be one of the values in the data object');
        }

        this.config = {
            url,
            method,
            headers: {
                Authorization: null,
                "Client-Id": null,
                "Content-Type": "application/json"
            },
            data
        }
    }

    /**
     * Get the user ID related to the token
     * @returns User ID related to the token OR empty string if not found
     */
    getUserIdRelatedToToken(): string {
        if(this.tokenRelatedIdField == null) return "";
        if(this.config.data[this.tokenRelatedIdField] == null) throw new Error('Token related ID is required');
        return this.config.data[this.tokenRelatedIdField] as string;
    }

    /**
     * Set the client ID
     * @param clientId Client ID
     * @returns this
     */
    setClientId(clientId: string): this {
        if(this.config.headers == undefined) throw new Error('Headers are required');
        this.config.headers["Client-Id"] = clientId;
        return this;
    }

    /**
     * Set the access token
     * @param accessToken Access token
     * @returns this
     */
    setAccessToken(accessToken: string): this {
        if(this.config.headers == undefined) throw new Error('Headers are required');
        this.config.headers.Authorization = `Bearer ${accessToken}`;
        return this;
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
        if(this.config.headers == undefined) throw new Error('Headers are required');
        if(this.config.headers.Authorization == null) throw new Error('Access token is required');
        if(this.config.headers["Client-Id"] == null) throw new Error('Client ID is required');
        if(!this.checkTypes()) throw new Error('Types are incorrect');
        return this.config;
    }

    abstract checkTypes(): boolean;
}