import { createContext, useReducer, useEffect, useState } from "react";
import PropTypes from "prop-types";

export const AuthContext = createContext();

export const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      return { user: action.payload };
    case "LOGOUT":
      return { user: null };
    default:
      return state;
  }
};

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, { user: null });

  // Flag to indicate if we've done loading localStorage
  const [authIsReady, setAuthIsReady] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        dispatch({ type: "LOGIN", payload: parsedUser });
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
        localStorage.removeItem("user");
        dispatch({ type: "LOGOUT" });
      }
    }
    // Mark loading complete
    setAuthIsReady(true);
  }, []);

  // Show a loading indicator or spinner while reading localStorage
  if (!authIsReady) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ ...state, dispatch, authIsReady }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
