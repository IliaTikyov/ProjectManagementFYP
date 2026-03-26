/* eslint-disable react/prop-types */
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FaTasks, FaComments } from "react-icons/fa";
import { CiLogout } from "react-icons/ci";
import { Notifications } from "../project/Notifications";

const Sidebar = ({ children }) => {
  const { logoutUser, user } = useAuth();
  const location = useLocation();

  const navItem = (path, label, icon) => {
    const isActive = location.pathname === path;

    return (
      <Link
        to={path}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition text-sm font-medium
        ${
          isActive
            ? "bg-blue-600 text-white shadow-sm"
            : "text-gray-400 hover:bg-gray-800 hover:text-white"
        }`}
      >
        <span className="text-lg">{icon}</span>
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      <div className="w-64 bg-gray-900 text-white flex flex-col p-5">
        <div className="mb-8">
          <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-500 font-semibold">
              {user?.name?.[0] || user?.email?.[0] || "G"}
            </div>

            <div className="flex flex-col">
              <p className="text-sm font-semibold">
                {user ? user.name || user.email : "Guest"}
              </p>
              <p className="text-xs text-gray-400">Active</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {navItem("/", "Task Board", <FaTasks />)}
          {navItem("/members", "Comments", <FaComments />)}
        </div>

        <div className="mt-8">
          <p className="text-xs text-gray-400 mb-2 px-2 uppercase tracking-wide">
            Notifications
          </p>

          <div className="bg-gray-800 rounded-lg p-3 max-h-48 overflow-y-auto">
            <Notifications recipientId={user?.$id} />
          </div>
        </div>

        <button
          onClick={logoutUser}
          className="mt-auto flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 transition text-white py-3 rounded-lg font-medium"
        >
          Logout
          <CiLogout />
        </button>
      </div>

      <div className="flex-grow p-8 bg-gray-50">{children}</div>
    </div>
  );
};

export default Sidebar;
