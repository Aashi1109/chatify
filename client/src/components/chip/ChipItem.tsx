import { ChipItemI } from "@/definitions/interfaces";
import clsx from "clsx";

import { twMerge } from "tailwind-merge";

const ChipItem: React.FC<{
  chipData: ChipItemI;
  callback: (chipData: ChipItemI) => void;
  classes?: string;
  isActive?: boolean;
  itemActiveClass?: string;
}> = ({ chipData, callback, classes, isActive = false, itemActiveClass }) => {
  return (
    <div
      className={twMerge(
        clsx("px-2 py-1 rounded-lg", classes, {
          "bg-gray-600": isActive,
          "bg-gray-700": !isActive,
        })
      )}
      onClick={() => callback(chipData)}
    >
      {chipData.text}
    </div>
  );
};

export default ChipItem;
