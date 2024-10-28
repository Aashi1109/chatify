import { useAppDispatch, useAppSelector } from "@/hook";

import { setAuth } from "@/features/authSlice";
import { Auth, Page } from "@/pages";
import { useEffect } from "react";
import { getSessionOfUser } from "./actions/form";

const App = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const _fetchSession = async () => {
      let user = null;
      let isAuthenticated = false;
      try {
        const session = await getSessionOfUser();

        if (session?.data?._id) {
          user = session?.data;
          isAuthenticated = true;
        }
      } catch (error) {
        console.error(`Error fetching session: `, error);
      }

      dispatch(
        setAuth({
          isAuthenticated,
          user,
        })
      );
    };

    _fetchSession();
  }, [dispatch]);

  if (isAuthenticated) {
    return <Page />;
  }
  return <Auth />;
};

export default App;
