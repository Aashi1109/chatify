import { Button } from "@/components/ui/button.tsx";
import { IUser } from "@/definitions/interfaces.ts";
import {
  addInteractionMessage,
  setInteractionData,
  setInteractionMessages,
} from "@/features/chatSlice.ts";
import { useAppDispatch, useAppSelector } from "@/hook";
import { getToken, getUserId } from "@/lib/helpers/generalHelper";
import { formatTimeAgo } from "@/lib/helpers/timeHelper";
import { cn } from "@/lib/utils";
import { Phone, Send, X } from "lucide-react";
import { useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import ChatItemCard from "./chatitems/ChatItemCard";
import ChatText from "./chatitems/ChatText";
import CircleAvatar from "./CircleAvatar";
import NewConversationGreetMessage from "./NewConversationGreetMessage";
import { createMessage } from "@/actions/form.ts";

const ChatWindow = () => {
  const dispatch = useAppDispatch();
  const currentUserId = getUserId();

  const interactionData = useAppSelector(
    (state) => state.chat.interactionData,
  ) as IUser;

  const interactionMessages = useAppSelector(
    (state) => state.chat.interactionMessages,
  );

  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const [chatTextarea, setChatTextarea] = useState<string>("");

  const hasMessages = interactionMessages && interactionMessages?.length;
  const interactionUserImageUrl =
    interactionData?.profileImage?.url || "/assets/user.png";

  // console.log("interactionMessages", interactionMessages);
  // console.log("interactionData", interactionData);

  const isInputContentPresent = chatTextarea !== "";
  const handleGreetMessageClick = () => {
    const greetMessage = `Hello, ${interactionData?.name}`;

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

    const token = getToken();
    if (!token) {
      return;
    }

    const messageData = {
      content: chatTextarea,
      chatId: interactionData?._id || "",
      userId: currentUserId || "",
      sentAt: new Date(),
    };

    try {
      const createdMessage = await createMessage(token, messageData);
      if (!createdMessage || !createdMessage.success) {
        return;
      }

      setChatTextarea("");
      dispatch(addInteractionMessage(createdMessage.data));
    } catch (error) {
      console.error("Error creating message : ", error);
      throw error;
    }
  };

  return (
    <section
      className="section-bg col-span-7 p-6 flex flex-col gap-4 w-full"
      style={{ height: "calc(100vh - 8.5rem)" }}
    >
      {/* chat head */}
      {interactionData && (
        <div className={twMerge("flex items-center justify-between")}>
          <div className="flex items-center gap-6 flex-1">
            <CircleAvatar
              size={50}
              alt={"user image"}
              imageUrl={interactionUserImageUrl}
            />

            <div className="flex flex-col justify-center items-start flex-nowrap">
              <p className="font-bold text-lg text-ellipsis">
                {interactionData?.name}
              </p>
              <p className="text-sm flex-center gap-1 dark:tex">
                {interactionData?.isActive ? (
                  <>
                    <div className="h-2 w-2 rounded-full animate-pulse bg-green-600" />
                    <p>Active</p>
                  </>
                ) : (
                  `Last seen on ${formatTimeAgo(interactionData?.lastSeenAt)}`
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
              },
            )}
          >
            {hasMessages
              ? interactionMessages?.map((message) => {
                  return (
                    <ChatItemCard
                      key={message.id}
                      imageUrl={interactionUserImageUrl}
                      isCurrentUserChat={currentUserId === message.userId}
                      RenderComponent={<ChatText text={message.content} />}
                      chatSentTime={message.sentAt}
                    />
                  );
                })
              : !isInputContentPresent && (
                  <div
                    className="max-w-[70%] mb-8 cursor-pointer"
                    onClick={handleGreetMessageClick}
                  >
                    <NewConversationGreetMessage
                      name={interactionData.name || ""}
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
