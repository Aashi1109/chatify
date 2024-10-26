import { FC } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const CircleAvatar: FC<{
  size: number;
  imageUrl: string;
  alt: string | null;
}> = ({ size, imageUrl, alt }) => {
  const fallbackText = alt
    ?.split(" ")
    .map((tx) => (tx.length ? tx[0] : "").toUpperCase())
    .join("");

  return (
    <Avatar>
      <AvatarImage
        height={size}
        width={size}
        alt={alt ?? "Circle Avatar"}
        src={imageUrl}
      />
      <AvatarFallback>{fallbackText ?? ""}</AvatarFallback>
    </Avatar>
  );
};

export default CircleAvatar;
