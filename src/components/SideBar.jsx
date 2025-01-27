/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import { FaTasks } from "react-icons/fa";
import { BsPeopleFill } from "react-icons/bs";

import { CiLogout } from "react-icons/ci";

const SideBar = ({ children }) => {
  const { logoutUser, user } = useAuth();

  return (
    <div className="min-h-screen flex">
      <div className="w-64 bg-blue-500 text-white flex flex-col p-6">
        <div className="mb-6 font-semibold flex justify-center">
          Welcome {user ? user.name || user.email : "Guest"}
        </div>
        <Link
          to="/"
          className="mb-4 text-lg text-blue-500 font-semibold hover:text-blue-400 hover:bg-gray-200 border rounded-lg flex items-center justify-center bg-white p-2"
        >
          Task Board <FaTasks className="ml-2 mt-0.5" />
        </Link>
        <Link
          to="/members"
          className="mb-4 text-lg text-blue-500 font-semibold hover:text-blue-400 hover:bg-gray-200 border rounded-lg flex items-center justify-center bg-white p-2"
        >
          Members <BsPeopleFill className="ml-2 mt-0.5" />
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
