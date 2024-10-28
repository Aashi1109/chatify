import { Button } from "@/components/ui/button.tsx";
import { IMessage, IUser } from "@/definitions/interfaces.ts";
import {
  addInteractionMessage,
  setInteractionData,
  setInteractionMessages,
} from "@/features/chatSlice.ts";
import { useAppDispatch, useAppSelector } from "@/hook";
import { formatTimeAgo } from "@/lib/helpers/timeHelper";
import { cn } from "@/lib/utils";
import { Phone, Send, X } from "lucide-react";
import { useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import ChatItemCard from "./chatitems/ChatItemCard";
import ChatText from "./chatitems/ChatText";
import CircleAvatar from "./CircleAvatar";
import NewConversationGreetMessage from "./NewConversationGreetMessage";
import { Socket } from "socket.io-client";
import { ESocketMessageEvents } from "@/definitions/enums";

interface IProps {
  socket: Socket;
}

const ChatWindow = ({ socket }: IProps) => {
  const dispatch = useAppDispatch();

  const currentUser = useAppSelector((state) => state.auth.user);

  const { interactionMessages, interactionData } = useAppSelector(
    (state) => state.chat
  );
  const typedInteractionData = interactionData as IUser;

  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const [chatTextarea, setChatTextarea] = useState<string>("");

  const hasMessages = interactionMessages && interactionMessages?.length;
  const interactionUserImageUrl =
    typedInteractionData?.profileImage?.url || "/assets/user.png";

  const isInputContentPresent = chatTextarea !== "";
  const handleGreetMessageClick = () => {
    const greetMessage = `Hello, ${typedInteractionData?.name}`;

    if (!isInputContentPresent) {
      setChatTextarea(greetMessage);
      if (chatInputRef.current) {
        chatInputRef.current.focus();
      }
    }
  };

  const handleFormSubmit = async (e: SubmitEvent) => {
    e.preventDefault();

    if (!isInputContentPresent) {
      return;
    }

    const messageData = {
      content: chatTextarea,
      userId: currentUser?._id || "",
      type: "text",
      receiverId: typedInteractionData._id,
    };

    try {
      socket.emit(
        ESocketMessageEvents.NEW_MESSAGE,
        { ...messageData },
        ({
          data,
          error,
        }: {
          data?: { chatId: string; message: IMessage };
          error?: any;
        }) => {
          if (error) {
            console.error("Error sending message:", error);
            // Handle error (e.g., show an error message to the user)
          } else if (data) {
            dispatch(addInteractionMessage(data.message));
          }
        }
      );

      setChatTextarea("");
    } catch (error) {
      console.error("Error creating message : ", error);
      throw error;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleFormSubmit(e as unknown as SubmitEvent);
    }
  };

  return (
    <section
      className="section-bg col-span-7 p-6 flex flex-col gap-4 w-full"
      style={{ height: "calc(100vh - 8.5rem)" }}
    >
      {/* chat head */}
      {typedInteractionData && (
        <div className={twMerge("flex items-center justify-between")}>
          <div className="flex items-center gap-6 flex-1">
            <CircleAvatar
              alt={"user image"}
              imageUrl={interactionUserImageUrl}
              fallback={
                typedInteractionData?.name?.slice(0, 1)?.toUpperCase() || ""
              }
            />

            <div className="flex flex-col justify-center items-start flex-nowrap">
              <p className="font-bold text-lg text-ellipsis">
                {typedInteractionData?.name}
              </p>
              <p className="text-sm flex-center gap-1 dark:tex">
                {typedInteractionData?.isActive ? (
                  <>
                    <div className="h-2 w-2 rounded-full animate-pulse bg-green-600" />
                    <p>Active</p>
                  </>
                ) : (
                  `Last seen on ${formatTimeAgo(typedInteractionData?.lastSeenAt)}`
                )}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Button className="p-2">
              <Phone className="h-5" />
            </Button>
            <Button
              className="p-2"
              onClick={() => {
                dispatch(setInteractionData(null));
                dispatch(setInteractionMessages(null));
              }}
            >
              <X className="h-5" />
            </Button>
          </div>
        </div>
      )}

      {/* chat window */}
      {interactionMessages && interactionData && (
        <div className="flex flex-col bg-gray-200 dark:bg-gray-600 rounded-xl p-4 overflow-x-hidden flex-1">
          {/* messages container */}
          <div
            className={cn(
              "flex flex-col gap-4 overflow-y-auto flex-1 justify-end",
              {
                "items-center": !hasMessages,
                "items-stretch": hasMessages,
              }
            )}
          >
            {hasMessages
              ? interactionMessages?.map((message) => {
                  return (
                    <ChatItemCard
                      key={message._id}
                      imageUrl={interactionUserImageUrl}
                      isCurrentUserChat={currentUser?._id === message.userId}
                      RenderComponent={<ChatText text={message.content} />}
                      chatSentTime={message.sentAt}
                      name={typedInteractionData.name}
                    />
                  );
                })
              : !isInputContentPresent && (
                  <div
                    className="max-w-[70%] mb-8 cursor-pointer"
                    onClick={handleGreetMessageClick}
                  >
                    <NewConversationGreetMessage
                      name={typedInteractionData.name || ""}
                    />
                  </div>
                )}
            {/* 
            <ChatItemCard
              imageUrl={interactionUserImageUrl}
              isCurrentUserChat={true}
              RenderComponent={<ChatText text="What's up bro" />}
              chatSentTime={new Date("2020-12-20T12:30:00Z")}
              deliveryStatus={ChatDeliveryStatus.Failed}
            /> */}
            {/*<ChatItemCard*/}
            {/*  imageUrl="/assets/user.png"*/}
            {/*  isCurrentUserChat={false}*/}
            {/*  RenderComponent={*/}
            {/*    <ChatText*/}
            {/*      text="Lorem ipsum dolor sit, amet consectetur adipisicing elit. Beatae*/}
            {/*accusantium illum dolor similique. Culpa, quam facilis placeat iste nisi*/}
            {/*fuga laudantium dolor non perferendis expedita aperiam sunt amet*/}
            {/*consequatur! Voluptate."*/}
            {/*    />*/}
            {/*  }*/}
            {/*  chatSentTime={new Date("2020-12-20T12:30:00Z")}*/}
            {/*/>*/}
            {/*<ChatItemCard*/}
            {/*  imageUrl="/assets/user.png"*/}
            {/*  isCurrentUserChat={false}*/}
            {/*  RenderComponent={*/}
            {/*    <ChatText*/}
            {/*      text="Lorem ipsum dolor sit, amet consectetur adipisicing elit. Beatae*/}
            {/*accusantium illum dolor similique. Culpa, quam facilis placeat iste nisi*/}
            {/*fuga laudantium dolor non perferendis expedita aperiam sunt amet*/}
            {/*consequatur! Voluptate."*/}
            {/*    />*/}
            {/*  }*/}
            {/*  chatSentTime={new Date("2020-12-20T12:30:00Z")}*/}
            {/*/>*/}
          </div>

          {/* chat send buttons */}
          <form
            className="flex gap-4 items-start mt-4"
            onSubmit={handleFormSubmit}
          >
            <textarea
              className="h-full rounded-lg  flex-1 py-2 px-4 text-black"
              placeholder="Write message"
              style={{ resize: "none" }}
              value={chatTextarea}
              onChange={(e) => setChatTextarea(e.target.value)}
              ref={chatInputRef}
              onKeyDown={handleKeyDown}
              // rows={1}
              // minLength={23}
            />
            {/* <Button
              onClick={() => {}}
              className="p-2"
              disabled={!isInputContentPresent}
            >
              <Paperclip className="h-5" />
            </Button>
            <Button
              onClick={() => {}}
              className="p-2"
              disabled={!isInputContentPresent}
            >
              <Mic className="h-5" />
            </Button> */}
            <Button
              onClick={() => {}}
              className="p-2"
              disabled={!isInputContentPresent}
              type="submit"
            >
              <Send className="h-5" />
            </Button>
          </form>
        </div>
      )}
      {!interactionData && (
        <div className="flex-center flex-1">
          <p>Click on a conversation to continue.</p>
        </div>
      )}
    </section>
  );
};

export default ChatWindow;
