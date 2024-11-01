import {
  createConversation,
  getAllUser,
  getUserConversations,
} from "@/actions/form";
import { IUser } from "@/definitions/interfaces";
import { useEffect, useState } from "react";
import UserChip from "../chip/UserChip";
import { useAppDispatch, useAppSelector } from "@/hook";
import { Button } from "../ui/button";
import {
  addConversation,
  setInteractionData,
  setInteractionMessages,
} from "@/features/chatSlice";
import { showToaster } from "../toasts/Toaster";
import { EConversationTypes, EToastType } from "@/definitions/enums";
import { Loader2, Send } from "lucide-react";
import { IConversation } from "@/definitions/interfaces";

const NewChatForm = ({
  handleModalClose,
}: {
  handleModalClose: () => void;
}) => {
  const dispatch = useAppDispatch();

  const currentUser = useAppSelector((state) => state.auth.user);
  const conversations = useAppSelector((state) => state.chat.conversations);

  const [users, setUsers] = useState<IUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<typeof users>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getAllUser(currentUser?._id).then(({ data }) => {
      if (data && data?.length > 0) {
        const filteredUsers = data.filter((user: IUser) => {
          const participants = conversations?.flatMap((f) =>
            (f.participants || [])?.flatMap((p) => (p as IUser)._id)
          );

          return !participants?.includes(user._id);
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
  }, []);

  const handleButtonClick = async (user: IUser) => {
    setIsLoading(true);
    let conversation: IConversation | undefined = undefined;

    try {
      const chatData: Array<any> = (
        await getUserConversations({
          participants: [currentUser?._id || "", user._id!],
          type: EConversationTypes.PRIVATE,
        })
      )?.data;

      if (!!chatData && chatData?.length) {
        conversation = chatData[0];
      } else {
        const createdChatData = await createConversation({
          participants: [currentUser?._id || "", user._id!],
          type: EConversationTypes.PRIVATE,
        });
        if (createdChatData.success) {
          conversation = createdChatData.data;
        }
      }

      if (conversation?._id) {
        conversation.participants = [user];
        dispatch(addConversation(conversation));
        dispatch(setInteractionData({ user, conversation }));
        dispatch(setInteractionMessages([]));
        handleModalClose?.();
      }
    } catch (error: any) {
      console.error("Error getting/creating conversation: ", error);

      showToaster(
        EToastType.Error,
        `Error creating conversation ${error?.message}`
      );
    } finally {
      setIsLoading(false);
    }
  };

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

  const _SubmitButton = ({ user }: { user: IUser }) => (
    <Button
      onClick={() => handleButtonClick(user)}
      className="p-1 h-8 w-8"
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className={"h-4 w-4 animate-spin"} />
      ) : (
        <Send className={"h-4 w-4"} />
      )}
    </Button>
  );

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
      <div className="h-96 overflow-auto flex flex-col gap-2">
        {filteredUsers.map((user) => (
          <UserChip user={user} key={user._id} Button={_SubmitButton} />
        ))}
      </div>
    </div>
  );
};

export default NewChatForm;
