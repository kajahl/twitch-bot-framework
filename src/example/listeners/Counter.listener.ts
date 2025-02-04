import { ChatListener } from "../../decorators/ChatListener.decorator";
import { ChatListenerExecution } from "../../types/ChatListener.types";

@ChatListener({
    name: 'Counter',
    transient: false
})
export default class CounterListener implements ChatListenerExecution {
    private messageCount: number = 0;

    async execution(data: any): Promise<void> {
        this.messageCount++;
        console.log(`Received ${this.messageCount} messages in total`);
    }
}