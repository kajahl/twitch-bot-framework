import UserCacheManager from "../cache/managers/UserCache.manager";
import DataStorage from "../storage/runtime/Data.storage";
import Chat from "./Chat";

export default class User {
    /**
     * Static method to create Chat object by User ID
     * @param id User ID
     * @returns Chat object
     * @throws Error if User not found by ID
     */
    static async byId(id: string) {
        const userId = await UserCacheManager.getInstance().getById(id);
        if(userId === null) throw new Error(`User not found by id=${id}`);
        return new User(id);
    }

    /**
     * Static method to create Chat object by User Login
     * @param login User Login
     * @returns Chat object
     * @throws Error if User not found by Login
     */
    static async byLogin(login: string) {
        const userId = await UserCacheManager.getInstance().findIdByUsername(login);
        if(userId === null) throw new Error(`User not found by login=${login}`);
        return new User(userId);
    }

    private constructor(private readonly userId: string) {}

    /**
     * Get Own Chat object as this User
     * @param as User ID (Chat)
     * @returns Chat object
     */
    async getChat(as: string = DataStorage.getInstance().userId.get() as string) {
        return Chat.byId(this.userId, as);
    }

    /**
     * Get Chat object for Brodacaster chat as this User
     * @param broadcasterId Broadcaster User ID (Chat)
     * @returns Chat object
     */
    async joinChat(broadcasterId: string) {
        return Chat.byId(broadcasterId, this.userId);
    }

    /**
     * Get User data
     * @returns User data
     */
    async getData() {
        return UserCacheManager.getInstance().getById(this.userId);
    }
}