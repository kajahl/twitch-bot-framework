// Main modules
import TwitchBotFramework from './src/TwitchBotFramework';

// Repository patterns
import { ListenChannelsRepository } from './src/storage/repository/ListenChannels.repository';
import { TokenRepository } from './src/storage/repository/Token.repository';

// Predefined strategies
import InMemoryTokenRepository from './src/storage/predefined/InMemoryToken.repository';

// Twitch objects
import Chat from './src/objects/Chat';
import User from './src/objects/User';

// Command interfaces
import {  
    ChatCommandExecutionGuard,
    ChatCommandExecutionGuardAvaliableResults,
    ChatCommandPreExecution,
    ChatCommandExecution, 
    ChatCommandPostExecution, 
    ChatCommandExecutionData,
} from './src/types/ChatCommand.types';

// Listener interfaces
import { 
    ChatListenerExecution, 
    ChatListenerExecutionData
} from './src/types/ChatListener.types';

// Example commands / listeners
import PingCommand from './src/example/commands/Ping.command';
import ExampleCommand from './src/example/commands/Example.command';
import CounterListener from './src/example/listeners/Counter.listener';
import ShowMessageListener from './src/example/listeners/ShowMessage.listener';

// Decorator Types
import { ChatCommand } from './src/storage/decorators/ChatCommand.decorator';
import { ChatListener } from './src/storage/decorators/ChatListener.decorator';
import { ChatCommandDecoratorOptions } from './src/types/ChatCommand.types';
import { ChatListenerDecoratorOptions } from './src/types/ChatListener.types';

// Other Types
import ChannelChatMessageEventData, {
    Message, MessageFragment, Badge, BadgeSetId
} from './src/types/EventSub_Events/ChannelChatMessageEventData.types';

// Export
export default TwitchBotFramework;
export {
    ListenChannelsRepository, TokenRepository,
    InMemoryTokenRepository,
    Chat, User,
    ChatCommandExecutionGuard, ChatCommandExecutionGuardAvaliableResults, ChatCommandPreExecution, ChatCommandExecution, ChatCommandPostExecution, ChatCommandExecutionData,
    ChatListenerExecution, ChatListenerExecutionData,
    ChatCommandDecoratorOptions, ChatListenerDecoratorOptions, ChatCommand, ChatListener,
    PingCommand, ExampleCommand,
    CounterListener, ShowMessageListener,
    ChannelChatMessageEventData, Message, MessageFragment, Badge, BadgeSetId
}