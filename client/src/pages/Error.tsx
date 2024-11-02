import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouteError } from "react-router-dom";

const Error = () => {
  const error = useRouteError() as Error;
  return (
    <div className="flex h-full w-[300px] sm:w-[70%] p-6 gap-6 flex-col items-center justify-center">
      <h1 className="text-xl">Uh oh, something went terribly wrong 😩</h1>
      <p>{error.message || JSON.stringify(error)}</p>
      <Button
        onClick={() => (window.location.href = "/")}
        className="rounded-full flex-center gap-4 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:translate-x-[50%] transition-transform duration-300" />
        Go to Home
      </Button>
    </div>
  );
};

export default Error;
