import { Inject } from "typedi";
import { FetchStrategy } from "../../types/Cache.types";
import DINames from "../../utils/DI.names";
import APIClient from "../../clients/Api.client";

export default class TwitchUserCacheFetchStrategy implements FetchStrategy<any> {
    constructor(
        @Inject(DINames.APIClient) private readonly apiClient: APIClient
    ) {}

    fetch(id: string): Promise<any | null> {
        return this.apiClient.getUserById(id);
    }
}