import { FC } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import CircleAvatar from "../CircleAvatar.tsx";
import { IUser } from "@/definitions/interfaces.ts";
import { LogOut, MessageCircle, Moon, Sun, User, Users } from "lucide-react";
import NewChatForm from "@/components/forms/NewChatForm.tsx";
import GroupForm from "@/components/forms/GroupForm.tsx";
import useModal from "@/hook/useModal.tsx";
import { useAppDispatch } from "@/hook/index.ts";
import { logout } from "@/features/authSlice.ts";
import { logoutUser } from "@/actions/form.ts";
import { ITheme } from "@/definitions/type.tsx";
import { setTheme } from "@/features/uiSlice.ts";
import Profile from "../forms/Profile.tsx";
import { useNavigate } from "react-router-dom";

const UserProfileActionDropdown: FC<{
  profileImage: IUser["profileImage"];
  name: string;
}> = ({ profileImage, name }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

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

  const {
    RenderModal: RenderProfileForm,
    handleModalOpen: openProfileModal,
    // handleModalClose: handleProfileModalClose,
  } = useModal();

  const handleLogout = async () => {
    try {
      await logoutUser();
      dispatch(logout());
      navigate("/auth?type=login");
    } catch (error) {
      console.error(`Error logging out: ${error}`);
    }
  };

  const handleThemeChange = (theme: ITheme) => {
    dispatch(setTheme(theme));
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <CircleAvatar
            imageUrl={
              profileImage?.url ? profileImage?.url : "/assets/user.png"
            }
            alt={"User Icon"}
            fallback={name.slice(0, 1)?.toUpperCase()}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-44">
          <DropdownMenuLabel className={"hidden sm:block"}>
            My Account
          </DropdownMenuLabel>
          <DropdownMenuLabel className={"block sm:hidden"}>
            Hii {name}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={openProfileModal}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className={"ml-2"}>Theme</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => handleThemeChange("light")}>
                    Light
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleThemeChange("dark")}>
                    Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleThemeChange("system")}>
                    System
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

            <DropdownMenuGroup className={"block sm:hidden"}>
              <DropdownMenuItem onClick={openChatModal}>
                <MessageCircle className={"mr-2 h-4 w-4"} />
                <span>New chat</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={openGroupModal}>
                <Users className={"mr-2 h-4 w-4"} />
                <span>New group</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuItem onClick={handleLogout} className="text-red-500">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <RenderGroupForm>
        <GroupForm handleModalClose={handleGroupModalClose} />
      </RenderGroupForm>

      <RenderChatForm>
        <NewChatForm handleModalClose={handleChatModalClose} />
      </RenderChatForm>

      <RenderProfileForm>
        <Profile />
      </RenderProfileForm>
    </>
  );
};

export default UserProfileActionDropdown;
