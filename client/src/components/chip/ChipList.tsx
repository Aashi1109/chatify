import { ChipItemI } from "@/definitions/interfaces";

import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import ChipItem from "./ChipItem";

const ChipList: React.FC<{
  chipItems: Array<ChipItemI>;
  callback: (chipData: ChipItemI) => void;
  orientation?: "vertical" | "horizontal";
  chipListClasses?: string;
  chipItemClasses?: string;
}> = ({
  chipItems,
  callback,
  orientation = "horizontal",
  chipItemClasses,
  chipListClasses,
}) => {
  // const searchParams = useSearchParams();

  const selectedChip = "chats";
  return (
    <div
      className={twMerge(
        clsx(
          "flex justify-around items-center",
          {
            "flex-row": orientation === "horizontal",
            "flex-col": orientation === "vertical",
          },
          chipListClasses
        )
      )}
    >
      {chipItems.map((chipItem) => (
        <ChipItem
          chipData={chipItem}
          callback={callback}
          key={chipItem.id}
          classes={chipItemClasses}
          isActive={chipItem.text.toLowerCase() === selectedChip}
        />
      ))}
    </div>
  );
};

export default ChipList;
