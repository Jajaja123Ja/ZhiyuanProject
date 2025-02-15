import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Box
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory";
import ReportIcon from "@mui/icons-material/Assessment";
import TrackChangesIcon from "@mui/icons-material/TrackChanges"; // ✅ Used for "Items to Promote"
import PeopleIcon from "@mui/icons-material/People";
import RestoreIcon from "@mui/icons-material/Restore";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import TrendingUpIcon from "@mui/icons-material/TrendingUp"; // ✅ New icon for "Items to Promote"
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";

const drawerWidthExpanded = 250;
const drawerWidthCollapsed = 60;

const Sidebar = ({ isHovered, setIsHovered }) => {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  return (
    <Drawer
      variant="permanent"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        width: isHovered ? drawerWidthExpanded : drawerWidthCollapsed,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: isHovered ? drawerWidthExpanded : drawerWidthCollapsed,
          transition: "width 0.3s ease-in-out",
          overflowX: "hidden",
        },
      }}
    >
      <Box
        sx={{
          width: isHovered ? drawerWidthExpanded : drawerWidthCollapsed,
          textAlign: "center",
          py: 2,
        }}
      >
        <List>
          {/* Only show these if user.Perms is NOT 'REGS' */}
          {user?.Perms !== "REGS" && (
            <>
              <ListItem button onClick={() => navigate("/dashboard")} sx={{ cursor: "pointer" }}>
                <ListItemIcon>
                  <DashboardIcon />
                </ListItemIcon>
                {isHovered && <ListItemText primary="Dashboard" />}
              </ListItem>

              <ListItem button onClick={() => navigate("/Materials")} sx={{ cursor: "pointer" }}>
                <ListItemIcon>
                  <InventoryIcon />
                </ListItemIcon>
                {isHovered && <ListItemText primary="Inventory" />}
              </ListItem>

              <ListItem button onClick={() => navigate("/Reports")} sx={{ cursor: "pointer" }}>
                <ListItemIcon>
                  <ReportIcon />
                </ListItemIcon>
                {isHovered && <ListItemText primary="Reports" />}
              </ListItem>

              {/* Manage Accounts: only for ADMIN or SUPERADMIN */}
              {(user?.Perms === "SUPERADMIN") && (
                <ListItem button onClick={() => navigate("/Accounts")} sx={{ cursor: "pointer" }}>
                  <ListItemIcon>
                    <PeopleIcon />
                  </ListItemIcon>
                  {isHovered && <ListItemText primary="Manage Accounts" />}
                </ListItem>
              )}

              {/* 🔹 Logs: Only visible to ADMIN and SUPERADMIN */}
              {(user?.Perms === "ADMIN" || user?.Perms === "SUPERADMIN") && (
                <ListItem button onClick={() => navigate("/Logs")} sx={{ cursor: "pointer" }}>
                  <ListItemIcon>
                    <RestoreIcon /> {/* ✅ Alternative for HistoryIcon */}
                  </ListItemIcon>
                  {isHovered && <ListItemText primary="Logs" />}
                </ListItem>
              )}
            </>
          )}

          {/* Always show Inventory Tracker (REGS can see this too) */}
          <ListItem button onClick={() => navigate("/InventoryTracker")} sx={{ cursor: "pointer" }}>
            <ListItemIcon>
              <TrackChangesIcon />
            </ListItemIcon>
            {isHovered && <ListItemText primary="Stock IN and OUT" />}
          </ListItem>

          <ListItem button onClick={() => navigate("/Checkinout")} sx={{ cursor: "pointer" }}>
            <ListItemIcon>
              <CompareArrowsIcon />
            </ListItemIcon>
            {isHovered && <ListItemText primary="Check IN and OUT" />}
          </ListItem>

          {/* ✅ New "Items to Promote" section */}
          <ListItem button onClick={() => navigate("/Itemstopromote")} sx={{ cursor: "pointer" }}>
            <ListItemIcon>
              <TrendingUpIcon /> {/* 🔼 Trending icon for Promotions */}
            </ListItemIcon>
            {isHovered && <ListItemText primary="Items to Promote" />}
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
