import { db } from "../firebase"; // Ensure correct Firebase config path
import { collection, query, where, getDocs, updateDoc, doc, addDoc, serverTimestamp, onSnapshot, writeBatch } from "firebase/firestore";
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
  MenuItem,
} from "@mui/material";
import Navbar from "../Components/Navbar";
import Sidebar from "../Components/Sidebar";
import { useAuthContext } from "../hooks/useAuthContext";
import * as XLSX from "xlsx";
const categories = [
  "In (Delivery)",
  "In (RTS)",
  "Out (Sale)",
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
  const [outFreebiesEntries, setOutFreebiesEntries] = useState([]);
  // Right after your other state variables:
  const [editingItem, setEditingItem] = useState(null);   // holds doc ID
  const [updatedItem, setUpdatedItem] = useState({});     // holds fields being edited

  // For delete confirmation:
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const { user } = useAuthContext();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Adjust as needed



  const tabDataMap = {
    0: [...inDeliveryEntries].sort((a, b) => new Date(b.CREATED_AT) - new Date(a.CREATED_AT)),
    1: [...inReturnEntries].sort((a, b) => new Date(b.CREATED_AT) - new Date(a.CREATED_AT)),
    2: [...outSaleEntries].sort((a, b) => new Date(b.CREATED_AT) - new Date(a.CREATED_AT)),  // ✅ Ensure sorting
    3: [...outFreebiesEntries].sort((a, b) => new Date(b.CREATED_AT) - new Date(a.CREATED_AT)),
  };


  useEffect(() => {
    const fetchCollections = () => {
      const collections = ["OutSale", "InDelivery", "InReturn", "OutFreebies"];

      const unsubscribes = collections.map((collectionName) => {
        const ref = collection(db, collectionName);
        return onSnapshot(ref, (snapshot) => {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            CODE: doc.data().CODE,
            PRODUCT: doc.data().PRODUCT,
            QTY: doc.data().QTY,
            DATE: doc.data().DATE || "",
          }));

          // Dynamically update the corresponding state
          switch (collectionName) {
            case "OutSale":
              setOutSaleEntries(data);
              break;
            case "InDelivery":
              setInDeliveryEntries(data);
              break;
            case "InReturn":
              setInReturnEntries(data);
              break;
            case "OutFreebies":
              setOutFreebiesEntries(data);
              break;
            default:
              console.warn("Unknown collection:", collectionName);
          }
        });
      });

      return () => {
        // Cleanup listeners
        unsubscribes.forEach((unsub) => unsub());
      };
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
    setCurrentPage(1);  // ✅ Reset to first page when changing tabs
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
      const inventoryRef = collection(db, "Inventory");
      const q = query(inventoryRef, where("CODE", "==", newEntry.code.trim()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const productDoc = querySnapshot.docs[0];
        const productData = productDoc.data();
        const productName = productData.PRODUCTNAME || "Unknown Product";

        let updatedStock = Number(productData.ENDINGSTOCK || 0);
        let updatedOutSale = Number(productData.OUTSALE || 0);
        let updatedInDelivery = Number(productData.INDELIVERY || 0);
        let updatedInRTS = Number(productData.INRTS || 0);
        let updatedOutFreebies = Number(productData.OUTFREEBIES || 0);

        let collectionName = "";

        if (categories[selectedTab] === "In (Delivery)") {
          updatedStock += qty;
          updatedInDelivery += qty;
          collectionName = "InDelivery";
        }

        else if (categories[selectedTab] === "Out (Sale)") {
          updatedStock -= qty;
          updatedOutSale += qty;
          collectionName = "OutSale";

          if (updatedStock < 0) {
            alert(`Not enough stock! Available: ${productData.ENDINGSTOCK}`);
            return;
          }
        }

        else if (categories[selectedTab] === "In (RTS)") {
          updatedStock += qty; // Add returned stock back to the total stock
          updatedInRTS += qty; // Update the INRTS count in the database
          collectionName = "InReturn";
        }

        else if (categories[selectedTab] === "Out (Freebies)") {
          updatedStock -= qty; // Deduct the given freebies
          updatedOutFreebies += qty; // Update OUTFREEBIES count
          collectionName = "OutFreebies";

          if (updatedStock < 0) {
            alert(`Not enough stock! Available: ${productData.ENDINGSTOCK}`);
            return;
          }
        }

        // Update the collection (InDelivery, OutSale, InReturn, or OutFreebies)
        await addDoc(collection(db, collectionName), {
          CODE: newEntry.code.trim(),
          PRODUCT: productName,
          QTY: qty,
          DATE: newEntry.date,
          CREATED_BY: user?.User || "unknown",
          CREATED_AT: serverTimestamp(),
        });

        // Update stock in Firestore
        await updateDoc(doc(db, "Inventory", productDoc.id), {
          ENDINGSTOCK: updatedStock,
          OUTSALE: updatedOutSale,
          INDELIVERY: updatedInDelivery,
          INRTS: updatedInRTS,  // ✅ Update INRTS when "In (RTS)" is selected
          OUTFREEBIES: updatedOutFreebies,  // ✅ Update OUTFREEBIES when "Out (Freebies)" is selected
        });

        // Log the action in "Logs"
        await addDoc(collection(db, "Logs"), {
          user: user?.User || "unknown",
          action: `Added new entry to ${collectionName} with code=${newEntry.code.trim()}`,
          timestamp: serverTimestamp(),
          details: {
            qty,
            product: productName,
          },
        });

        setEntries([
          ...entries,
          { id: Date.now(), date: newEntry.date, code: newEntry.code, product: productName, qty, category: categories[selectedTab] },
        ]);

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

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const excelData = XLSX.utils.sheet_to_json(sheet);
  
      try {
        const batch = writeBatch(db); // ✅ Create a batch for faster updates
        const logBatch = writeBatch(db); // ✅ Separate batch for logs
  
        const inventoryRef = collection(db, "Inventory");
        const querySnapshot = await getDocs(inventoryRef);
  
        for (const row of excelData) {
          const code = row["CODE"]?.trim();
          const qty = parseInt(row["Quantity"], 10);
  
          if (!code || isNaN(qty)) continue;
  
          const productDoc = querySnapshot.docs.find((doc) => doc.data().CODE === code);
  
          if (productDoc) {
            const productData = productDoc.data();
            const updatedStock = Math.max((productData.ENDINGSTOCK || 0) - qty, 0);
            const updatedOutSale = (productData.OUTSALE || 0) + qty;
  
            const productRef = doc(db, "Inventory", productDoc.id);
  
            // ✅ Use batch instead of multiple `await` updateDoc
            batch.update(productRef, {
              ENDINGSTOCK: updatedStock,
              OUTSALE: updatedOutSale,
            });
  
            // ✅ Log the update in Firestore "Logs" collection
            const logRef = doc(collection(db, "Logs"));
            logBatch.set(logRef, {
              user: user?.User || "unknown",
              action: `Updated stock via Excel import - Code: ${code}`,
              timestamp: serverTimestamp(),
              details: {
                CODE: code,
                Quantity: qty,
                PreviousStock: productData.ENDINGSTOCK || 0,
                NewStock: updatedStock,
                PreviousOutSale: productData.OUTSALE || 0,
                NewOutSale: updatedOutSale,
              },
            });
          }
        }
  
        // ✅ Commit all updates at once for better performance
        await batch.commit();
        await logBatch.commit();
  
        alert("Stock updated successfully from Excel file!");
      } catch (error) {
        console.error("Error updating stock:", error);
        alert("Failed to update stock. Please try again.");
      }
    };
  
    reader.readAsArrayBuffer(file);
  };

  const handleFileUploadInDelivery = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const excelData = XLSX.utils.sheet_to_json(sheet);
  
      try {
        const batch = writeBatch(db); // ✅ Use batch for better performance
        const logBatch = writeBatch(db); // ✅ Separate batch for logs
  
        const inventoryRef = collection(db, "Inventory");
        const querySnapshot = await getDocs(inventoryRef);
  
        for (const row of excelData) {
          const code = row["CODE"]?.trim();
          const qty = parseInt(row["Quantity"], 10);
  
          if (!code || isNaN(qty)) continue;
  
          const productDoc = querySnapshot.docs.find((doc) => doc.data().CODE === code);
  
          if (productDoc) {
            const productData = productDoc.data();
            const updatedStock = (productData.ENDINGSTOCK || 0) + qty; // ✅ Increase stock
            const updatedInDelivery = (productData.INDELIVERY || 0) + qty; // ✅ Add to INDELIVERY
  
            const productRef = doc(db, "Inventory", productDoc.id);
  
            // ✅ Use batch to update inventory
            batch.update(productRef, {
              ENDINGSTOCK: updatedStock,
              INDELIVERY: updatedInDelivery, // ✅ Ensure INDELIVERY is updated
            });
  
            // ✅ Log the update in Firestore "Logs" collection
            const logRef = doc(collection(db, "Logs"));
            logBatch.set(logRef, {
              user: user?.User || "unknown",
              action: `Imported In (Delivery) stock via Excel - Code: ${code}`,
              timestamp: serverTimestamp(),
              details: {
                CODE: code,
                Quantity: qty,
                PreviousStock: productData.ENDINGSTOCK || 0,
                NewStock: updatedStock,
                PreviousInDelivery: productData.INDELIVERY || 0,
                NewInDelivery: updatedInDelivery,
              },
            });
          }
        }
  
        // ✅ Commit all updates at once
        await batch.commit();
        await logBatch.commit();
  
        alert("Stock updated successfully from Excel file (In Delivery)!");
      } catch (error) {
        console.error("Error updating stock:", error);
        alert("Failed to update stock. Please try again.");
      }
    };
  
    reader.readAsArrayBuffer(file);
  };
  

  const displayedEntries = tabDataMap[selectedTab] || [];
  const totalPages = Math.ceil(displayedEntries.length / itemsPerPage);

  const paginatedEntries = displayedEntries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );


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
              {selectedTab === 0 && (
  <Button
    variant="contained"
    component="label"
    sx={{ bgcolor: "#3f5930", color: "white", mb: 2 }}
  >
    Import In (Delivery)
    <input type="file" hidden onChange={handleFileUploadInDelivery} />
  </Button>
)}
{selectedTab === 2 && (
  <Button
    variant="contained"
    component="label"
    sx={{ bgcolor: "#3f5930", color: "white", mb: 2 }}
  >
    Import In (OutSale)
    <input type="file" hidden onChange={handleFileUpload} />
  </Button>
)}
            </Box>
            
          </Paper>
          {/* Show "Import In (Delivery)" button only on the "In (Delivery)" tab */}



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
                {paginatedEntries.map((entry, index) => (
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
                  </TableRow>
                ))}
              </TableBody>

              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 2 }}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  sx={{ mr: 2 }}
                >
                  Previous
                </Button>

                <TextField
                  select
                  value={currentPage}
                  onChange={(e) => setCurrentPage(Number(e.target.value))}
                  sx={{ mx: 2, minWidth: 100 }}
                >
                  {Array.from({ length: totalPages }, (_, i) => (
                    <MenuItem key={i + 1} value={i + 1}>Page {i + 1}</MenuItem>
                  ))}
                </TextField>

                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  sx={{ ml: 2 }}
                >
                  Next
                </Button>
              </Box>


            </Table>
          </TableContainer>
        </Box>
      </Box>

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
