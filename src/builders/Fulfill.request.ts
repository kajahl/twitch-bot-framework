import { TokenService } from "../src/services/Token.service";
import BaseRequestBuilder from "./builders/Base.request.builder";

// Typy

export type RequestWrapperData = {
    clientId: string,
    tokenStrategy: TokenService
}

// Funkcje

export default async function FulfillRequest<T extends BaseRequestBuilder>(data: RequestWrapperData, requestBuilder: T): Promise<T> {
    requestBuilder.setClientId(data.clientId);
    const userId = requestBuilder.getUserIdRelatedToToken();
    if(userId == "") return requestBuilder;
    const accessToken = await data.tokenStrategy.getUserTokenById(userId);
    if(accessToken == null) throw new Error(`Cannot obtain access token for user ID=${userId}`);
    requestBuilder.setAccessToken(accessToken);
    return requestBuilder;
}