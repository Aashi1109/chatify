import { socket } from "@/socket";
import { useEffect, useRef, useState } from "react";
import ChatWindow from "./ChatWindow";
import InfoWindow from "./InfoWindow";
import TopBar from "./TopBar";
import {
  addInteractionMessage,
  updateConversation,
} from "@/features/chatSlice";
import { showToaster } from "./toasts/Toaster";
import { ESocketMessageEvents, EToastType } from "@/definitions/enums";
import { useAppDispatch, useAppSelector } from "@/hook";
import { IMessage } from "@/definitions/interfaces";
import store from "@/store";
import { cn } from "@/lib/utils";

function UserHomePage() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [transport, setTransport] = useState("N/A");

  const chatWindowRef = useRef<any>(null);

  const dispatch = useAppDispatch();
  const isChatWindowOpen = useAppSelector(
    (state) => !!state.chat.interactionData?.conversation?._id
  );

  const getIsChatWindowOpen = () => {
    return !!store.getState().chat.interactionData?.conversation?._id;
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

      const isChatWindowOpen = getIsChatWindowOpen();

      if (isChatWindowOpen) {
        dispatch(addInteractionMessage(newMessage));
      }
      dispatch(
        updateConversation({
          id: data.conversationId,
          data: {
            lastMessage: newMessage,
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

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on(ESocketMessageEvents.NEW_MESSAGE, handleNewMessage);
    socket.on(ESocketMessageEvents.TYPING, handleTyping);

    return () => {
      socket.off(ESocketMessageEvents.NEW_MESSAGE, handleNewMessage);
      socket.off(ESocketMessageEvents.TYPING, handleTyping);
    };
  }, [socket]);

  return (
    <>
      <TopBar />
      <div className="flex gap-8  h-[calc(100vh-8.5rem)] bg-gray-100 dark:bg-gray-700 rounded-xl xs:p-6 p-3">
        <div
          className={cn("flex gap-8 min-w-[250px] w-full max-w-[400px]", {
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
