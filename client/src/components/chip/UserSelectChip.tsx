import { ChipItemI, IUser } from "@/definitions/interfaces";
import React from "react";
import Button from "../Button";

const UserSelectChip: React.FC<{
  user: IUser;
  handleChipItemClick: (selectedUser: ChipItemI) => void;
}> = ({ user, handleChipItemClick }) => {
  //   const handleButtonClick = async (id: string, name: string) => {};

  return (
    <div
      key={user._id}
      className="px-2 py-1 flex gap-4 items-center bg-gray-800 rounded-md"
    >
      <div>
        <img
          src={user.profileImage.url}
          alt={user.name}
          width={40}
          height={40}
          className="rounded flex-shrink-0 block"
        />
      </div>
      <div className="flex-1 flex justify-between items-center">
        <div className="flex flex-col">
          <p className="font-light">{user.name}</p>
          <p>@{user.username}</p>
        </div>

        <div>
          <Button
            callback={() =>
              handleChipItemClick({ id: user._id as string, text: user.name })
            }
            iconSize={15}
            iconUrl="/assets/plus.png"
            applyInvertFilter={true}
            classes="py-1 px-2"
            text="Add"
          />
        </div>
      </div>
    </div>
  );
};

export default UserSelectChip;
