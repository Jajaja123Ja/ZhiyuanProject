import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  Button,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useTheme } from '@mui/material/styles';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const theme = useTheme(); // To use consistent colors

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <AppBar position="fixed" sx={{ backgroundColor: "#f5f5f5", color: "#3f5930" }}>
      <Toolbar sx={{ justifyContent: "space-between", padding: "0.5rem 1rem" }}>
        {/* Logo */}
        <Box component={Link} to="/" sx={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <Typography
            variant="h5"
            sx={{ fontWeight: "bold", color: "#96720b", fontSize: { xs: "28px", md: "32px" } }}
          >
            ZHIYUAN
          </Typography>
          <Typography
            variant="body1"
            sx={{
              ml: 1,
              color: "#96720b",
              fontSize: { xs: "12px", md: "14px" },
            }}
          >
            ENTERPRISE GROUP INC.
          </Typography>
        </Box>

        {/* Desktop Links */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: "24px" }}>
          {['ABOUT US', 'COLLECTION', 'SERVICES', 'CONTACTS'].map((item) => (
            <Button
              key={item}
              component={Link}
              to={`/${item.replace(' ', '').toLowerCase()}`}
              sx={{
                color: "#96720b",
                textTransform: "none",
                fontSize: "16px",
                "&:hover": { color: "#a37b0a" },
              }}
            >
              {item}
            </Button>
          ))}
          <Button
            component={Link}
            to="/login"
            variant="contained"
            sx={{
              backgroundColor: "#96720b",
              color: "#fff",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#a37b0a",
              },
            }}
          >
            LOGIN
          </Button>
        </Box>

        {/* Mobile Menu Icon */}
        <IconButton
          edge="end"
          color="inherit"
          aria-label="menu"
          onClick={toggleMenu}
          sx={{ display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        {/* Drawer for Mobile Navigation */}
        <Drawer anchor="right" open={menuOpen} onClose={toggleMenu}>
          <List sx={{ width: 250 }}>
            {['ABOUT US', 'COLLECTION', 'SERVICES', 'CONTACTS'].map((item) => (
              <ListItem button key={item} component={Link} to={`/${item.replace(' ', '').toLowerCase()}`} onClick={toggleMenu}>
                <ListItemText
                  primary={item}
                  sx={{ textAlign: "center", color: "#3f5930", "&:hover": { color: "#a37b0a" } }}
                />
              </ListItem>
            ))}
            <ListItem button component={Link} to="/login" onClick={toggleMenu}>
              <ListItemText
                primary="LOGIN"
                sx={{ textAlign: "center", color: "#fff", backgroundColor: "#3f5930", borderRadius: "4px", padding: "4px 0", "&:hover": { backgroundColor: "#a37b0a" } }}
              />
            </ListItem>
          </List>
        </Drawer>
      </Toolbar>
    </AppBar>
  );
};

export default Header;