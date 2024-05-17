import Auth from "@/features/Auth";
import Page from "@/features/Page";
import { useAppDispatch, useAppSelector } from "@/hook";
import { getLocalStorageItem, getToken } from "@/utils/generalHelper";
import { useEffect } from "react";
import { setAuth } from "./store/slices/authSlice";

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
