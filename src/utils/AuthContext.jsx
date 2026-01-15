/* eslint-disable react/prop-types */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { account } from "../appwriteConfig";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [initializing, setInitializing] = useState(true); // only for first load
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [authLoading, setAuthLoading] = useState(false); // for login/logout actions

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const accountDetails = await account.get();
        if (alive) setUser(accountDetails);
      } catch {
        // Not logged in is a normal case; avoid noisy console errors if you want
        if (alive) setUser(null);
      } finally {
        if (alive) setInitializing(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const loginUser = async ({ email, password }) => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      await account.createEmailPasswordSession(email, password);
      const accountDetails = await account.get();
      setUser(accountDetails);
      return { ok: true };
    } catch (error) {
      setUser(null);
      setAuthError(error?.message ?? "Login failed");
      return { ok: false, error };
    } finally {
      setAuthLoading(false);
    }
  };

  const logoutUser = async () => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      await account.deleteSession("current");
      setUser(null);
      return { ok: true };
    } catch (error) {
      setAuthError(error?.message ?? "Logout failed");
      return { ok: false, error };
    } finally {
      setAuthLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      user,
      initializing,
      authLoading,
      authError,
      loginUser,
      logoutUser,
      isAuthenticated: !!user,
    }),
    [user, initializing, authLoading, authError]
  );

  if (initializing) return <LoadingSpinner />;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const LoadingSpinner = () => (
  <div className="bg-gray-100 text-gray-700 flex flex-col items-center justify-center min-h-screen">
    <div className="border-t-blue-500 border-gray-300 w-20 h-20 border-4 rounded-full animate-spin"></div>
    <p className="mt-4 text-lg font-semibold">Loading, please wait...</p>
  </div>
);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
