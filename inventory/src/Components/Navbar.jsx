import { useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { useLogout } from "../hooks/useLogout";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Box
} from "@mui/material";
import { FaUserCircle, FaHome } from "react-icons/fa";

const Navbar = ({ isHovered }) => {
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
      <Toolbar sx={{ display: "flex", alignItems: "center" }}>
        <Box sx={{ flex: 1 }}>
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
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
