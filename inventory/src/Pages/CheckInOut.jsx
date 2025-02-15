import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import {
  Card,
  CardContent,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  Typography,
  Box,
  Paper,
  Select,
  MenuItem,
} from "@mui/material";
import Navbar from "../Components/Navbar";
import Sidebar from "../Components/Sidebar";
import { useAuthContext } from "../hooks/useAuthContext";

const CheckInOut = () => {
  const [items, setItems] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [borrower, setBorrower] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isHovered, setIsHovered] = useState(false); 

  const [currentPage, setCurrentPage] = useState(0); // 🔹 Pagination State
  const itemsPerPage = 5; // ✅ Show 5 items per page
  const { user } = useAuthContext(); 

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "borrowedItems"), (snapshot) => {
      setItems(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchInventory = async () => {
      const snapshot = await getDocs(collection(db, "Inventory"));
      setInventory(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchInventory();
  }, []);

  const handleBorrow = async () => {
    if (!selectedItem || !borrower || quantity <= 0) {
      alert("Please enter valid details");
      return;
    }
  
    const itemToBorrow = inventory.find((item) => item.id === selectedItem);
    if (!itemToBorrow || itemToBorrow.ENDINGSTOCK < quantity) {
      alert("Not enough stock available");
      return;
    }
  
    // ✅ Ensure `user.User` exists before logging
    if (!user || !user.User) {
      alert("User authentication issue! Please log in again.");
      return;
    }
  
    try {
      // ✅ Add borrowed item record
      await addDoc(collection(db, "borrowedItems"), {
        itemName: itemToBorrow.PRODUCTNAME,
        borrower,
        quantity,
        borrowedAt: new Date().toISOString(),
        returnedAt: null,
        status: "OUT",
      });
  
      // ✅ Update stock in the inventory
      const itemRef = doc(db, "Inventory", selectedItem);
      await updateDoc(itemRef, {
        ENDINGSTOCK: itemToBorrow.ENDINGSTOCK - quantity,
      });
  
      // ✅ Log the action with the authenticated user
      await addDoc(collection(db, "Logs"), {
        action: "Borrowed Item",
        timestamp: new Date(),
        user: user.User, // ✅ Ensuring who performed the action
        details: {
          InputBy: user.User, // ✅ Logs the user who entered this data
          borrower,
          itemName: itemToBorrow.PRODUCTNAME,
          quantity,
        },
      });
  
      // ✅ Reset input fields after successful borrow
      setBorrower("");
      setSelectedItem("");
      setQuantity(1);
  
      alert("Item successfully borrowed!");
    } catch (error) {
      console.error("Error borrowing item:", error);
      alert("Failed to process borrow request.");
    }
  };
  

  const handleReturn = async (id) => {
    try {
      const borrowedItem = items.find((item) => item.id === id);
      if (!borrowedItem) {
        alert("Item not found!");
        return;
      }
  
      const { itemName, quantity, borrower } = borrowedItem;
      const inventoryItem = inventory.find((item) => item.PRODUCTNAME === itemName);
      if (!inventoryItem) {
        alert("Inventory item not found!");
        return;
      }
  
      // ✅ Ensure user context is available
      if (!user || !user.User) {
        alert("User authentication issue! Please log in again.");
        return;
      }
  
      // ✅ Update inventory stock by adding back the returned quantity
      const itemRef = doc(db, "Inventory", inventoryItem.id);
      await updateDoc(itemRef, {
        ENDINGSTOCK: inventoryItem.ENDINGSTOCK + quantity, // ✅ Restores the stock
      });
  
      // ✅ Update the borrowed item's status to "IN"
      const borrowedItemRef = doc(db, "borrowedItems", id);
      await updateDoc(borrowedItemRef, {
        returnedAt: new Date().toISOString(),
        status: "IN",
      });
  
      // ✅ Log return action with the user who did it
      await addDoc(collection(db, "Logs"), {
        action: "Returned Item",
        timestamp: new Date().toISOString(),
        user: user.User,  // ✅ Capture user details
        details: {
          returnedBy: user.User, // ✅ Now it will show who returned it
          borrower: borrower,
          itemName: itemName,
          quantity: quantity,
        },
      });
  
      alert("Item successfully returned and stock updated!");
    } catch (error) {
      console.error("Error returning item:", error);
      alert("Failed to process return.");
    }
  };
  

  
  

  // 🔹 Apply Pagination (Show Only 5 Items Per Page)
  const paginatedItems = items.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  return (
    <>
      <Navbar isHovered={isHovered} />
      <Box sx={{ display: "flex", marginTop: "64px" }}>
        <Sidebar isHovered={isHovered} setIsHovered={setIsHovered} />
        <Box
          sx={{
            flexGrow: 1,
            padding: 3,
            marginLeft: isHovered ? "10px" : "10px",
            transition: "margin-left 0.3s ease-in-out",
            width: `calc(100% - ${isHovered ? "10px" : "10px"})`,
          }}
        >
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Check-In/Check-Out System
              </Typography>
              <TextField
                label="Search Inventory"
                variant="outlined"
                fullWidth
                sx={{ mb: 2 }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
              />
              <Box display="flex" gap={2} mb={4}>
                <TextField
                  select
                  label="Select Item"
                  variant="outlined"
                  fullWidth
                  value={selectedItem}
                  onChange={(e) => setSelectedItem(e.target.value)}
                  SelectProps={{ native: true }}
                >
                  <option value=""></option>
                  {inventory
                    .filter((item) =>
                      item.PRODUCTNAME.toLowerCase().includes(searchTerm) ||
                      item.CODE.toLowerCase().includes(searchTerm) ||
                      item.CATEGORY.toLowerCase().includes(searchTerm)
                    )
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.PRODUCTNAME} ({item.ENDINGSTOCK} left)
                      </option>
                    ))}
                </TextField>
                <TextField
                  label="Borrower's Name"
                  variant="outlined"
                  value={borrower}
                  onChange={(e) => setBorrower(e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Quantity"
                  type="number"
                  variant="outlined"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  fullWidth
                />
                <Button variant="contained" color="primary" onClick={handleBorrow}>
                  Borrow
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Paper sx={{ mt: 4, p: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><b>Item</b></TableCell>
                  <TableCell><b>Borrower</b></TableCell>
                  <TableCell><b>Borrowed At</b></TableCell>
                  <TableCell><b>Status</b></TableCell>
                  <TableCell><b>Action</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.itemName}</TableCell>
                    <TableCell>{item.borrower}</TableCell>
                    <TableCell>{new Date(item.borrowedAt).toLocaleString()}</TableCell>
                    <TableCell sx={{ color: item.status === "OUT" ? "red" : "green" }}>
                      {item.status}
                    </TableCell>
                    <TableCell>
                      {item.status === "OUT" && (
                        <Button variant="contained" color="secondary" onClick={() => handleReturn(item.id)}>
                          Return
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination Controls */}
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Button disabled={currentPage === 0} onClick={() => setCurrentPage(currentPage - 1)}>Previous</Button>
              <Button disabled={paginatedItems.length < itemsPerPage} onClick={() => setCurrentPage(currentPage + 1)}>Next</Button>
            </Box>
          </Paper>
        </Box>
      </Box>
    </>
  );
};

export default CheckInOut;
