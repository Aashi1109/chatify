import { useAppDispatch, useAppSelector } from "@/hook";

import { setAuth } from "@/features/authSlice";
import { getLocalStorageItem, getToken } from "@/lib/helpers/generalHelper";
import { Auth, Page } from "@/pages";
import { useEffect } from "react";

const App = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = getToken();
    const userId = getLocalStorageItem("userId");
    if (token && userId) {
      dispatch(
        setAuth({
          accessToken: token,
          isAuthenticated: true,
          refreshToken: null,
        })
      );
    }
  }, []);

  if (isAuthenticated) {
    return <Page />;
  }
  return <Auth />;
};

export default App;
