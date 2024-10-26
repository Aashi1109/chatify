import CircleAvatar from "./CircleAvatar";

import { useAppSelector } from "@/hook";
import AddNewActionDropdown from "@/components/ui/AddNewActionDropdown.tsx";
import UserProfileActionDropdown from "@/components/ui/UserProfileActionDropdown.tsx";
import { Bell } from "lucide-react";

const TopBar = () => {
  const userData = useAppSelector((state) => state.chat.currentUserData);

  const { name, profileImage } = userData ?? {};
  return (
    <section className="flex justify-between items-center">
      <a className="flex-center gap-4 cursor-pointer" href="/">
        <CircleAvatar
          size={40}
          imageUrl={"/assets/logo.png"}
          alt={"User Icon"}
        />
        <p className="text-2xl font-medium ">Chatify</p>
      </a>
      <div className="flex gap-6">
        <div className={"hidden sm:block"}>
          <AddNewActionDropdown />
        </div>
        <div className="flex justify-center items-center relative cursor-pointer">
          <Bell className={"w-6 h-6"} onClick={null} />
          <div className="h-2 w-2 rounded-full bg-[--destructive] absolute top-1 right-0"></div>
        </div>
        <div className="flex gap-4 items-center text-lg">
          <div className={"hidden sm:block"}>
            Hii, <span className="font-medium">{name}</span>
          </div>
          <UserProfileActionDropdown
            profileImage={profileImage ?? {}}
            name={name || ""}
          />
        </div>
      </div>
    </section>
  );
};

export default TopBar;