"use client";

import { getUserChats, getUserData } from "@/actions/form";
import { IUser, IUserChat } from "@/definitions/interfaces";
import { socket } from "@/socket";
import { getToken } from "@/utils/generalHelper";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import ChatWindow from "./ChatWindow";
import InfoWindow from "./InfoWindow";
import TopBar from "./TopBar";

function UserHomePage() {
  const searchParams = useSearchParams();
  const [userData, setUserData] = useState<IUser | null>(null);
  const [userChats, setUserChats] = useState<IUserChat[] | null>(null);

  // const [isConnected, setIsConnected] = useState(false);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [transport, setTransport] = useState("N/A");

  const userId = searchParams.get("userId");
  const interactionId = searchParams.get("interactionId");

  // useEffect(() => {
  //   // if (socket.connected) {
  //   //   onConnect();
  //   // }

  //   function onConnect() {
  //     setIsConnected(true);
  //     setTransport(socket.io.engine.transport.name);

  //     socket.io.engine.on("upgrade", (transport) => {
  //       setTransport(transport.name);
  //     });
  //   }

  //   function onDisconnect() {
  //     setIsConnected(false);
  //     setTransport("N/A");
  //   }

  //   socket.on("connect", onConnect);
  //   socket.on("disconnect", onDisconnect);

  //   return () => {
  //     socket.off("connect", onConnect);
  //     socket.off("disconnect", onDisconnect);
  //   };
  // }, []);

  useEffect(() => {
    const token = getToken();
    if (token) {
      getUserData(userId!).then((data) => setUserData(data));
      getUserChats(token, userId!).then((chats) => {
        console.log(chats);
        setUserChats(chats);
      });
    }
  }, [userId, interactionId]);
  // const userData = await getUserData(userId!, token);

  if (!!!userData) return null;

  return (
    <>
      {/* <Sidebar userData={userData} /> */}
      <TopBar userData={userData} />
      <InfoWindow userChats={userChats} />
      <ChatWindow />
    </>
  );
}

export default UserHomePage;
