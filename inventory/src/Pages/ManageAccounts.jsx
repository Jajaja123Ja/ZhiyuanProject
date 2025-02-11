import React, { useState, useEffect } from "react";
import Navbar from "../Components/Navbar";
import Sidebar from "../Components/Sidebar";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc
} from "firebase/firestore";

import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem,
  IconButton
} from "@mui/material";

// Eye icons for toggling password visibility
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

const ManageAccounts = () => {
  // Track whether the sidebar is hovered
  const [isHovered, setIsHovered] = useState(false);

  // Accounts state
  const [accounts, setAccounts] = useState([]);
  const [userField, setUserField] = useState("");
  const [passwordField, setPasswordField] = useState("");
  const [permsField, setPermsField] = useState("");

  // Tracks password visibility for each account row
  // e.g. { "id123": true, "id456": false, ... }
  const [passwordVisibility, setPasswordVisibility] = useState({});

  // Fetch all accounts on mount
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const snapshot = await getDocs(collection(db, "Accounts"));
        const accountsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAccounts(accountsData);
      } catch (error) {
        console.error("Error fetching accounts:", error);
      }
    };

    fetchAccounts();
  }, []);

  // Create a new account
  const handleCreateAccount = async () => {
    if (!userField.trim() || !passwordField.trim() || !permsField.trim()) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "Accounts"), {
        User: userField.trim(),
        Password: passwordField.trim(),
        Perms: permsField.trim(),
      });

      // Add the new account to local state
      setAccounts((prev) => [
        ...prev,
        {
          id: docRef.id,
          User: userField.trim(),
          Password: passwordField.trim(),
          Perms: permsField.trim(),
        },
      ]);

      // Reset form fields
      setUserField("");
      setPasswordField("");
      setPermsField("");
    } catch (error) {
      console.error("Error creating account:", error);
      alert("Failed to create account.");
    }
  };

  // Delete an account by ID
  const handleDeleteAccount = async (id) => {
    if (!window.confirm("Are you sure you want to delete this account?")) return;

    try {
      await deleteDoc(doc(db, "Accounts", id));
      setAccounts((prev) => prev.filter((account) => account.id !== id));
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Failed to delete account.");
    }
  };

  // Toggle password visibility for one account
  const togglePasswordVisibility = (id) => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [id]: !prev[id], // flip the boolean for this ID
    }));
  };

  return (
    <>
      <Navbar isHovered={isHovered} />
      <Box sx={{ display: "flex", marginTop: "64px" }}>
        <Sidebar isHovered={isHovered} setIsHovered={setIsHovered} />

        {/* Main Content Area */}
        <Box
          sx={{
            flexGrow: 1,
            padding: 3,
            marginLeft: isHovered ? "10px" : "10px",
            transition: "margin-left 0.3s ease-in-out",
            width: `calc(100% - ${isHovered ? "10px" : "10px"})`,
          }}
        >
          <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold", color: "#96720b" }}>
            Manage Accounts
          </Typography>

          {/* Create Account Form */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6">Create New Account</Typography>
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <TextField
                label="Username"
                value={userField}
                onChange={(e) => setUserField(e.target.value)}
              />
              <TextField
                label="Password"
                type="password"
                value={passwordField}
                onChange={(e) => setPasswordField(e.target.value)}
              />
              <TextField
                label="Perms"
                select
                value={permsField}
                onChange={(e) => setPermsField(e.target.value)}
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="ADMIN">ADMIN</MenuItem>
                <MenuItem value="REGS">REGS</MenuItem>
              </TextField>

              <Button variant="contained" onClick={handleCreateAccount}>
                Create
              </Button>
            </Box>
          </Paper>

          {/* Accounts Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ backgroundColor: "#3f5930" }}>
                <TableRow>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Username
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Password
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Perms
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {accounts.map((account) => {
                  const isVisible = passwordVisibility[account.id] || false;
                  return (
                    <TableRow key={account.id}>
                      <TableCell>{account.User}</TableCell>

                      {/* Password Cell: either show '•••••' or real password */}
                      <TableCell>
                        {isVisible ? account.Password : "•••••••"}
                        <IconButton
                          onClick={() => togglePasswordVisibility(account.id)}
                          sx={{ ml: 1 }}
                        >
                          {isVisible ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </TableCell>

                      <TableCell>{account.Perms}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => handleDeleteAccount(account.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {accounts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No accounts found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </>
  );
};

export default ManageAccounts;
