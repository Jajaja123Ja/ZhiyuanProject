import { db } from "../firebase"; // Ensure correct Firebase config path
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Tabs,
  Tab,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import Navbar from "../Components/Navbar";
import Sidebar from "../Components/Sidebar";

const categories = [
  "In (Delivery)",
  "In (RTS)",
  "In (Yuan Repaired)",
  "Out (Sale)",
  "Out (Yuan/Damaged)",
  "Out (Freebies)",
];

const fakeEntries = [
  { id: 1, date: "2025-02-05", product: "PERI-TIP-0002", code: "PR-TIP-0002", qty: 11, category: "In (Delivery)" },
  { id: 2, date: "2025-02-06", product: "BLMG-MTHRBL-0011", code: "BLMG-MTHRBL-0011", qty: 1, category: "In (RTS)" },
  { id: 3, date: "2025-02-07", product: "BLMG-KYCHN-0014", code: "BLMG-KYCHN-0014", qty: 1, category: "In (Yuan Repaired)" },
  { id: 4, date: "2025-02-08", product: "BLMG-PREDABAG-0001", code: "BLMG-PREDABAG-0001", qty: 1, category: "Out (Sale)" },
];

const InventoryTracker = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [entries, setEntries] = useState(fakeEntries);
  const [newEntry, setNewEntry] = useState({ date: "", product: "", code: "", qty: "" });
  const [isHovered, setIsHovered] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [deleteEntry, setDeleteEntry] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [outSaleEntries, setOutSaleEntries] = useState([]);

  useEffect(() => {
    const fetchOutSaleItems = async () => {
      try {
        const outSaleCollectionRef = collection(db, "OutSale");
        const snapshot = await getDocs(outSaleCollectionRef);
        const outSaleData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
  
        setOutSaleEntries(outSaleData);
      } catch (error) {
        console.error("Error fetching OutSale items:", error);
      }
    };
  
    fetchOutSaleItems();
  }, []);

  const handleTabChange = (_, newValue) => {
    setSelectedTab(newValue);
  };

  const handleInputChange = (e) => {
    setNewEntry({ ...newEntry, [e.target.name]: e.target.value });
  };

  const addEntry = async () => {
    if (!newEntry.date || !newEntry.code || !newEntry.qty) {
      alert("Please fill in all fields.");
      return;
    }
  
    const qty = parseInt(newEntry.qty, 10); // Convert input to number
    if (isNaN(qty) || qty <= 0) {
      alert("Quantity must be a valid number greater than zero.");
      return;
    }
  
    try {
      const inventoryRef = collection(db, "Inventory");
      const q = query(inventoryRef, where("CODE", "==", newEntry.code));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        const productDoc = querySnapshot.docs[0];
        const productData = productDoc.data();
  
        console.log("Product Data:", productData); // Debugging
  
        // Ensure ENDINGSTOCK is treated as a number
        const currentStock = Number(productData.ENDINGSTOCK || 0);
        const updatedStock = currentStock - qty;
        const updatedOutSale = Number(productData.OUTSALE || 0) + qty;
  
        if (updatedStock < 0) {
          alert(`Not enough stock! Available: ${currentStock}`);
          return;
        }
  
        // Update Firestore Document
        await updateDoc(doc(db, "Inventory", productDoc.id), {
          ENDINGSTOCK: updatedStock,
          OUTSALE: updatedOutSale,
        });
  
        console.log(`Updated Firestore: ENDINGSTOCK=${updatedStock}, OUTSALE=${updatedOutSale}`);
  
        // Update UI
        setEntries([
          ...entries,
          { id: Date.now(), ...newEntry, category: categories[selectedTab] },
        ]);
  
        setNewEntry({ date: "", product: "", code: "", qty: "" });
  
      } else {
        alert("Product code not found in inventory!");
      }
    } catch (error) {
      console.error("Error updating stock:", error);
      alert("Failed to update stock. Please try again.");
    }
  };
  

  const handleEdit = (entry) => {
    setEditingEntry(entry);
  };

  const handleEditChange = (e) => {
    setEditingEntry({ ...editingEntry, [e.target.name]: e.target.value });
  };

  const saveEdit = () => {
    setEntries(entries.map((entry) => (entry.id === editingEntry.id ? editingEntry : entry)));
    setEditingEntry(null);
  };

  const handleDeleteConfirm = (entry) => {
    setDeleteEntry(entry);
    setOpenDeleteDialog(true);
  };

  const handleDelete = () => {
    setEntries(entries.filter((entry) => entry.id !== deleteEntry.id));
    setOpenDeleteDialog(false);
  };

  return (
    <>
      <Navbar isHovered={isHovered} />
      <Box sx={{ display: "flex", marginTop: "64px" }}>
        <Sidebar isHovered={isHovered} setIsHovered={setIsHovered} />
        <Box sx={{ flexGrow: 1, padding: 3, marginLeft: isHovered ? "10px" : "10px", transition: "margin-left 0.3s ease-in-out" }}>
          <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold", color: "#8B4513" }}>
            Inventory Tracker
          </Typography>

          {/* Tabs for categories */}
          <Tabs value={selectedTab} onChange={handleTabChange} centered>
            {categories.map((cat, index) => (
              <Tab key={index} label={cat} />
            ))}
          </Tabs>

          {/* Data Entry Section */}
          <Paper sx={{ p: 3, mt: 2 }}>
            <Typography variant="h6">Add Entry</Typography>
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <TextField label="Date" type="date" name="date" value={newEntry.date} onChange={handleInputChange} />
              <TextField label="Code" name="code" value={newEntry.code} onChange={handleInputChange} />
              <TextField label="Quantity" type="number" name="qty" value={newEntry.qty} onChange={handleInputChange} />
              <Button variant="contained" onClick={addEntry} sx={{ bgcolor: "#8B4513", color: "white" }}>
                Add
              </Button>
            </Box>
          </Paper>

          {/* Data Table */}
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#8B4513", color: "white" }}>
                  <TableCell sx={{ color: "white" }}>Date</TableCell>
                  <TableCell sx={{ color: "white" }}>Product</TableCell>
                  <TableCell sx={{ color: "white" }}>Code</TableCell>
                  <TableCell sx={{ color: "white" }}>Quantity</TableCell>
                  <TableCell sx={{ color: "white" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
              {(selectedTab === 3 ? outSaleEntries : entries)
  .filter((entry) => entry.category === categories[selectedTab] || selectedTab === 3)
  .map((entry, index) => (
                    <TableRow key={index}>
                      <TableCell>{editingEntry?.id === entry.id ? <TextField name="date" value={editingEntry.date} onChange={handleEditChange} /> : entry.date}</TableCell>
                      <TableCell>{editingEntry?.id === entry.id ? <TextField name="product" value={editingEntry.product} onChange={handleEditChange} /> : entry.product}</TableCell>
                      <TableCell>{editingEntry?.id === entry.id ? <TextField name="code" value={editingEntry.code} onChange={handleEditChange} /> : entry.code}</TableCell>
                      <TableCell>{editingEntry?.id === entry.id ? <TextField name="qty" value={editingEntry.qty} onChange={handleEditChange} /> : entry.qty}</TableCell>
                      <TableCell>
                        {editingEntry?.id === entry.id ? (
                          <Button variant="contained" onClick={saveEdit} sx={{ mr: 1 }}>
                            Save
                          </Button>
                        ) : (
                          <>
                            <Button variant="outlined" onClick={() => handleEdit(entry)} sx={{ mr: 1 }}>
                              Edit
                            </Button>
                            <Button variant="contained" color="error" onClick={() => handleDeleteConfirm(entry)}>
                              Delete
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this entry?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default InventoryTracker;
