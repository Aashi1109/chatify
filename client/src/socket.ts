import { Manager } from "socket.io-client";
import { getToken, getUserId } from "./lib/helpers/generalHelper";

const manager = new Manager("http://localhost:5000");
export const socket = manager.socket("/", {
  auth: {
    token: getToken(),
    userId: getUserId(),
  },
});
