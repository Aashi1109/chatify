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
import GroupForm from "@/components/forms/GroupForm.tsx";
import NewChatForm from "@/components/forms/NewChatForm.tsx";
import useModal from "@/hook/useModal";

const AddNewActionDropdown = () => {
  const {
    RenderModal: RenderGroupForm,
    handleModalOpen: openGroupModal,
    handleModalClose: handleGroupModalClose,
  } = useModal();
  const {
    RenderModal: RenderChatForm,
    handleModalOpen: openChatModal,
    handleModalClose: handleChatModalClose,
  } = useModal();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button className="flex-center gap-2" size={"sm"}>
            <Plus className={"h-5 w-5 font-extrabold"} />
            <p>New</p>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Create new</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={openChatModal}>
            <MessageCircle className={"mr-2 h-4 w-4"} />
            <span>New chat</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={openGroupModal}>
            <Users className={"mr-2 h-4 w-4"} />
            <span>New group</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RenderGroupForm>
        <GroupForm handleModalClose={handleGroupModalClose} />
      </RenderGroupForm>

      <RenderChatForm>
        <NewChatForm handleModalClose={handleChatModalClose} />
      </RenderChatForm>
    </>
  );
};

export default AddNewActionDropdown;
