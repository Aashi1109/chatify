import { FC } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ClassValue } from "clsx";
import { cn } from "@/lib/utils";

const CircleAvatar: FC<{
  imageUrl: string;
  alt: string | null;
  fallback: string;
  classes?: ClassValue;
}> = ({ imageUrl, alt, fallback, classes }) => {
  return (
    <Avatar className={cn(`w-10 h-10`, classes)}>
      <AvatarImage alt={alt ?? "Circle Avatar"} src={imageUrl} />
      <AvatarFallback className="text-foreground">
        {fallback ?? ""}
      </AvatarFallback>
    </Avatar>
  );
};

export default CircleAvatar;
