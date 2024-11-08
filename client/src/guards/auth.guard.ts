import { getSessionOfUser } from "@/actions/form";
import { setAuth } from "@/features/authSlice";
import store from "@/store";

const AuthGuard = async () => {
  const user = store.getState().auth.user;

  // If user is already authenticated, allow access to protected routes
  if (user?._id) {
    return "";
  }

  // If no user, try to get session
  try {
    const session = await getSessionOfUser();
    if (session?.data?._id) {
      store.dispatch(
        setAuth({
          isAuthenticated: true,
          user: session.data,
        })
      );
      return ""; // Allow access to protected route
    }
    return "/auth"; // Redirect to auth if no session
  } catch (error) {
    console.error("Error fetching session: ", error);
    return "/auth";
  }
};

export default AuthGuard;
