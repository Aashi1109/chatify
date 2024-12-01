import { socket } from "@/socket";
import { useEffect, useRef, useState } from "react";
import ChatWindow from "./ChatWindow";
import InfoWindow from "./InfoWindow";
import TopBar from "./TopBar";
import {
  updateConversation,
  updateConversationUser,
  updateMessagesAcrossConversations,
} from "@/features/chatSlice";
import { showToaster } from "./toasts/Toaster";
import {
  ESocketMessageEvents,
  ESocketUserEvents,
  EToastType,
} from "@/definitions/enums";
import { useAppDispatch, useAppSelector } from "@/hook";
import { IMessage } from "@/definitions/interfaces";
import { cn } from "@/lib/utils";
import store from "@/store";

function UserHomePage() {
  const [, setIsConnected] = useState(socket.connected);
  const [, setTransport] = useState("N/A");

  const chatWindowRef = useRef<any>(null);

  const dispatch = useAppDispatch();
  const { interactionData } = useAppSelector((state) => state.chat);

  const isChatWindowOpen = !!interactionData?.conversation?._id;

  const getIsInteractionConversation = (conversationId: string) => {
    const { isChatWindowOpen, interactionData } = store.getState().chat || {};
    return (
      isChatWindowOpen && conversationId === interactionData?.conversation?._id
    );
  };

  // this function is used to get the current conversation id in socket event handlers only
  const getCurrentConversationId = () => {
    return store.getState().chat.interactionData?.conversation?._id;
  };

  const getUnreadMessagesCount = (conversationId: string) => {
    return (
      store
        .getState()
        .chat.conversations?.find((c) => c.conversation?._id === conversationId)
        ?.chatsNotRead || 0
    );
  };

  const handleSocketCallbackError = (error: any, callback: () => void) => {
    if (error) {
      showToaster(EToastType.Error, error);
      console.error("error", error);
      return;
    }

    callback?.();
  };
  // Add message listener
  const handleNewMessage = ({ data, error }: { data: any; error: any }) => {
    handleSocketCallbackError(error, () => {
      const newMessage = data.message as IMessage;

      const _isInteractionConversation = getIsInteractionConversation(
        data.conversationId
      );

      if (_isInteractionConversation) {
        chatWindowRef.current?.addMessages([newMessage]);
      }
      dispatch(
        updateConversation({
          id: data.conversationId,
          data: {
            lastMessage: newMessage,
            chatsNotRead: getUnreadMessagesCount(data.conversationId) + 1,
          },
        })
      );
    });
  };

  const handleTyping = ({
    data,
    error,
  }: {
    data: { isTyping: boolean; conversationId: string };
    error: any;
  }) => {
    handleSocketCallbackError(error, () => {
      dispatch(
        updateConversation({
          id: data.conversationId,
          data: { isTyping: data.isTyping },
        })
      );
      chatWindowRef.current?.setIsTyping(data.isTyping);
    });
  };

  const handleMessagesUpdate = ({ data, error }: { data: any; error: any }) => {
    handleSocketCallbackError(error, () => {
      // updateMessages: (data: Record<string, Partial<IMessage>>) => void;
      // if message is for current interacting conversation update in both places
      const updates = data?.data;
      const currentConversationId = getCurrentConversationId();
      if (currentConversationId && currentConversationId in updates)
        chatWindowRef.current?.updateMessages(updates[currentConversationId]);

      dispatch(updateMessagesAcrossConversations({ data: updates }));
    });
  };

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    const handleUserUpdates = ({ data, error }: { data: any; error: any }) => {
      handleSocketCallbackError(error, () => {
        dispatch(
          updateConversationUser({
            id: data.userId,
            data: {
              ...data?.data,
            },
          })
        );
      });
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on(ESocketMessageEvents.NEW_MESSAGE, handleNewMessage);
    socket.on(ESocketMessageEvents.TYPING, handleTyping);
    socket.on(ESocketUserEvents.UPDATES, handleUserUpdates);
    socket.on(ESocketMessageEvents.MESSAGE_UPDATE, handleMessagesUpdate);

    return () => {
      socket.off(ESocketMessageEvents.NEW_MESSAGE, handleNewMessage);
      socket.off(ESocketMessageEvents.TYPING, handleTyping);
      socket.off(ESocketUserEvents.UPDATES, handleUserUpdates);
      socket.off(ESocketMessageEvents.MESSAGE_UPDATE, handleMessagesUpdate);
    };
  }, [socket]);

  return (
    <>
      <TopBar />
      <div className="flex gap-6 h-[calc(100vh-8.5rem)] bg-gray-100 dark:bg-gray-700 rounded-xl xs:p-6 p-3">
        <div
          className={cn("flex gap-6 min-w-[250px] w-full md:max-w-[400px]", {
            "hidden max-w-[400px]": isChatWindowOpen && window.innerWidth < 640,
          })}
        >
          <InfoWindow />
          <div
            className={cn(
              "h-full w-[1px] bg-gray-300 dark:bg-gray-600 hidden sm:block"
            )}
          />
        </div>

        <ChatWindow socket={socket} ref={chatWindowRef} />
      </div>
    </>
  );
}

export default UserHomePage;
