import { forwardRef } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils.ts";

export interface ILoadingButtonProps extends ButtonProps {
  isLoading?: boolean;
}

const LoadingButton = forwardRef<HTMLButtonElement, ILoadingButtonProps>(
  ({ isLoading, children, ...props }, ref) => {
    return (
      <Button
        {...props}
        className={cn(`${props.className} flex-center gap-2`)}
        ref={ref}
      >
        {isLoading && <Loader2 className={"h-4/5 animate-spin"} />}
        <p>{children}</p>
      </Button>
    );
  },
);

export default LoadingButton;
