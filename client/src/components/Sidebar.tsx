import { sidebarLinks } from "@/config";
import CircleAvatar from "./CircleAvatar";

const Sidebar = ({ userData }: { userData: object | any }) => {
  const {
    name,
    profileImage: { url },
  } = userData?.data ?? {};
  return (
    <section className="section-bg col-span-2 row-span-full py-4 flex flex-col">
      <div className="flex flex-col lg:flex-row gap-0 md:gap-4 items-center p-4">
        <CircleAvatar
          imageUrl={url ? url : "/assets/user.png"}
          alt={"User Icon"}
          fallback={name?.slice(0, 1)?.toUpperCase()}
        />
        <div className="text-lg">
          Hii, <strong>{name}</strong>
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
            <a
              href={sidelink.path}
              className={"flex gap-4 items-center px-4 py-2"}
            >
              <img
                src={sidelink.imagePath}
                alt={sidelink.text}
                width={20}
                height={20}
                className={sidelink.classes}
              />
              <p className="text-sm">{sidelink.text}</p>
            </a>
          </div>
        ))}

        {/* <Link
          href={"/logout"}
          key={"/logout"}
          className={"flex gap-4 items-center"}
        >
          <img
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
