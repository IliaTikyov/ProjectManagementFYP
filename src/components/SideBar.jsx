import { Link } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";

import { CiLogout } from "react-icons/ci";

const SideBar = ({ children }) => {
  const { logoutUser } = useAuth();

  return (
    <div className="min-h-screen flex">
      <div className="w-64 bg-blue-500 text-white flex flex-col p-6">
        <Link to="/" className="mb-4 text-lg font-semibold hover:text-gray-200">
          Task Board
        </Link>
        <Link
          to="/members"
          className="mb-4 text-lg font-semibold hover:text-gray-200"
        >
          Members
        </Link>
        <button
          onClick={logoutUser}
          className="mt-auto text-lg font-semibold bg-red-500 text-white hover:bg-red-700 p-3 rounded-lg flex items-center justify-center space-x-2"
        >
          <span>Logout</span>
          <CiLogout />
        </button>
      </div>
      <div className="flex-grow p-6 bg-white">{children}</div>
    </div>
  );
};

export default SideBar;
