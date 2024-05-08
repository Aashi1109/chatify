"use client";

import Image from "next/image";
import { MouseEventHandler } from "react";
import { twMerge } from "tailwind-merge";

const Button: React.FC<{
  classes?: string;
  iconUrl: string;
  iconSize: number;
  text?: string;
  callback: MouseEventHandler<HTMLElement>;
  applyInvertFilter?: boolean;
}> = ({
  iconUrl,
  classes,
  iconSize,
  text,
  callback,
  applyInvertFilter = true,
}) => {
  return (
    <div
      className={twMerge(
        `flex justify-center items-center gap-2 bg-[--tertiary-hex] rounded-lg cursor-pointer ${classes}`
      )}
      onClick={callback}
    >
      <div>
        <Image
          className={applyInvertFilter ? "invert" : ""}
          src={iconUrl}
          alt="icon"
          objectFit="cover"
          width={iconSize}
          height={iconSize}
        />
      </div>
      {text && <p className="">{text}</p>}
    </div>
  );
};

export default Button;
