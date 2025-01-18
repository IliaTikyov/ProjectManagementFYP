import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import PrivateRoutes from "./utils/PrivateRoutes";
import { AuthProvider } from "./utils/AuthContext";
import SideBar from "./components/SideBar";
import TaskBoard from "./pages/TaskBoard";
import Members from "./pages/Members";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<PrivateRoutes />}>
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
    <SideBar>
      <Routes>
        <Route path="/" element={<TaskBoard />} />
        <Route path="/members" element={<Members />} />
      </Routes>
    </SideBar>
  ) : null;
}

export default App;
