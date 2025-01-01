# Twitch Bot Framework

Twitch Bot Framework is a tool for creating bots on the Twitch platform, simplifying event management, communication with the Twitch API, and handling commands.

## Table of Contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Docs](#docs)
- [Example Usage](#example-usage)
- [Note](#note)

## Introduction

Twitch Bot Framework provides a straightforward way to build Twitch bots and handle commands. It simplifies integration with the Twitch API and allows developers to focus on the core functionality of their bots.

## Installation

Work in progress...

## Docs

You can find docs [here](https://kajahl.gitbook.io/twitch-bot-framework).

## Example Usage

`.env` file:
```
CLIENT_ID = ''
CLIENT_SECRET = ''
USER_REFRESH_TOKEN = ''
USER_ID = ''
```
*`USER_REFRESH_TOKEN` is requred by `InMemoryTokenRepository`

`index.ts` file
```ts
import TwitchBotFramework, { InMemoryTokenRepository, PingCommand } from 'twitch-bot-framework';

import dotenv from 'dotenv';
dotenv.config();

const clientId = process.env.CLIENT_ID as string;
const clientSecret = process.env.CLIENT_SECRET as string;
const userId = process.env.USER_ID as string;

const app = new TwitchBotFramework({
    bot: {
        userId,
        clientId,
        clientSecret
    },
    channels: {
        listenChannels: [] // Will listen ^ userId channel only
    },
    chat: {
        commands: [PingCommand],
    },
    repository: {
        tokenClass: InMemoryTokenRepository
    }
});
```

Example `My.command.ts` file:
```ts
import { Chat, ChatCommandExecution, ChatCommandExecutionData, ChatCommand } from "twitch-bot-framework";

@ChatCommand({
    name: 'mycommand',
    keyword: 'my'
})
export default class MyCommand implements ChatCommandExecution {
    async execution(data: ChatCommandExecutionData) {
        const chat = await Chat.byId(data.event.broadcaster_user_id);
        chat.message.send('Hello World!');
    }
}
```
Type `!my` in the bot user's chat to see `Hello World!`.

## Note

Please be aware that the Twitch Bot Framework is currently under development. At this stage, it supports only few events and includes limited API methods. However, more features and event handlers will be added in future updates.

The source code repository for this framework is public - you can report any [issues](https://github.com/kajahl/twitch-bot-framework/issues) or requests in this repository or on the [Discord server](https://discord.gg/uzsxSY7h5e).
