import { Manager } from "socket.io-client";

const manager = new Manager("/", {
  withCredentials: true,
});
export const socket = manager.socket("/");
