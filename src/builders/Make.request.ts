import axios, { AxiosRequestConfig } from "axios";
import { Logger } from "../utils/Logger";
import BaseRequestBuilder from "./api/Base.request.builder";

let counter = 0;

export default async function MakeRequest<T>(requestBuilder: BaseRequestBuilder): Promise<T> {
    const requestConfig = requestBuilder.build();

    const logger = new Logger(`MakeRequest:${counter++}`);
    logger.debug(`Making request to ${requestConfig.method} ${requestConfig.url}`);

    // TODO: Rate limiter

    return await axios(requestConfig).then((response) => {
        logger.debug(`Successfully received response [${response.status}]`);
        return response.data;
    }).catch((error) => {
        console.log(error);
        const errorMessage = `Error while making request [${error.response.status}]: ${error.response.data.message}`;
        logger.error(errorMessage);
        throw new Error(errorMessage);
    });
}