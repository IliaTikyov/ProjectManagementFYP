import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import PrivateRoute from "./components/auth/PrivateRoute";
import { AuthProvider } from "./context/AuthContext";
import Sidebar from "./components/layout/Sidebar";
import TaskBoard from "./pages/TaskBoard";
import Members from "./pages/Members";
import Login from "./pages/Login";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<PrivateRoute />}>
            <Route path="*" element={<SidebarWrapper />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

function SidebarWrapper() {
  const currentLocation = useLocation();
  const noSidebarRoutes = ["/login"];

  return !noSidebarRoutes.includes(currentLocation.pathname) ? (
    <Sidebar>
      <Routes>
        <Route path="/" element={<TaskBoard />} />
        <Route path="/members" element={<Members />} />
      </Routes>
    </Sidebar>
  ) : null;
}

export default App;
