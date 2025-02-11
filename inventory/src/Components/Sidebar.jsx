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
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import PeopleIcon from "@mui/icons-material/People"; // Icon for Manage Accounts
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
              <ListItem
                button
                onClick={() => navigate("/dashboard")}
                sx={{ cursor: "pointer" }}
              >
                <ListItemIcon>
                  <DashboardIcon />
                </ListItemIcon>
                {isHovered && <ListItemText primary="Dashboard" />}
              </ListItem>

              <ListItem
                button
                onClick={() => navigate("/Materials")}
                sx={{ cursor: "pointer" }}
              >
                <ListItemIcon>
                  <InventoryIcon />
                </ListItemIcon>
                {isHovered && <ListItemText primary="Inventory" />}
              </ListItem>

              <ListItem
                button
                onClick={() => navigate("/Reports")}
                sx={{ cursor: "pointer" }}
              >
                <ListItemIcon>
                  <ReportIcon />
                </ListItemIcon>
                {isHovered && <ListItemText primary="Reports" />}
              </ListItem>

              {/* Manage Accounts: only for ADMIN or SUPERADMIN */}
              {(user?.Perms === "ADMIN" || user?.Perms === "SUPERADMIN") && (
                <ListItem
                  button
                  onClick={() => navigate("/Accounts")}
                  sx={{ cursor: "pointer" }}
                >
                  <ListItemIcon>
                    <PeopleIcon />
                  </ListItemIcon>
                  {isHovered && <ListItemText primary="Manage Accounts" />}
                </ListItem>
              )}
              
             {(user?.Perms === "ADMIN" || user?.Perms === "SUPERADMIN") && (
               <ListItem
                button
                onClick={() => navigate("/Logs")}
                 sx={{ cursor: "pointer" }}
              >
                 <ListItemIcon>
                  
                 </ListItemIcon>
                 {isHovered && <ListItemText primary="Logs" />}
               </ListItem>
            )}
            </>
          )}

          {/* Always show Inventory Tracker (REGS can see this too) */}
          <ListItem
            button
            onClick={() => navigate("/InventoryTracker")}
            sx={{ cursor: "pointer" }}
          >
            <ListItemIcon>
              <TrackChangesIcon />
            </ListItemIcon>
            {isHovered && <ListItemText primary="Stock IN and OUT" />}
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
