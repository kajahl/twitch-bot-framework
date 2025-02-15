import { ITwitchBotConfig } from "../decorators/TwitchBot.decorator";

export default class ConfigService {
    constructor(
        private config: ITwitchBotConfig
    ) {}

    getConfig() {
        return this.config;
    }
}