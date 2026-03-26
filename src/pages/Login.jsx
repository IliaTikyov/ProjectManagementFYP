import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaSignInAlt } from "react-icons/fa";

const Login = () => {
  const { user, loginUser } = useAuth();
  const navigate = useNavigate();
  const loginForm = useRef(null);

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const email = loginForm.current.email.value;
    const password = loginForm.current.password.value;

    loginUser({ email, password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-slate-100 to-white flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-10">
        <h2 className="text-3xl font-semibold text-gray-800 mb-8 text-center">
          Welcome Back
        </h2>

        <form onSubmit={handleSubmit} ref={loginForm} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Email
            </label>

            <input
              required
              type="email"
              name="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Password
            </label>

            <input
              required
              type="password"
              name="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-sm"
          >
            Login
            <FaSignInAlt />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
