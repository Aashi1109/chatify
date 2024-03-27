interface IUser {
  username: string;
  password?: string;
  about?: string;
  profileImage: string;
  createdAt: Date;
}

export { IUser };
