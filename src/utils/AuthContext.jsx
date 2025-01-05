import { createContext, useState, useEffect, useContext } from "react";
import { account } from "../appwriteConfig";
import { useNavigate } from "react-router-dom";
import { ID } from "appwrite";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

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

  const registerUser = async (userInfo) => {
    setLoading(true);

    try {
      await account.create(
        ID.unique(),
        userInfo.email,
        userInfo.password1,
        userInfo.name
      );

      await account.createEmailSession(userInfo.email, userInfo.password1);
      let accountDetails = await account.get();
      setUser(accountDetails);
      navigate("/");
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
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
    registerUser,
  };

  return (
    <AuthContext.Provider value={contextData}>
      {loading ? <LoadingSpinner /> : children}
    </AuthContext.Provider>
  );
};

const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-700">
      <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
      <p className="mt-4 text-lg font-semibold">Loading, please wait...</p>
    </div>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;
