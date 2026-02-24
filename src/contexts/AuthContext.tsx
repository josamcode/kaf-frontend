import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { User } from "../types";
import { authAPI } from "../services/api";

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
}

type AuthAction =
  | { type: "AUTH_START" }
  | { type: "AUTH_SUCCESS"; payload: { user: User; token: string } }
  | { type: "AUTH_FAILURE"; payload: string }
  | { type: "AUTH_INITIALIZED" }
  | { type: "LOGOUT" }
  | { type: "CLEAR_ERROR" };

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("token"),
  loading: false,
  initialized: false,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "AUTH_START":
      return {
        ...state,
        loading: true,
        error: null,
      };
    case "AUTH_SUCCESS":
      return {
        ...state,
        loading: false,
        initialized: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };
    case "AUTH_FAILURE":
      return {
        ...state,
        loading: false,
        initialized: true,
        user: null,
        token: null,
        error: action.payload,
      };
    case "AUTH_INITIALIZED":
      return {
        ...state,
        initialized: true,
      };
    case "LOGOUT":
      return {
        ...state,
        initialized: true,
        user: null,
        token: null,
        error: null,
      };
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

interface AuthContextType {
  state: AuthState;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  hasPermission: (permission: string) => boolean;
  canAccessGender: (gender: "boy" | "girl") => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (token && userData) {
        try {
          const response = await authAPI.getMe();
          if (response.success && response.user) {
            dispatch({
              type: "AUTH_SUCCESS",
              payload: { user: response.user, token },
            });
          } else {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            dispatch({ type: "AUTH_INITIALIZED" });
          }
        } catch (error) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          dispatch({ type: "AUTH_INITIALIZED" });
        }
      } else {
        dispatch({ type: "AUTH_INITIALIZED" });
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    dispatch({ type: "AUTH_START" });

    try {
      const response = await authAPI.login({ username, password });

      if (response.success && response.token && response.user) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));

        dispatch({
          type: "AUTH_SUCCESS",
          payload: { user: response.user, token: response.token },
        });
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Login failed";
      dispatch({ type: "AUTH_FAILURE", payload: errorMessage });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    dispatch({ type: "LOGOUT" });
  };

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  const hasPermission = (permission: string): boolean => {
    if (!state.user) return false;
    if (state.user.role === "super_admin") return true;
    return state.user.permissions.includes(permission as any);
  };

  const canAccessGender = (gender: "boy" | "girl"): boolean => {
    if (!state.user) return false;
    if (state.user.role === "super_admin") return true;
    if (state.user.genderAccess === "both") return true;
    return state.user.genderAccess === (gender === "boy" ? "boys" : "girls");
  };

  const value: AuthContextType = {
    state,
    login,
    logout,
    clearError,
    hasPermission,
    canAccessGender,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
