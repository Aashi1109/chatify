import { IChipItem } from "@/definitions/interfaces";
import { cn } from "@/lib/utils";

import React from "react";

const ChipItem: React.FC<{
  chipData: IChipItem;
  callback: (chipData: IChipItem) => void;
  classes?: string;
}> = ({ chipData, callback, classes }) => {
  return (
    <div
      className={cn("px-2 py-1 rounded-lg", classes)}
      onClick={() => callback(chipData)}
    >
      {chipData.text}
    </div>
  );
};

export default ChipItem;
