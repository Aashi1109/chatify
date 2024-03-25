import Link from "next/link";
import CircleAvatar from "./CircleAvatar";
import clsx from "clsx";
import { sidebarLinks } from "@/config";
import Image from "next/image";

const Sidebar = () => {
  return (
    <section className="section-bg col-span-2 row-span-full py-4 flex flex-col overflow-auto">
      <div className="flex flex-col lg:flex-row gap-0 md:gap-4 items-center p-4">
        <CircleAvatar size={40} imageUrl="/assets/user.png" alt={"User Icon"} />
        <div className="text-lg">
          Hii, <strong>Jane Doe</strong>
        </div>
      </div>

      {/* navigation links */}
      <div className="flex flex-col gap-4 mt-4 flex-1">
        {sidebarLinks.map((sidelink, index) => (
          <div
            className={
              "sidebar" + (index === sidebarLinks.length - 1 ? " mt-auto" : "")
            }
            key={sidelink.path}
          >
            <Link
              href={sidelink.path}
              className={"flex gap-4 items-center px-4 py-2"}
            >
              <Image
                src={sidelink.imagePath}
                alt={sidelink.text}
                width={20}
                height={20}
                className={sidelink.classes}
              />
              <p className="text-sm">{sidelink.text}</p>
            </Link>
          </div>
        ))}

        {/* <Link
          href={"/logout"}
          key={"/logout"}
          className={"flex gap-4 items-center"}
        >
          <Image
            src={"/assets/logout.png"}
            alt={"logout"}
            width={20}
            height={20}
            className={""}
          />
          <p className="text-sm">Logout</p>
        </Link> */}
      </div>
    </section>
  );
};

export default Sidebar;
