import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Link
} from "@mui/material";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import Header from "../Components/Header";

const firebaseConfig = {
  apiKey: "AIzaSyDq3Htb3rmhajlacOxl-YOehT5IW0mUlFU",
  authDomain: "zhiyuan-inventory.firebaseapp.com",
  databaseURL: "https://zhiyuan-inventory-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "zhiyuan-inventory",
  storageBucket: "zhiyuan-inventory.firebasestorage.app",
  messagingSenderId: "274439912070",
  appId: "1:274439912070:web:c059c4726c3da266186f07",
  measurementId: "G-CV89BZE58Q",
};

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate(); // Initialize useNavigate

  // Login Function
  const login = async (username, password) => {
    setIsLoading(true);
    setError("");
    try {
      const accountsRef = collection(db, "Accounts");
      const q = query(accountsRef, where("Username", "==", username), where("Password", "==", password));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {     
        querySnapshot.forEach((doc) => {
          console.log("User ID:", doc.id, "Data:", doc.data());
        });
        navigate("/Dashboard"); // Redirect to Materials.jsx
      } else {
        setError("Invalid username or password.");
      }
    } catch (err) {
      console.error("Error logging in:", err);
      setError("An error occurred. Please try again.");
    }
    setIsLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    login(username, password);
  };

  return (
    <>
    <Header/>
    <Box
      sx={{
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: "400px",
          p: 4,
          borderRadius: 2,
          boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)",
          backgroundColor: "#ffffff",
        }}
      >
        <Typography variant="h5" sx={{ color: "#96720b", fontWeight: "bold", textAlign: "center" }}>
          Login
        </Typography>
        <Typography variant="body1" sx={{ textAlign: "center", color: "#96720b", mt: 1 }}>
          Please enter your details.
        </Typography>

        {isLoading ? (
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <CircularProgress color="primary" />
            <Typography variant="body1" sx={{ mt: 2 }}>
              Logging in, please wait...
            </Typography>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
            <TextField
              label="Username"
              variant="outlined"
              fullWidth
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <TextField
              label="Password"
              variant="outlined"
              type={showPassword ? "text" : "password"}
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                  sx={{ color: "#96720b" }}
                />
              }
              label="Show Password"
            />

            {error && (
              <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={isLoading}
              sx={{ mt: 4, backgroundColor: "#96720b", "&:hover": { backgroundColor: "#a37b0a" } }}
            >
              LOG IN
            </Button>
          </Box>
        )}
      </Box>
    </Box>
    </>
  );
};

export default Login;
