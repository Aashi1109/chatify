import { getSessionOfUser } from "@/actions/form";
import { setAuth } from "@/features/authSlice";
import store from "@/store";

const AuthGuard = async () => {
  const isAuthPage = window.location.pathname.includes("auth");
  const user = store.getState().auth.user;

  if (isAuthPage || user?._id) return "";

  try {
    const session = await getSessionOfUser();
    if (session?.data?._id) {
      store.dispatch(
        setAuth({
          isAuthenticated: true,
          user: session.data,
        })
      );
      return "";
    }
  } catch (error) {
    console.error("Error fetching session: ", error);
  }
  return "/auth";
};

export default AuthGuard;
