import { Button } from "@/components/ui/button.tsx";
import { IMessage, IUser } from "@/definitions/interfaces.ts";
import {
  addInteractionMessage,
  extendInteractionMessages,
  setInteractionData,
  setInteractionMessages,
  updateConversation,
} from "@/features/chatSlice.ts";
import { useAppDispatch, useAppSelector } from "@/hook";
import { formatTimeAgo } from "@/lib/helpers/timeHelper";
import { cn } from "@/lib/utils";
import { Loader2, Phone, Send, X } from "lucide-react";
import {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  forwardRef,
} from "react";
import { twMerge } from "tailwind-merge";
import ChatItemCard from "./chatitems/ChatItemCard";
import ChatText from "./chatitems/ChatText";
import CircleAvatar from "./CircleAvatar";
import NewConversationGreetMessage from "./NewConversationGreetMessage";
import { Socket } from "socket.io-client";
import {
  EConversationTypes,
  EMessageCategory,
  ESocketMessageEvents,
  EToastType,
} from "@/definitions/enums";
import { showToaster } from "./toasts/Toaster";
import TypingIndicator from "./TypingIndicator";
import { getMessagesByQuery } from "@/actions/form";
import config from "@/config";

interface IProps {
  socket: Socket;
}

interface ChatWindowRef {
  scrollToBottom: () => void;
  setIsTyping: (isTyping: boolean) => void;
}

// Update the component definition to use ForwardedRef
const ChatWindow = forwardRef<ChatWindowRef, IProps>(({ socket }, ref) => {
  useImperativeHandle(ref, () => ({
    scrollToBottom: () => {
      if (chatInputRef.current) {
        chatInputRef.current.focus();
      }
    },
    setIsTyping: (isTyping: boolean) => {
      setIsTyping(isTyping);
    },
  }));
  const dispatch = useAppDispatch();

  const currentUser = useAppSelector((state) => state.auth.user);
  const { interactionMessages, interactionData } = useAppSelector(
    (state) => state.chat
  );

  const typedInteractionUser = interactionData?.user as IUser;

  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const typingIndicatorRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const lastMessageDateRef = useRef<string | null>(null);
  const fetchMoreMessagesRef = useRef<boolean>(false);

  const [isUserScrolling, setIsUserScrolling] = useState<boolean>(false);
  const [chatTextarea, setChatTextarea] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [isFetchingMoreMessages, setIsFetchingMoreMessages] =
    useState<boolean>(false);

  const hasMessages = interactionMessages && interactionMessages?.length;
  const interactionUserImageUrl =
    typedInteractionUser?.profileImage?.url || "/assets/user.png";

  const groupImageUrl =
    interactionData?.conversation?.image?.url || "/assets/user.png";
  const isGroupChat =
    interactionData?.conversation?.type === EConversationTypes.GROUP;

  const isInputContentPresent = chatTextarea !== "";

  const handleGreetMessageClick = () => {
    const greetMessage = `Hello, ${typedInteractionUser?.name}`;

    if (!isInputContentPresent) {
      setChatTextarea(greetMessage);
      if (chatInputRef.current) {
        chatInputRef.current.focus();
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isInputContentPresent) {
      return;
    }

    const messageData = {
      content: chatTextarea,
      user: currentUser?._id || "",
      type: "text",
      category: EMessageCategory.User,
      conversationId: interactionData?.conversation?._id,
    };

    try {
      socket.emit(
        ESocketMessageEvents.NEW_MESSAGE,
        { ...messageData },
        ({
          data,
          error,
        }: {
          data?: { conversationId: string; message: IMessage };
          error?: any;
        }) => {
          handleSocketCallbackError(error, () => {
            dispatch(addInteractionMessage(data!.message));
            dispatch(
              updateConversation({
                id: data!.conversationId,
                data: {
                  lastMessage: data!.message,
                },
              })
            );
            setTimeout(() => {
              if (typingIndicatorRef.current) {
                typingIndicatorRef.current.scrollIntoView({
                  behavior: "smooth",
                });
              }
            }, 300);
          });
        }
      );

      socket.emit(ESocketMessageEvents.TYPING, {
        conversationId: interactionData?.conversation?._id,
        isTyping: false,
      });

      setChatTextarea("");
      setIsUserScrolling(false);
    } catch (error) {
      console.error("Error creating message : ", error);
      throw error;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (e.currentTarget.value.trim().length)
      socket.emit(ESocketMessageEvents.TYPING, {
        conversationId: interactionData?.conversation?._id,
        isTyping: true,
      });

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit(ESocketMessageEvents.TYPING, {
        conversationId: interactionData?.conversation?._id,
        isTyping: false,
      });
    }, 2000);

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleFormSubmit(e as any);
    }
  };

  const handleSocketCallbackError = (error: any, callback: () => void) => {
    if (error) {
      showToaster(EToastType.Error, error);
      console.error("error", error);
      return;
    }

    callback?.();
  };

  async function fetchDispatchMessages(isExtend = false) {
    const messagesResp = await getMessagesByQuery({
      conversation: interactionData?.conversation?._id,
      sortOrder: "desc",
      sortBy: "createdAt",
      limit: 10 || config.conversation.fetchLimit,
      endDate: lastMessageDateRef.current,
    });
    const messages = messagesResp?.data || [];

    const executorFunc = isExtend
      ? extendInteractionMessages
      : setInteractionMessages;
    dispatch(executorFunc(messages));
    lastMessageDateRef.current = messages?.[messages?.length - 1]?.sentAt;
    fetchMoreMessagesRef.current = messages?.length === 10;
  }

  useEffect(() => {
    lastMessageDateRef.current = null;
    if (interactionData?.conversation) {
      const fetchInitData = async () => {
        setIsLoadingData(true);
        try {
          await fetchDispatchMessages();
        } catch (error) {
          console.error("Error fetching messages data:", error);
        } finally {
          setIsLoadingData(false);
        }
      };

      fetchInitData();
    }
  }, [interactionData?.conversation]);

  useEffect(() => {
    // Add a small delay to ensure the DOM has updated
    if (typingIndicatorRef.current && !isUserScrolling) {
      setTimeout(() => {
        typingIndicatorRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  }, [isUserScrolling, isTyping, interactionMessages]);

  const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const { scrollTop, scrollHeight, clientHeight } = element;

    const isNearBottom = scrollHeight + scrollTop === clientHeight;

    setIsUserScrolling(!!element.scrollTop);

    if (isNearBottom && fetchMoreMessagesRef.current) {
      setIsFetchingMoreMessages(true);
      await fetchDispatchMessages(true);
      setIsFetchingMoreMessages(false);
    }
  };

  return (
    <section
      className={cn("flex-col gap-4 w-full hidden sm:flex", {
        flex: interactionData?.conversation?._id,
      })}
    >
      {/* chat head */}
      {typedInteractionUser && (
        <div className={twMerge("flex items-center justify-between")}>
          <div className="flex items-center gap-6 flex-1">
            <CircleAvatar
              alt={"user image"}
              imageUrl={isGroupChat ? groupImageUrl : interactionUserImageUrl}
              fallback={
                (isGroupChat
                  ? interactionData?.conversation?.name
                  : typedInteractionUser?.name
                )
                  ?.slice(0, 1)
                  ?.toUpperCase() || ""
              }
            />

            <div className="flex flex-col justify-center items-start flex-nowrap">
              <p className="font-bold text-lg text-ellipsis">
                {isGroupChat
                  ? interactionData?.conversation?.name
                  : typedInteractionUser?.name}
              </p>
              {!isGroupChat && (
                <p className="text-sm flex-center gap-1 dark:tex">
                  {typedInteractionUser?.isActive ? (
                    <>
                      <div className="h-2 w-2 rounded-full animate-pulse bg-green-600" />
                      <p>Active</p>
                    </>
                  ) : (
                    `Last seen on ${formatTimeAgo(typedInteractionUser?.lastSeenAt)}`
                  )}
                </p>
              )}
              {isGroupChat && (
                <p className="text-sm w-full text-ellipsis whitespace-nowrap">
                  {interactionData.conversation?.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <Button className="p-1 h-9 w-9">
              <Phone className="h-5 w-5" />
            </Button>
            <Button
              className="p-1 h-9 w-9"
              onClick={() => {
                dispatch(setInteractionData(null));
                dispatch(setInteractionMessages(null));
              }}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}

      {/* chat window */}
      {interactionData && (
        <div className="flex flex-col bg-gray-200 dark:bg-gray-600 rounded-xl p-4 overflow-hidden flex-1 relative">
          {isLoadingData ? (
            <div className="flex-1 h-full flex-center">
              <Loader2 className="animate-spin w-10 h-10" />
            </div>
          ) : (
            <>
              {isFetchingMoreMessages && (
                <div className="absolute top-2 left-[50%] translate-x-[-50%] flex-center gap-1">
                  <Loader2 className="animate-spin w-3 h-3" />
                  <p className="text-xs">Loading messages...</p>
                </div>
              )}
              {/* messages container */}
              <div
                className={cn(
                  "flex flex-col-reverse gap-4 overflow-y-auto h-[calc(100vh-11rem)] items-stretch flex-1 relative",
                  {
                    "items-center": !hasMessages,
                  }
                )}
                onScroll={handleScroll}
              >
                {/* Typing indicator at the bottom */}
                <div
                  className={cn("flex", { hidden: !isTyping })}
                  ref={typingIndicatorRef}
                >
                  <TypingIndicator />
                </div>
                {hasMessages ? (
                  <>
                    {interactionMessages?.map((message) => {
                      return (
                        <ChatItemCard
                          key={message._id}
                          user={typedInteractionUser}
                          isCurrentUserChat={currentUser?._id === message.user}
                          RenderComponent={ChatText}
                          message={message}
                        />
                      );
                    })}
                  </>
                ) : (
                  !isInputContentPresent &&
                  !isGroupChat && (
                    <div
                      className="max-w-[70%] mb-8 cursor-pointer mt-auto"
                      onClick={handleGreetMessageClick}
                    >
                      <NewConversationGreetMessage
                        name={typedInteractionUser.name || ""}
                      />
                    </div>
                  )
                )}
              </div>

              {/* chat send buttons */}
              <form
                className="flex gap-4 items-start mt-4"
                onSubmit={handleFormSubmit}
              >
                <textarea
                  className="h-full rounded-lg flex-1 py-2 px-4 text-black"
                  placeholder="Write message"
                  style={{ resize: "none" }}
                  value={chatTextarea}
                  onChange={(e) => setChatTextarea(e.target.value)}
                  ref={chatInputRef}
                  onKeyDown={handleKeyDown}
                />
                <Button
                  onClick={() => {}}
                  className="p-1 h-9 w-9"
                  disabled={!isInputContentPresent}
                  type="submit"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </form>
            </>
          )}
        </div>
      )}

      {!interactionData && !isLoadingData && (
        <div className="flex-center flex-1">
          <p>Click on a conversation to continue.</p>
        </div>
      )}
    </section>
  );
});

export default ChatWindow;
