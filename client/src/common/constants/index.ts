import { EConversationTypes } from "@/definitions/enums";
import { IChipItem } from "@/definitions/interfaces";

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

export const INBOX_CHIP_ITEMS: Array<IChipItem> = [
  { id: "all", text: "All" },
  { id: EConversationTypes.PRIVATE, text: "Chats" },
  { id: EConversationTypes.GROUP, text: "Groups" },
  { id: EConversationTypes.ARCHIVED, text: "Archived" },
];
