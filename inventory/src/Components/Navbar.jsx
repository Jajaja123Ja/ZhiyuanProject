import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box
} from "@mui/material";
import { useAuthContext } from "../hooks/useAuthContext";
import { useLogout } from "../hooks/useLogout";

const Navbar = ({ isHovered }) => {
  const { user } = useAuthContext();
  const { logout } = useLogout();

  const handleLogout = () => {
    logout();
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: `calc(100% - ${isHovered ? "250px" : "60px"})`,
        marginLeft: isHovered ? "250px" : "60px",
        backgroundColor: "#f5f5f5",
        color: "#3f5930",
        transition: "margin-left 0.3s ease-in-out, width 0.3s ease-in-out",
        boxShadow: "none",
        padding: "0.5rem 1rem",
      }}
    >
      <Toolbar sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Left Section: Logo and Company Name */}
        <Box>
          <Typography
            variant="h6"
            component="div"
            sx={{
              display: "flex",
              alignItems: "center",
              fontWeight: "bold",
              color: "#96720b",
              fontSize: { xs: "28px", md: "32px" },
            }}
          >
            ZHIYUAN
            <Typography
              variant="body1"
              component="span"
              sx={{
                ml: 1,
                color: "#96720b",
                fontSize: { xs: "12px", md: "14px" },
              }}
            >
              ENTERPRISE GROUP INC.
            </Typography>
          </Typography>
        </Box>

        {/* Right Section: Welcome Message & Logout Button */}
        {user && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="body1" sx={{ fontWeight: "bold", color: "#3f5930" }}>
              Hello, Welcome {user.User}!
            </Typography>
            <Button variant="contained" color="error" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
