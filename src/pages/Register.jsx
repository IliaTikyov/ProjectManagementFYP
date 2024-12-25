import { useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";

const Register = () => {
  const registerForm = useRef(null);
  const { registerUser } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();

    const name = registerForm.current.name.value;
    const email = registerForm.current.email.value;
    const password1 = registerForm.current.password1.value;
    const password2 = registerForm.current.password2.value;

    if (password1 !== password2) {
      alert("Passwords did not match!");
      return;
    }

    const userInfo = { name, email, password1, password2 };

    registerUser(userInfo);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-200 to-white">
      <div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Create Your Account</h2>
        <form ref={registerForm} onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block mb-2 text-lg font-medium text-gray-700">
              Name:
            </label>
            <input
              required
              type="text"
              name="name"
              placeholder="Enter name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
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
              name="password1"
              placeholder="Enter password..."
              autoComplete="password1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-6">
            <label className="block mb-2 text-lg font-medium text-gray-700">
              Confirm Password:
            </label>
            <input
              type="password"
              name="password2"
              placeholder="Confirm password..."
              autoComplete="password2"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-6">
            <input
              type="submit"
              value="Register"
              className="w-full py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition duration-200"
            />
          </div>
        </form>
        <p className="text-center text-gray-600">
          Already have an account?
          <Link to="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
