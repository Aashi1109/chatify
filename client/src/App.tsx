import { Page } from "@/pages";
import { useEffect, useState } from "react";
import { executor } from "./lib/helpers/generalHelper";
import AuthGuard from "./guards/auth.guard";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "./hook";

const App = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    const executeGuards = async () => {
      setLoading(true);
      const result = await executor([AuthGuard]);
      if (result) navigate(result);
      setLoading(false);
    };
    executeGuards();
  }, [navigate, user]);

  if (loading)
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="animate-spin h-10 w-10" />
      </div>
    );
  return <Page />;
};

export default App;
