import { IUser } from "@/definitions/interfaces";

import React from "react";

import CircleAvatar from "../CircleAvatar";

const UserChip: React.FC<{
  user: IUser;
  Button: React.ComponentType<{ user: IUser }>;
}> = ({ user, Button }) => {
  return (
    <div
      key={user._id}
      className="px-2 py-1 flex gap-4 items-center bg-gray-800 rounded-md"
    >
      <CircleAvatar
        imageUrl={user.profileImage.url}
        alt={user.name}
        fallback={user.username?.slice(0, 1)?.toUpperCase()}
        classes={"bg-foreground"}
      />

      <div className="flex-1 flex justify-between items-center">
        <div className="flex flex-col">
          <p className="font-light">{user.name}</p>
          <p>@{user.username}</p>
        </div>

        <div>
          <Button user={user} />
        </div>
      </div>
    </div>
  );
};

export default UserChip;
