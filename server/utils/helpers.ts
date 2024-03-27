import { IUser } from "../definitions/interfaces";

const generateUserSafeCopy = (user: IUser | any): IUser => {
  const _user = { ...user };
  delete _user.password;
  return _user;
};

export { generateUserSafeCopy };
