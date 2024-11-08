import { executor } from "@/lib/helpers/generalHelper";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoutes = ({ guards }: { guards: any[] }) => {
  const [loading, setLoading] = useState(true);
  const navigateTo = useRef<string | null>(null);

  useEffect(() => {
    const executeGuards = async () => {
      setLoading(true);
      const result = await executor(guards);
      setLoading(false);
      navigateTo.current = result;
    };
    executeGuards();
  }, [guards]);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="animate-spin h-10 w-10" />
      </div>
    );
  }

  return navigateTo.current ? <Navigate to={navigateTo.current} /> : <Outlet />;
};

export default PrivateRoutes;
