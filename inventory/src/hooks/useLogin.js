import { useState } from "react";
import { useAuthContext } from "./useAuthContext";
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { dispatch } = useAuthContext();
  const navigate = useNavigate();
  const db = getFirestore();

  const login = async (username, password) => {
    setIsLoading(true);
    setError(null);

    try {
      // Query Firestore to check if username and password match
      const accountsRef = collection(db, "Accounts");
      const q = query(accountsRef, where("User", "==", username), where("Password", "==", password)); // Use correct Firestore field names
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("Invalid username or password.");
        setIsLoading(false);
        return;
      }

      let userData = null;
      querySnapshot.forEach((doc) => {
        userData = { id: doc.id, ...doc.data() };
      });

      // Save user details in localStorage
      localStorage.setItem('user', JSON.stringify(userData));

      // Update global auth context
      dispatch({ type: 'LOGIN', payload: userData });

      // Redirect based on user role
      const { Perms } = userData;
      if (Perms === "ADMIN" || Perms === "SUPERADMIN") {
        navigate("/Dashboard");
      } else if (Perms === "REGS") {
        navigate("/InventoryTracker");
      } else {
        navigate("/Unauthorized");
      }
      
    } catch (err) {
      console.error("Error logging in:", err);
      setError("An error occurred. Please try again.");
    }

    setIsLoading(false);
  };

  return { login, isLoading, error };
};
