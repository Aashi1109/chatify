import { Button } from "@/components/ui/button.tsx";
import { IMessage, IUser } from "@/definitions/interfaces.ts";
import {
  setInteractionData,
  updateConversation,
} from "@/features/chatSlice.ts";
import { useAppDispatch, useAppSelector } from "@/hook";
import { formatTimeAgo } from "@/lib/helpers/timeHelper";
import { cn } from "@/lib/utils";
import { ChevronLeftIcon, Loader2, Phone, Send, X } from "lucide-react";
import {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  forwardRef,
  useMemo,
} from "react";

import CircleAvatar from "../CircleAvatar";
import NewConversationGreetMessage from "./components/NewConversationGreetMessage";
import { Socket } from "socket.io-client";
import {
  EConversationEvents,
  EConversationTypes,
  EMessageCategory,
  EMessageType,
  ESocketMessageEvents,
  EToastType,
} from "@/definitions/enums";
import { showToaster } from "../toasts/Toaster";
import TypingIndicator from "../TypingIndicator";
import { getMessagesByQuery } from "@/actions/form";
import config from "@/config";
import ChatMessages from "./ChatMessages";
import { getImageThemeStore } from "@/common/constants/images";

interface IProps {
  socket: Socket;
}

interface ChatWindowRef {
  scrollToBottom: () => void;
  setIsTyping: (isTyping: boolean) => void;
  addMessages: (messages: IMessage[]) => void;
  updateMessages: (data: Record<string, Partial<IMessage>>) => void;
}

// Update the component definition to use ForwardedRef
const ChatWindow = forwardRef<ChatWindowRef, IProps>(({ socket }, ref) => {
  useImperativeHandle(ref, () => ({
    scrollToBottom,
    setIsTyping: (isTyping: boolean) => {
      setIsTyping(isTyping);
    },
    addMessages: (messages: IMessage[]) => {
      setMessages((prev) => [...messages, ...(prev || [])]);
    },
    updateMessages,
  }));

  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.ui.theme);

  const imageStore = useMemo(() => getImageThemeStore(theme), [theme]);

  const currentUser = useAppSelector((state) => state.auth.user);
  const { interactionData, isChatWindowOpen } = useAppSelector(
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
  // TODO: set typings later
  const [conversationDetails, setConversationDetails] = useState<any>(null);

  const [messages, setMessages] = useState<
    (IMessage & { tid?: string })[] | null
  >([]);

  const interactionUserImageUrl =
    typedInteractionUser?.profileImage?.url || "/assets/user.png";

  const groupImageUrl =
    interactionData?.conversation?.image?.url || imageStore.group;

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

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (typingIndicatorRef.current) {
        typingIndicatorRef.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }
    });
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isInputContentPresent) {
      return;
    }

    const tid = new Date().toISOString();
    const messageData: IMessage & { tid: string } = {
      content: chatTextarea,
      user: currentUser?._id || "",
      type: EMessageType.Text,
      category: EMessageCategory.User,
      conversation: interactionData?.conversation?._id || "",
      sentAt: tid,
      // this is just temporary id to update the message after socket sends backs data
      tid,
      stats: {},
    };

    try {
      setMessages((prev) => [messageData, ...(prev || [])]);
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
            dispatch(
              updateConversation({
                id: data!.conversationId,
                data: {
                  lastMessage: data!.message,
                },
              })
            );
            updateMessages({ [tid]: { ...data!.message } });
          });
        }
      );

      socket.emit(ESocketMessageEvents.TYPING, {
        conversationId: interactionData?.conversation?._id,
        isTyping: false,
      });

      setChatTextarea("");
      setIsUserScrolling(false);
      scrollToBottom();
    } catch (error) {
      console.error("Error creating message : ", error);
      throw error;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
    const messagesResp = await getMessagesByQuery(
      interactionData?.conversation?._id || "",
      {
        sortOrder: "desc",
        sortBy: "createdAt",
        limit: config.conversation.fetchLimit,
        endDate: lastMessageDateRef.current,
      }
    );
    const _messages = messagesResp?.data || [];

    const newMessages = isExtend
      ? [...(messages || []), ..._messages]
      : [..._messages];

    setMessages(newMessages);
    lastMessageDateRef.current = _messages?.[_messages?.length - 1]?.sentAt;

    fetchMoreMessagesRef.current =
      _messages?.length === config.conversation.fetchLimit;
  }

  useEffect(() => {
    lastMessageDateRef.current = null;
    if (interactionData?.conversation) {
      const fetchInitData = async () => {
        setIsLoadingData(true);
        try {
          await fetchDispatchMessages();
          scrollToBottom();

          // emit event for current chat window
          socket.emit(EConversationEvents.CurrentChatWindow, {
            conversation: interactionData?.conversation?._id,
          });
        } catch (error) {
          console.error("Error fetching messages data:", error);
        } finally {
          setIsLoadingData(false);
        }
      };

      fetchInitData();
    }
  }, [interactionData?.conversation?._id]);

  useEffect(() => {
    // Add a small delay to ensure the DOM has updated
    if (typingIndicatorRef.current && !isUserScrolling) {
      requestAnimationFrame(() => {
        typingIndicatorRef.current?.scrollIntoView({ behavior: "smooth" });
      });
    }
  }, [isUserScrolling, isTyping, messages]);

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

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setChatTextarea(e.target.value);

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
  };

  const updateMessages = (data: Record<string, Partial<IMessage>>) => {
    setMessages((prev) => {
      const messages = [...(prev || [])];
      const _updatedData = { ...data };
      for (let i = 0; i <= messages.length - 1; i++) {
        // if message has tid, then use it as id to update the message and then clear it
        const { tid, ...restMessage } = messages[i];
        const messageId = tid || messages[i]._id || "";
        const update = _updatedData[messageId];

        if (update) {
          messages[i] = {
            ...restMessage,
            ...update,
            stats: {
              ...restMessage.stats,
              ...(update.stats || {}),
            },
          };
          delete _updatedData[messageId];
        }

        if (tid) {
          delete messages[i].tid;
        }

        if (Object.keys(_updatedData).length === 0) break;
      }
      return messages;
    });
  };

  const handleUnreadMessages = (unreadIds: string[]) => {
    // Handle unread messages here
    socket.emit(
      ESocketMessageEvents.MESSAGE_UPDATE,
      {
        messages: unreadIds,
        readAt: new Date().toISOString(),
        conversation: interactionData?.conversation?._id,
      },
      ({ error, data }: { error: any; data: any }) =>
        handleSocketCallbackError(error, () => {
          dispatch(
            updateConversation({
              id: interactionData?.conversation?._id || "",
              data: {
                chatsNotRead: 0,
                lastRead: unreadIds.pop(),
              },
            })
          );
          updateMessages(data?.data || {});
        })
    );
  };

  return (
    <section className="w-full overflow-hidden relative hidden sm:flex rounded-md">
      {/* conversation window where conversation will be happening */}
      <div
        className={cn("flex-col gap-4 w-full", {
          flex: interactionData?.conversation?._id,
        })}
      >
        {/* chat head */}
        {isChatWindowOpen && (
          <div className={"flex items-center justify-between"}>
            <div
              className="flex items-center gap-4 cursor-pointer"
              onClick={() => {
                setConversationDetails({});
              }}
            >
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
                <p className="font-semibold text-ellipsis text-base">
                  {isGroupChat
                    ? interactionData?.conversation?.name
                    : typedInteractionUser?.name}
                </p>
                <div className="grid grid-cols-[1fr_auto] w-full gap-2">
                  <div className="overflow-hidden">
                    {!isGroupChat && (
                      <p className="text-sm flex-start gap-1">
                        {typedInteractionUser?.isActive ? (
                          <>
                            <div className="h-2 w-2 rounded-full animate-pulse bg-green-600" />
                            <p className="text-xs">Active</p>
                          </>
                        ) : typedInteractionUser?.lastSeenAt ? (
                          `Last seen on ${formatTimeAgo(
                            new Date(typedInteractionUser?.lastSeenAt)
                          )}`
                        ) : (
                          "Last seen just now"
                        )}
                      </p>
                    )}
                    {isGroupChat && (
                      <p className="text-sm truncate">
                        {interactionData.conversation?.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button className="p-1 h-9 w-9">
                <Phone className="h-5 w-5" />
              </Button>
              <Button
                className="p-1 h-9 w-9"
                onClick={() => {
                  setMessages(null);
                  dispatch(
                    setInteractionData({
                      conversationData: null,
                      closeChatWindow: true,
                    })
                  );
                }}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {/* chat window */}
        {isChatWindowOpen && (
          <div className="flex flex-col bg-gray-200 dark:bg-gray-600 p-4 overflow-hidden flex-1 relative">
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
                    "flex flex-col-reverse gap-3 overflow-y-auto h-[calc(100vh-11rem)] overflow-x-hidden w-full flex-1 relative",
                    {
                      "items-center": !messages?.length,
                    }
                  )}
                  // style={{ justifyContent: "start" }}
                  onScroll={handleScroll}
                >
                  {/* Typing indicator at the bottom */}
                  <div
                    className={cn("flex", {
                      "h-0 overflow-hidden -mt-3": !isTyping,
                    })}
                    ref={typingIndicatorRef}
                  >
                    <TypingIndicator />
                  </div>

                  {messages?.length ? (
                    <ChatMessages
                      messages={messages}
                      onUnreadMessagesFound={handleUnreadMessages}
                    />
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
                    onChange={handleTextAreaChange}
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
          <div className="flex-center flex-1 m-auto h-full">
            <p>Click on a conversation to continue.</p>
          </div>
        )}
      </div>

      {/* window to show details of conversation(user/group) */}
      <div
        className={cn(
          "absolute z-1 top-0 right-0 w-0 transition-[width] duration-300 ease-out bg-gray-200 dark:bg-gray-600 p-0 overflow-x-hidden",
          { "w-full p-4": conversationDetails }
        )}
      >
        <div className="flex-start gap-2 min-w-[200px]">
          <ChevronLeftIcon
            className="h-6 w-6 cursor-pointer"
            onClick={() => setConversationDetails(null)}
          />
          <p className="text-xl">Info</p>
        </div>
      </div>
    </section>
  );
});

export default ChatWindow;
