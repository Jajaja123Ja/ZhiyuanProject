import { useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Checkbox,
  FormControlLabel,
  CircularProgress,
} from "@mui/material";
import { useLogin } from "../hooks/useLogin"; // Import useLogin
import Header from "../Components/Header";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error } = useLogin(); // Use login hook

  const handleSubmit = (e) => {
    e.preventDefault();
    login(username, password);
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
