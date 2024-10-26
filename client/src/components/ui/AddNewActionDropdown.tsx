import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MessageCircle, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleModal } from "@/features/uiSlice";
import { useAppDispatch } from "@/hook";
import GroupForm from "@/components/forms/GroupForm.tsx";
import Modal from "@/components/modal/Modal.tsx";
import NewChatForm from "@/components/forms/NewChatForm.tsx";
import { useState } from "react";

const AddNewActionDropdown = () => {
  const [isNewChatForm, setIsNewChatForm] = useState(false);

  const dispatch = useAppDispatch();
  return (
    <DropdownMenu>
      <Modal>{isNewChatForm ? <NewChatForm /> : <GroupForm />}</Modal>
      <DropdownMenuTrigger>
        <Button
          onClick={() => {
            dispatch(toggleModal());
          }}
          className="flex-center gap-2"
        >
          <Plus className={"h-5 w-5 font-extrabold"} />
          <p>New</p>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Create new</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            dispatch(toggleModal());
            setIsNewChatForm(true);
          }}
        >
          <MessageCircle className={"mr-2 h-4 w-4"} />
          <span>New chat</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            dispatch(toggleModal());
            setIsNewChatForm(false);
          }}
        >
          <Users className={"mr-2 h-4 w-4"} />
          <span>New group</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AddNewActionDropdown;
