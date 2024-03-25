"use client";

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
  console.log(classes);
  return (
    <div
      className={twMerge(
        clsx("px-2 py-1 rounded-lg", classes, isActive && itemActiveClass)
      )}
      onClick={() => callback(chipData)}
    >
      {chipData.text}
    </div>
  );
};

export default ChipItem;
