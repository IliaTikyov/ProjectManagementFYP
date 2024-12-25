import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";

const Header = () => {
  const navigate = useNavigate();
  const { user, logoutUser } = useAuth();

  const logoutClick = () => {
    navigate("/login");
  };

  return (
    <div>
      <div>
        <Link to="/">Dashboard</Link>
        <Link to="/profile">Members</Link>
        <button onClick={logoutUser}>Logout</button>
      </div>
    </div>
  );
};

export default Header;
