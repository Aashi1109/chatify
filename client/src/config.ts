import { ChatInfoItemI, ChipItemI } from "./definitions/interfaces";

// import * as dotenv from "dotenv";

// dotenv.config();
// { path: __dirname + "../.env.local" }
const config = {
  apiURL: "/api/" || "",
};

export default config;

export const sidebarLinks = [
  {
    path: "/explore",
    imagePath: "/assets/explore.png",
    text: "Explore",
  },
  {
    path: "/chats",
    imagePath: "/assets/chats.png",
    text: "Chats",
  },
  {
    path: "/privacy",
    imagePath: "/assets/privacy.png",
    classes: "invert",
    text: "Privacy",
  },
  {
    path: "/settings",
    imagePath: "/assets/settings.png",
    classes: "invert",
    text: "Settings",
  },
  {
    path: "/logout",
    imagePath: "/assets/logout.png",

    text: "Logout",
  },
];

export const inboxChipItems: Array<ChipItemI> = [
  { id: 1, text: "Chats" },
  { id: 2, text: "Group" },
  { id: 3, text: "Archive" },
];

export const chatInfoList: ChatInfoItemI[] = [
  {
    imageUrl: "https://source.unsplash.com/random/200x200", // Placeholder image from Unsplash
    userName: "John Doe",
    lastChatTime: new Date("2024-01-19T12:30:00Z"),
    lastChatText: "Hello! How are you?",
    isUserActive: true,
    chatsNotRead: 3,
  },
  {
    imageUrl: "https://source.unsplash.com/random/200x200", // Placeholder image from Unsplash
    userName: "Jane Smith",
    lastChatTime: new Date("2023-03-19T12:30:00Z"),
    lastChatText: "Hey there!",
    isUserActive: false,
    chatsNotRead: 1,
  },
  {
    imageUrl: "https://source.unsplash.com/random/200x200", // Placeholder image from Unsplash
    userName: "Alice Johnson",
    lastChatTime: new Date("2020-09-01T12:30:00Z"),
    lastChatText: "Nice weather today!",
    isUserActive: true,
    chatsNotRead: 0,
  },
  {
    imageUrl: "https://source.unsplash.com/random/200x200", // Placeholder image from Unsplash
    userName: "Bob Wilson",
    lastChatTime: new Date("2020-12-20T12:30:00Z"),
    lastChatText: "See you later!",
    isUserActive: false,
    chatsNotRead: 2,
  },
  // {
  //   imageUrl: "https://source.unsplash.com/random/200x200", // Placeholder image from Unsplash
  //   userName: "Emma Thompson",
  //   lastChatTime: new Date("2024-03-14T12:30:00Z"),
  //   lastChatText: "Can't wait for the weekend!",
  //   isUserActive: true,
  //   chatsNotRead: 5,
  // },
  // {
  //   imageUrl: "https://source.unsplash.com/random/200x200", // Placeholder image from Unsplash
  //   userName: "Michael Brown",
  //   lastChatTime: new Date("2024-03-20T12:30:00Z"),
  //   lastChatText: "How's your day going?",
  //   isUserActive: false,
  //   chatsNotRead: 0,
  // },
  // Add more dummy entries as needed
];
