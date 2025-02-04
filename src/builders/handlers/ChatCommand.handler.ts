import { ChatDataType } from "../../decorators/ChatData.decorators";
import { ChatCommandExecutionData } from "../../types/ChatCommand.types";

const DataMaps: { [key in ChatDataType ]: (params: ChatCommandExecutionData) => any } = {
    [ChatDataType.RAW]: (params: ChatCommandExecutionData) => params.event,
    [ChatDataType.CHANNEL]: (params: ChatCommandExecutionData) => null,
    [ChatDataType.CHAT]: (params: ChatCommandExecutionData) => null,
    [ChatDataType.SENDER]: (params: ChatCommandExecutionData) => null,
};
