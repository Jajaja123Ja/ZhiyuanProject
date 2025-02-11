import { createContext, useReducer, useEffect } from 'react';
import PropTypes from 'prop-types';

export const AuthContext = createContext();

export const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return { user: action.payload };
    case 'LOGOUT':
      return { user: null };
    default:
      return state;
  }
};

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, { user: null });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        dispatch({ type: 'LOGIN', payload: parsedUser });
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        localStorage.removeItem('user'); // Remove corrupted data
        dispatch({ type: 'LOGOUT' });
      }
    } else {
      console.warn('No user found in localStorage');
    }
  }, []);

  console.log('AuthContext state:', state);

  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
