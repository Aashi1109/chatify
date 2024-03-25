export interface ChipItemI {
  id: number | string;
  text: string;
}

export interface ChatInfoItemI {
  imageUrl: string;
  userName: string;
  lastChatTime: Date;
  lastChatText: string;
  isUserActive: boolean;
  chatsNotRead: number;
}
