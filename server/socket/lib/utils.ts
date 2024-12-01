import { IMessage } from "@definitions/interfaces";

export const messagesUpdateTransformer = (data: Partial<IMessage>[]) => {
  // create a object with messages grouped at conversation level
  let results = {};
  for (const message of data) {
    const { _id, conversation, ...rest } = message;
    const stringifiedConversationId = message.conversation._id?.toString();
    const stringifiedMessageId = message?._id?.toString();
    if (stringifiedConversationId in results) {
      results[stringifiedConversationId][message?._id?.toString()] = rest;
    } else {
      results[stringifiedConversationId] = { [stringifiedMessageId]: rest };
    }
  }

  return results;
};
