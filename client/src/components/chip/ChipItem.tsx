import { IChipItem } from "@/definitions/interfaces";
import { cn } from "@/lib/utils";

import React from "react";

const ChipItem: React.FC<{
  chipData: IChipItem;
  callback: (chipData: IChipItem) => void;
  classes?: string;
  isActive?: boolean;
  itemActiveClass?: string;
}> = ({ chipData, callback, classes, isActive = false, itemActiveClass }) => {
  return (
    <div
      className={cn("px-2 py-1 rounded-lg", classes, {
        "bg-gray-200 dark:bg-gray-500": isActive,
        "bg-gray-300 dark:bg-gray-600": !isActive,
      })}
      onClick={() => callback(chipData)}
    >
      {chipData.text}
    </div>
  );
};

export default ChipItem;
