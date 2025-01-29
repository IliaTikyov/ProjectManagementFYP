import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";

import image from "../assets/ImageOnLoginPage.png";
import { FaSignInAlt } from "react-icons/fa";

const Login = () => {
  const { user, loginUser } = useAuth();
  const navigate = useNavigate();

  const loginForm = useRef(null);

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const email = loginForm.current.email.value;
    const password = loginForm.current.password.value;

    const userInfo = { email, password };

    loginUser(userInfo);
  };

  return (
    <div className=" bg-gradient-to-r from-gray-200 to-white min-h-screen flex items-center justify-center">
      <div className=" bg-white rounded-lg shadow-lg flex flex-col md:flex-row overflow-hidden w-full max-w-4xl">
        <div className="w-full md:w-1/2 items-center justify-center">
          <img src={image} alt="Stay on Track" className="max-w-full h-auto" />
        </div>
        <div className="w-full md:w-1/2 p-10">
          <h2 className="text-2xl font-bold mb-6 flex justify-center">
            Welcome!
          </h2>{" "}
          <form onSubmit={handleSubmit} ref={loginForm}>
            <div className="mb-6">
              <label className="block mb-2 text-lg font-medium text-gray-700">
                Email:
              </label>
              <input
                required
                type="email"
                name="email"
                placeholder="Enter email..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-6">
              <label className="block mb-2 text-lg font-medium text-gray-700">
                Password:
              </label>
              <input
                type="password"
                name="password"
                placeholder="Enter password..."
                autoComplete="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-6">
              <button
                type="submit"
                className="w-full py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition duration-200 flex items-center justify-center"
              >
                <span className="mr-2">Login</span>
                <FaSignInAlt className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
