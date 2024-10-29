import { getAllUser } from "@/actions/form";
import { IUser } from "@/definitions/interfaces";
import { useEffect, useState } from "react";
import UserChip from "../chip/UserChip";
import { useAppSelector } from "@/hook";

const NewChatForm = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<typeof users>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const currentUser = useAppSelector((state) => state.auth.user);
  const conversations = useAppSelector((state) => state.chat.conversation);

  useEffect(() => {
    getAllUser(currentUser?._id).then(({ data }) => {
      if (data && data?.length > 0) {
        const filteredUsers = data.filter((user: IUser) => {
          const existingConversation = conversations?.find(
            (f) => f._id === user._id
          );

          return !existingConversation;
        });
        setUsers(filteredUsers);
        setFilteredUsers(filteredUsers);
      }
    });

    return () => {
      setUsers([]);
      setFilteredUsers([]);
      setSearchTerm("");
    };
  }, [currentUser]);

  const handleInputChange = (e: any) => {
    const enteredValue = e.target.value;

    setSearchTerm(enteredValue);
    if (enteredValue === "") {
      setFilteredUsers(users);
    }
    setFilteredUsers(
      users.filter(
        (user) =>
          user.name.toLowerCase().includes(enteredValue.toLowerCase()) ||
          user.username.toLowerCase().includes(enteredValue.toLowerCase())
      )
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <p className="text-xl">New chat</p>
      </div>
      <div className="form-group">
        <input
          type="text"
          placeholder="Enter name or username"
          className="input"
          value={searchTerm}
          onChange={handleInputChange}
        />
      </div>

      {/* render all the available users */}
      <div className="max-h-96 min-h-72 overflow-auto flex flex-col gap-2">
        {filteredUsers.map((user) => (
          <UserChip user={user} key={user._id} />
        ))}
      </div>
    </div>
  );
};

export default NewChatForm;
