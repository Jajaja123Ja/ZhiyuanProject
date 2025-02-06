import React from "react";
import { Drawer, List, ListItem, ListItemText, ListItemIcon, Box } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory";
import InputIcon from "@mui/icons-material/Input";
import OutputIcon from "@mui/icons-material/ExitToApp";
import ReportIcon from "@mui/icons-material/Assessment";
import TrackChangesIcon from "@mui/icons-material/TrackChanges"; // Added Inventory Tracker Icon
import { useNavigate } from "react-router-dom";

const drawerWidthExpanded = 250;
const drawerWidthCollapsed = 60;

const Sidebar = ({ isHovered, setIsHovered }) => {
  const navigate = useNavigate();

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
      <Box sx={{ width: isHovered ? drawerWidthExpanded : drawerWidthCollapsed, textAlign: "center", py: 2 }}>
        <List>
          <ListItem button onClick={() => navigate("/dashboard")} sx={{ cursor: "pointer" }}>
            <ListItemIcon><DashboardIcon /></ListItemIcon>
            {isHovered && <ListItemText primary="Dashboard" />}
          </ListItem>

          <ListItem button onClick={() => navigate("/Materials")} sx={{ cursor: "pointer" }}>
            <ListItemIcon><InventoryIcon /></ListItemIcon>
            {isHovered && <ListItemText primary="Inventory" />}
          </ListItem>

          <ListItem button onClick={() => navigate("/InventoryTracker")} sx={{ cursor: "pointer" }}>
            <ListItemIcon><TrackChangesIcon /></ListItemIcon>
            {isHovered && <ListItemText primary="Stock IN and OUT" />}
          </ListItem>

          <ListItem button onClick={() => navigate("/Reports")} sx={{ cursor: "pointer" }}>
            <ListItemIcon><ReportIcon /></ListItemIcon>
            {isHovered && <ListItemText primary="Reports" />}
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
