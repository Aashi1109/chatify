import { Auth, Page } from "@/pages";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoutes from "./routes/PrivateRoutes";
import AuthGuard from "./guards/auth.guard";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route element={<PrivateRoutes guards={[AuthGuard]} />}>
          <Route path="/" element={<Page />} />
        </Route>
        <Route path="/auth" element={<Auth />} />
      </Routes>
    </Router>
  );
};

export default App;
