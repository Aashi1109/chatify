import { EUserRoles } from "./enums";

interface IUser {
  username: string;
  password?: string;
  about?: string;
  profileImage: string;
  createdAt: Date;
  role: EUserRoles;
}

export { IUser };
