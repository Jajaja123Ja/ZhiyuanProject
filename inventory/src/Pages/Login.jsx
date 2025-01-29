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
import { useLogin } from "../hooks/useLogin";
import axios from "axios";
import Header from "../Components/Header";
import AlertModal from "../Components/AlertModal"; 

const Login = () => {
  const [Username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, error, isLoading } = useLogin();

  // Alert Modal States
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("info"); // Default type

  // Function to show alerts
  const showAlert = (title, message, type = "info") => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setIsAlertOpen(true);
  };

  // Handle login errors via AlertModal
  useEffect(() => {
    if (error) {
      showAlert("Login Error", error, "error");
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(Username, password);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!Username) {
      // Show validation error in modal
      showAlert("Validation Error", "Please enter your Username to reset the password.", "error");
      return;
    }

    try {
      await axios.patch(`https://foxconstruction-final.onrender.com/api/user/forgot-password/${Username}`);
      // Show success message in modal
      showAlert("Success", "Password reset request has been sent.", "success");
    } catch (error) {
      console.error("Error sending password reset request", error);
      // Show error message in modal
      showAlert("Error", "Failed to send password reset request. Please try again.", "error");
    }
  };

  return (
    <>
      <Header />
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
          <Typography
            variant="h5"
            sx={{ color: "#96720b", fontWeight: "bold", textAlign: "center" }}
          >
            Get Ready. We&#39;re Finishing!
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "center", color: "#96720b", mt: 1 }}
          >
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
                value={Username}
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

              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                <Link href="#" onClick={handleForgotPassword} underline="hover" sx={{ color: "#96720b" }}>
                  Forgot password?
                </Link>
              </Box>

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

      {/* Alert Modal */}
      <AlertModal
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
      />
    </>
  );
};

export default Login;