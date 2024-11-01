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
}> = ({
  chipItems,
  callback,
  orientation = "horizontal",
  chipItemClasses,
  chipListClasses,
  selectedChip,
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
          classes={chipItemClasses}
          isActive={chipItem.id === selectedChip}
        />
      ))}
    </div>
  );
};

export default ChipList;
