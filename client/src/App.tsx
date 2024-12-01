import { Auth, ForgotPassword, Page } from "@/pages";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import PrivateRoutes from "./routes/PrivateRoutes";
import AuthGuard from "./guards/auth.guard";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route element={<PrivateRoutes guards={[AuthGuard]} />}>
          <Route path="/" element={<Page />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>
        <Route path="/auth" element={<Auth />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
