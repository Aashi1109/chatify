import { IChipItem } from "@/definitions/interfaces";

import ChipItem from "./ChipItem";
import { cn } from "@/lib/utils";

const ChipList: React.FC<{
  chipItems: Array<IChipItem>;
  callback: (chipData: IChipItem) => void;
  orientation?: "vertical" | "horizontal";
  chipListClasses?: string;
  chipItemClasses?: string;
  selectedChip: IChipItem["id"];
  selectedChipClasses?: string;
  unselectedChipClasses?: string;
}> = ({
  chipItems,
  callback,
  orientation = "horizontal",
  chipItemClasses,
  chipListClasses,
  selectedChip,
  selectedChipClasses,
  unselectedChipClasses,
}) => {
  return (
    <div
      className={cn(
        "flex justify-around items-center",
        {
          "flex-row": orientation === "horizontal",
          "flex-col": orientation === "vertical",
        },
        chipListClasses
      )}
    >
      {chipItems.map((chipItem) => (
        <ChipItem
          chipData={chipItem}
          callback={callback}
          key={chipItem.id}
          classes={cn(chipItemClasses, {
            [`bg-gray-600 dark:bg-gray-400 text-white ${selectedChipClasses}`]:
              chipItem.id === selectedChip,
            [`bg-gray-300 dark:bg-gray-600 ${unselectedChipClasses}`]:
              chipItem.id !== selectedChip,
          })}
        />
      ))}
    </div>
  );
};

export default ChipList;
