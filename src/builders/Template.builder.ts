import axios, { AxiosRequestConfig, Method } from "axios";
import DataStorage from "../storage/runtime/Data.storage";
import { GeneralResponseBody, GeneralResponseError } from "../types/APIClient.types";

export default abstract class TemplateBuilder<ResponseType> {
    protected config: AxiosRequestConfig;
    abstract correctResponseCodes: number[];
    abstract errorResponseCodes: number[];

    constructor(method: Method, url: string, data: any = {}) {
        const clientId = DataStorage.getInstance().clientId.get();
        if(clientId == null) throw new Error('Client ID is required');
        this.config = {
            url,
            method,
            headers: {
                Authorization: null,
                "Client-Id": clientId,
                "Content-Type": "application/json"
            },
            data
        }
    }

    setClientId(clientId: string): this {
        if(this.config.headers == undefined) throw new Error('Headers are required');
        this.config.headers["Client-Id"] = clientId;
        return this;
    }

    setAccessToken(accessToken: string): this {
        if(this.config.headers == undefined) throw new Error('Headers are required');
        this.config.headers.Authorization = `Bearer ${accessToken}`;
        return this;
    }

    abstract build(): AxiosRequestConfig;

    async make(): Promise<GeneralResponseBody<ResponseType>['data']> {
        const requestConfig = this.build();
        const response = await axios.request<GeneralResponseBody<ResponseType>>(requestConfig);
        if(this.correctResponseCodes.includes(response.status)) return response.data.data;
        else if(this.errorResponseCodes.includes(response.status)) {
            const error = response.data as any as GeneralResponseError;
            throw new Error(`${error.status}: ${error.error} - ${error.message}`);
        }
        else throw new Error(`Unexpected response code: ${response.status}`);
    }
}