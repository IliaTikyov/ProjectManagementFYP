import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const PrivateRoutes = () => {
  const { user } = useAuth();

  try {
    return user ? <Outlet /> : <Navigate to="/login" />;
  } catch (error) {
    console.error("Error: Error has occurred in PrivateRoutes", error);
    return <div>Sorry We were unable to connect</div>;
  }
};

export default PrivateRoutes;
