import { LoaderCircle } from "lucide-react";

const SpinningLoader = ({ size }: { size: number }) => {
  return (
    <LoaderCircle className={`w-[${size}px] h-[${size}px] animate-spin`} />
  );
};

export default SpinningLoader;
