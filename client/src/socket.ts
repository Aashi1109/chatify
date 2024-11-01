import { Manager } from "socket.io-client";

const manager = new Manager("/", {
  withCredentials: true,
  reconnectionAttempts: 3,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 1000,
});
export const socket = manager.socket("/");
