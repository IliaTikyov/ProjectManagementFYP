/* eslint-disable react/prop-types */
import { createContext, useState, useEffect, useContext } from "react";
import { account } from "../appwriteConfig";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkUserStatus();
  }, []);

  const loginUser = async (userInfo) => {
    setLoading(true);

    console.log("userInfo", userInfo);

    try {
      await account.createEmailSession(userInfo.email, userInfo.password);
      let accountDetails = await account.get();
      setUser(accountDetails);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const logoutUser = async () => {
    await account.deleteSession("current");
    setUser(null);
  };

  const checkUserStatus = async () => {
    try {
      let accountDetails = await account.get();
      setUser(accountDetails);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const contextData = {
    user,
    loginUser,
    logoutUser,
  };

  return (
    <AuthContext.Provider value={contextData}>
      {loading ? <LoadingSpinner /> : children}
    </AuthContext.Provider>
  );
};

const LoadingSpinner = () => {
  return (
    <div className="bg-gray-100 text-gray-700 flex flex-col items-center justify-center min-h-screen">
      <div className="border-t-blue-500 border-gray-300 w-20 h-20 border-4 rounded-full animate-spin"></div>
      <p className="mt-4 text-lg font-semibold">Loading, data please wait...</p>
    </div>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;
