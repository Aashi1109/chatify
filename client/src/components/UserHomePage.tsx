import { getUserChats } from "@/actions/form";
import { setConversation } from "@/features/chatSlice";
import { useAppDispatch, useAppSelector } from "@/hook";
import { socket } from "@/socket";
import { useEffect, useState } from "react";
import ChatWindow from "./ChatWindow";
import InfoWindow from "./InfoWindow";
import TopBar from "./TopBar";

function UserHomePage() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [transport, setTransport] = useState("N/A");

  const dispatch = useAppDispatch();
  const userData = useAppSelector((state) => state.auth.user);

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
    // TODO remove this in future
    // socket.on("connect_error", (err) => {
    //   showToaster(EToastType.Error, err.message || "Something went wrong");
    // });

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  useEffect(() => {
    getUserChats(userData?._id).then(({ data }) => {
      dispatch(setConversation(data));
    });
  }, [dispatch, userData]);

  return (
    <>
      <TopBar />
      <div className="flex gap-8 h-[calc(100vh-8.5rem)]">
        <InfoWindow />
        <ChatWindow socket={socket} />
      </div>
    </>
  );
}

export default UserHomePage;
