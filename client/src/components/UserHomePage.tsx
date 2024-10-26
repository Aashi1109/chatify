import { getUserChats, getUserData } from "@/actions/form";
import { setChats, setUserData } from "@/features/chatSlice";
import { useAppDispatch, useAppSelector } from "@/hook";
import { getToken, getUserId } from "@/lib/helpers/generalHelper";
import { socket } from "@/socket";
import { useEffect, useState } from "react";
import ChatWindow from "./ChatWindow";
import InfoWindow from "./InfoWindow";
import TopBar from "./TopBar";
import { showToaster } from "./toasts/Toaster";
import { EToastType } from "@/definitions/enums";

function UserHomePage() {
  // const [isConnected, setIsConnected] = useState(false);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [transport, setTransport] = useState("N/A");

  const userId = getUserId();

  const dispatcher = useAppDispatch();
  const userData = useAppSelector((state) => state.chat.currentUserData);

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
    socket.on("connect_error", (err) => {
      showToaster(EToastType.Error, err.message || "Something went wrong");
    });

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  useEffect(() => {
    const token = getToken();

    if (token) {
      getUserData(token, userId!).then((data) => {
        dispatcher(setUserData(data));
      });
      getUserChats(token, userId!).then((chats) => {
        dispatcher(setChats(chats));
      });
    }
  }, [dispatcher, userId]);
  // const userData = await getUserData(userId!, token);

  if (!userData) return null;

  return (
    <>
      <TopBar />
      <div className="flex gap-8 flex-1">
        <InfoWindow />
        <ChatWindow />
      </div>
    </>
  );
}

export default UserHomePage;
