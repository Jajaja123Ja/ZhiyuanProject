import { db } from "../firebase"; // Ensure correct Firebase config path
import { collection, query, where, getDocs, updateDoc, doc, addDoc, serverTimestamp } from "firebase/firestore";
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
import { useAuthContext } from "../hooks/useAuthContext";

const categories = [
  "In (Delivery)",
  "In (RTS)",
  "In (Yuan Repaired)",
  "Out (Sale)",
  "Out (Yuan/Damaged)",
  "Out (Freebies)",
];

function getCollectionNameForTab(tabIndex) {
  // Adjust these to match how you're mapping tabs
  switch (tabIndex) {
    case 0:
      return "InDelivery";     // In (Delivery)
    case 1:
      return "InReturn";       // In (RTS)
    case 2:
      return "InYuanRepaired"; // If you create this collection
    case 3:
      return "OutSale";        // Out (Sale)
    case 4:
      return "OutYuanDmg";     // If you create this collection
    case 5:
      return "OutFreebies";    // If you create this collection
    default:
      return null;
  }
}




const InventoryTracker = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [entries, setEntries] = useState([]);
  const [newEntry, setNewEntry] = useState({ date: "", product: "", code: "", qty: "" });
  const [isHovered, setIsHovered] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [outSaleEntries, setOutSaleEntries] = useState([]);
  const [inDeliveryEntries, setInDeliveryEntries] = useState([]);
  const [inReturnEntries, setInReturnEntries] = useState([]);
  // Right after your other state variables:
const [editingItem, setEditingItem] = useState(null);   // holds doc ID
const [updatedItem, setUpdatedItem] = useState({});     // holds fields being edited

// For delete confirmation:
const [deleteModalOpen, setDeleteModalOpen] = useState(false);
const [entryToDelete, setEntryToDelete] = useState(null);
const { user } = useAuthContext();


  const tabDataMap = {
    0: inDeliveryEntries,    // "In (Delivery)"
    1: inReturnEntries,      // "In (RTS)" in your code, but stored in "InReturn"
    2: entries,              // "In (Yuan Repaired)" – you may want to fetch from InYuanRepaired if you have it
    3: outSaleEntries,       // "Out (Sale)"
    4: entries,              // "Out (Yuan/Damaged)" – fetch from OutYuanDmg if you have it
    5: entries,              // "Out (Freebies)" – fetch from OutFreebies if you have it
  };


  useEffect(() => {
    const fetchCollections = async () => {
      try {
        // 1) OutSale
        {
          const outSaleRef = collection(db, "OutSale");
          const snapshot = await getDocs(outSaleRef);
          const outSaleData = snapshot.docs.map((doc) => ({
            id: doc.id,
            CODE: doc.data().CODE,
            PRODUCT: doc.data().PRODUCT,
            QTY: doc.data().QTY,
            DATE: doc.data().DATE || "",
          }));          
          setOutSaleEntries(outSaleData);
        }

        // 2) InDelivery
        {
          const inDeliveryRef = collection(db, "InDelivery");
          const snapshot = await getDocs(inDeliveryRef);
          const inDeliveryData = snapshot.docs.map((doc) => ({
            id: doc.id,
            CODE: doc.data().CODE,
            PRODUCT: doc.data().PRODUCT,
            QTY: doc.data().QTY,
            DATE: doc.data().DATE || "", // Include date
          }));
          setInDeliveryEntries(inDeliveryData);
        }

        // 3) InReturn
        {
          const inReturnRef = collection(db, "InReturn");
          const snapshot = await getDocs(inReturnRef);
          const inReturnData = snapshot.docs.map((doc) => ({
            id: doc.id,
            CODE: doc.data().CODE,
            PRODUCT: doc.data().PRODUCT,
            QTY: doc.data().QTY,
            DATE: doc.data().DATE || "",
          }));
          setInReturnEntries(inReturnData);
        }

        // ... Repeat for other collections you have (InYuanRepaired, OutFreebies, OutYuanDmg, etc.)

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchCollections();
  }, []);

  // When user clicks "Edit" on a row:
const handleEdit = (entry) => {
  setEditingItem(entry.id);          // The doc’s Firestore ID
  setUpdatedItem({ ...entry });      // Copy fields into updatedItem
};

// Sync text field changes to updatedItem
const handleUpdatedItemChange = (e) => {
  const { name, value } = e.target;
  setUpdatedItem((prev) => ({
    ...prev,
    [name]: value,
  }));
};

const saveEdit = async () => {
  try {
    // Determine which collection this doc belongs to, based on `selectedTab`
    const collectionName = getCollectionNameForTab(selectedTab);
    if (!collectionName) {
      alert("Invalid tab/collection.");
      return;
    }

    // Update Firestore doc
    await updateDoc(doc(db, collectionName, editingItem), {
      // If your Firestore fields are uppercase, match them here:
      CODE: updatedItem.CODE,
      PRODUCT: updatedItem.PRODUCT,
      QTY: updatedItem.QTY,
      DATE: updatedItem.DATE,
      // ... any other fields you want to update
    });

    // Update local state array (e.g., outSaleEntries or inDeliveryEntries)
    // 1) Grab the existing array for this tab:
    let currentArray = [...tabDataMap[selectedTab]];
    
    // 2) Find the index of the edited doc:
    const idx = currentArray.findIndex((doc) => doc.id === editingItem);
    if (idx !== -1) {
      // 3) Overwrite that item with updatedItem
      //    (Make sure keys match your local objects, e.g. PRODUCT vs product, etc.)
      currentArray[idx] = {
        id: editingItem,
        CODE: updatedItem.CODE,
        PRODUCT: updatedItem.PRODUCT,
        QTY: updatedItem.QTY,
        DATE: updatedItem.DATE,
      };
    }

    // 4) Put that updated array back into state
    //    depending on which tab we’re on
    switch (selectedTab) {
      case 0:
        setInDeliveryEntries(currentArray);
        break;
      case 1:
        setInReturnEntries(currentArray);
        break;
      case 3:
        setOutSaleEntries(currentArray);
        break;
      default:
        setEntries(currentArray);
        break;
    }

    // Reset editing
    setEditingItem(null);
    setUpdatedItem({});
    // Optionally show a success message
    alert("Item updated successfully!");
  } catch (error) {
    console.error("Error saving edit:", error);
    alert("Failed to update item.");
  }
};

// If user clicks "Cancel" while editing
const cancelEdit = () => {
  setEditingItem(null);
  setUpdatedItem({});
};


  const handleTabChange = (_, newValue) => {
    setSelectedTab(newValue);
  };

  const handleInputChange = (e) => {
    setNewEntry({ ...newEntry, [e.target.name]: e.target.value });
  };

  const addEntry = async () => {
    if (!newEntry.date.trim() || !newEntry.code.trim() || !newEntry.qty) {
      alert("Please fill in all fields.");
      return;
    }
  
    const qty = parseInt(newEntry.qty, 10);
    if (isNaN(qty) || qty <= 0) {
      alert("Quantity must be a valid number greater than zero.");
      return;
    }
  
    try {
      // 🔹 Query the Inventory collection for the entered code
      const inventoryRef = collection(db, "Inventory");
      const q = query(inventoryRef, where("CODE", "==", newEntry.code.trim()));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        const productDoc = querySnapshot.docs[0];
        const productData = productDoc.data();
        const productName = productData.PRODUCTNAME || "Unknown Product"; // Fetch correct product name
  
        console.log("Fetched Product Data:", productData);
  
        let updatedStock = Number(productData.ENDINGSTOCK || 0);
        let updatedOutSale = Number(productData.OUTSALE || 0);
        let updatedInDelivery = Number(productData.INDELIVERY || 0);
  
        if (categories[selectedTab] === "Out (Sale)") {
          updatedStock -= qty;
          updatedOutSale += qty;
  
          if (updatedStock < 0) {
            alert(`Not enough stock! Available: ${productData.ENDINGSTOCK}`);
            return;
          }
  
          // ✅ Save to OutSale collection with correct product name
          await addDoc(collection(db, "OutSale"), {
            CODE: newEntry.code.trim(),
            PRODUCT: productName, // Automatically fetched from Inventory
            QTY: qty,
            DATE: newEntry.date, 
            CREATED_BY: user?.User || "unknown",
            CREATED_AT: serverTimestamp(),
          });
          + // 🔹 Log the "Add" action
 await addDoc(collection(db, "Logs"), {
  user: user?.User || "unknown",
  action: `Added new entry to OutSale with code=${newEntry.code.trim()}`,
   timestamp: serverTimestamp(),
   details: {
     qty,
     product: productName,
   },
 });
        } 
        else if (categories[selectedTab] === "In (Delivery)") {
          updatedInDelivery += qty;
  
          // ✅ Save to InDelivery collection with correct product name
          await addDoc(collection(db, "InDelivery"), {
            CODE: newEntry.code.trim(),
            PRODUCT: productName, // Automatically fetched from Inventory
            QTY: qty,
            DATE: newEntry.date, 
            CREATED_BY: user?.User || "unknown",
            CREATED_AT: serverTimestamp(),
          });
          + // 🔹 Log the "Add" action
          await addDoc(collection(db, "Logs"), {
           user: user?.User || "unknown",
           action: `Added new entry to InDelivery with code=${newEntry.code.trim()}`,
            timestamp: serverTimestamp(),
            details: {
              qty,
              product: productName,
            },
          });
        } 
        else if (categories[selectedTab] === "In (RTS)") {
          updatedStock += qty;

          await addDoc(collection(db, "InReturn"), {
            CODE: newEntry.code.trim(),
            PRODUCT: productName, // Automatically fetched from Inventory
            QTY: qty,
            DATE: newEntry.date, 
            CREATED_BY: user?.User || "unknown",
            CREATED_AT: serverTimestamp(),
          });
        }
  
        // ✅ Update the Inventory document properly
        await updateDoc(doc(db, "Inventory", productDoc.id), {
          ENDINGSTOCK: updatedStock,
          OUTSALE: updatedOutSale,
          INDELIVERY: updatedInDelivery,
        });
  
        console.log(`Updated Firestore: ENDINGSTOCK=${updatedStock}, OUTSALE=${updatedOutSale}, INDELIVERY=${updatedInDelivery}`);
  
        // ✅ Update UI
        setEntries([
          ...entries,
          { id: Date.now(), date: newEntry.date, code: newEntry.code, product: productName, qty: qty, category: categories[selectedTab] },
        ]);
  
        // ✅ Reset form
        setNewEntry({ date: "", code: "", qty: "" });
  
      } else {
        alert("Product code not found in inventory!");
      }
    } catch (error) {
      console.error("Error updating stock:", error);
      alert("Failed to update stock. Please try again.");
    }
  };
  
  const handleDeleteConfirm = (entry) => {
    setEntryToDelete(entry);
    setDeleteModalOpen(true);
  };
  
  const handleDelete = async () => {
    if (!entryToDelete) return;
    try {
      const collectionName = getCollectionNameForTab(selectedTab);
      if (!collectionName) {
        alert("Invalid tab/collection.");
        return;
      }
  
      await deleteDoc(doc(db, collectionName, entryToDelete.id));
  
      // Remove from local state
      let currentArray = [...tabDataMap[selectedTab]];
      currentArray = currentArray.filter((doc) => doc.id !== entryToDelete.id);
  
      switch (selectedTab) {
        case 0:
          setInDeliveryEntries(currentArray);
          break;
        case 1:
          setInReturnEntries(currentArray);
          break;
        case 3:
          setOutSaleEntries(currentArray);
          break;
        default:
          setEntries(currentArray);
          break;
      }
  
      setDeleteModalOpen(false);
      setEntryToDelete(null);
      alert("Entry deleted!");
    } catch (error) {
      console.error("Error deleting entry:", error);
      alert("Failed to delete entry.");
    }
  };
  
  
  const displayedEntries = tabDataMap[selectedTab] || [];
  
  return (
    <>
      <Navbar isHovered={isHovered} />
      <Box sx={{ display: "flex", marginTop: "64px" }}>
        <Sidebar isHovered={isHovered} setIsHovered={setIsHovered} />
        <Box sx={{ flexGrow: 1, padding: 3, marginLeft: isHovered ? "10px" : "10px", transition: "margin-left 0.3s ease-in-out" }}>
          <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold", color: "#96720b" }}>
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
              <Button variant="contained" onClick={addEntry} sx={{ bgcolor: "#3f5930", color: "white" }}>
                Add
              </Button>
            </Box>
          </Paper>

          {/* Data Table */}
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#3f5930", color: "white" }}>
                  <TableCell sx={{ color: "white" }}>Date</TableCell>
                  <TableCell sx={{ color: "white" }}>Product</TableCell>
                  <TableCell sx={{ color: "white" }}>Code</TableCell>
                  <TableCell sx={{ color: "white" }}>Quantity</TableCell>
                  {/* <TableCell sx={{ color: "white" }}>Actions</TableCell> */}
                </TableRow>
              </TableHead>
<TableBody>
  {displayedEntries.map((entry, index) => (
    <TableRow key={index}>
      <TableCell>
  {editingItem === entry.id ? (
    <TextField
      name="DATE"
      type="date"
      value={updatedItem.DATE}
      onChange={handleUpdatedItemChange}
    />
  ) : (
    entry.DATE
  )}
</TableCell>

      <TableCell>
        {editingItem === entry.id ? (
          <TextField
            name="product"
            value={updatedItem.PRODUCT}
            onChange={handleUpdatedItemChange}
          />
        ) : (
          entry.PRODUCT
        )}
      </TableCell>
      <TableCell>
        {editingItem === entry.id ? (
          <TextField
            name="code"
            value={updatedItem.CODE}
            onChange={handleUpdatedItemChange}
          />
        ) : (
          entry.CODE
        )}
      </TableCell>
      <TableCell>
        {editingItem === entry.id ? (
          <TextField
            name="qty"
            value={updatedItem.QTY}
            onChange={handleUpdatedItemChange}
          />
        ) : (
          entry.QTY
        )}
      </TableCell>
     
      {/* <TableCell>
  {editingItem === entry.id ? (
    <>
      <Button variant="contained" color="primary" onClick={saveEdit}>
        Save
      </Button>
      <Button variant="outlined" onClick={cancelEdit} sx={{ ml: 1 }}>
        Cancel
      </Button>
    </>
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
</TableCell> */}
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
