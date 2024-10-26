import { ChipItemI } from "@/definitions/interfaces";
import clsx from "clsx";

import { twMerge } from "tailwind-merge";
import React from "react";

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
          "bg-gray-200 dark:bg-gray-500": isActive,
          "bg-gray-300 dark:bg-gray-600": !isActive,
        })
      )}
      onClick={() => callback(chipData)}
    >
      {chipData.text}
    </div>
  );
};

export default ChipItem;