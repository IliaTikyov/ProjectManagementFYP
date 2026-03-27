import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaSignInAlt } from "react-icons/fa";

const Login = () => {
  const { user, loginUser } = useAuth();
  const navigate = useNavigate();
  const loginForm = useRef(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const email = loginForm.current.email.value;
    const password = loginForm.current.password.value;

    try {
      await loginUser({ email, password });
    } catch (err) {
      console.error("Login Error:", err);

      if (err.status === 401) {
        setError("Invalid email or password.");
      } else if (err.status === 429) {
        setError("Too many attempts. Please try again later.");
      } else {
        setError(
          "Something went wrong. Please check your credentials or contact our administrator.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-slate-100 to-white flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-10">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
          Welcome Back
        </h2>

        <form onSubmit={handleSubmit} ref={loginForm} className="space-y-5">
          {error && (
            <div className="bg-red-100 text-red-700 font-bold text-center text-sm px-4 py-2 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Email
            </label>

            <input
              required
              type="email"
              name="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
            <FaSignInAlt />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
