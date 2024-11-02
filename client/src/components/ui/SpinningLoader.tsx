import { LoaderCircle } from "lucide-react";

const SpinningLoader = ({ size }: { size: number }) => {
  return (
    <div className="flex h-full w-full justify-center items-center">
      <LoaderCircle className={`w-[${size}px] h-[${size}px] animate-spin`} />
    </div>
  );
};

export default SpinningLoader;
