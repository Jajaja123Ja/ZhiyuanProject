import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  MenuItem
} from "@mui/material";
import { serverTimestamp } from "firebase/firestore";

import AddIcon from "@mui/icons-material/Add";
import { useAuthContext } from "../hooks/useAuthContext";
import Navbar from "../Components/Navbar";
import ConfirmDeleteMaterialModal from "../Components/ConfirmDeleteMaterialModal";
import CreateMaterialModal from "../Components/CreateMaterialModal";
import SuccessModal from "../Components/SuccessModal";
import Sidebar from "../Components/Sidebar";
import { db } from "../firebase"; // Firestore
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  updateDoc
} from "firebase/firestore";


const Materials = () => {
  const [materials, setMaterials] = useState([]);
  const { user } = useAuthContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [updatedItem, setUpdatedItem] = useState({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [brandFilter, setBrandFilter] = useState(""); 
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [totalItems, setTotalItems] = useState(0);
const [brandCounts, setBrandCounts] = useState({
  BLM: 0,
  KL: 0,
  PERI: 0,
});

const [currentPage, setCurrentPage] = useState(0);
const itemsPerPage = 10;





useEffect(() => {
  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const inventoryCollection = collection(db, "Inventory");
      const snapshot = await getDocs(inventoryCollection);
      const realData = snapshot.docs.map((doc) => ({
        id: doc.id,
        CODE: doc.data().CODE || "",
        CATEGORY: doc.data().CATEGORY || "",
        BRAND: doc.data().BRAND || "",
        PRODUCTNAME: doc.data().PRODUCTNAME || "",
        TIPSIZE: doc.data().TIPSIZE || "",
        PRICE: doc.data().PRICE || "",
        OPENINGSTOCK: doc.data().OPENINGSTOCK || 0,
        INDELIVERY: doc.data().INDELIVERY || 0,
        OUTSALE: doc.data().OUTSALE || 0,
        ENDINGSTOCK: doc.data().ENDINGSTOCK || 0,
        STATUS: doc.data().STATUS || "OK",
        IMAGE_URL: doc.data().IMAGE_URL || "",
      }));

      setMaterials(realData);
      setTotalItems(realData.length); // Set total number of items

      // Count items per brand
      const brandCounter = {
        BLM: realData.filter((item) => item.CODE.startsWith("BLM")).length,
        KL: realData.filter((item) => item.CODE.startsWith("KL")).length,
        PERI: realData.filter((item) => item.CODE.startsWith("PERI")).length,
      };
      setBrandCounts(brandCounter);
    } catch (error) {
      console.error("Error fetching materials:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchMaterials();
}, []);


  const filterByBrand = (brand) => {
    setBrandFilter(brand);
  };

  // Function to reset the filter
  const resetFilter = () => {
    setBrandFilter("");
  };

  const handleEdit = (item) => {
    setEditingItem(item.id); // Store the ID of the editing item
    setUpdatedItem({ ...item }); // Load current values into the form
  };

  // 🔹 Handle Input Change for Editing
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedItem((prev) => ({
      ...prev,
      [name]: value, // Update the correct field
    }));
  };


  // 🔹 Enable Editing on DELETE Click
  const handleDeleteConfirm = (item) => {
    setEditingItem(item.id);
    setUpdatedItem({ ...item }); // Allow fields to be edited
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };



  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      await deleteDoc(doc(db, "Inventory", itemToDelete.id));
      setMaterials(materials.filter((item) => item.id !== itemToDelete.id));
      setEditingItem(null);
      setDeleteModalOpen(false);

      // ✅ Show success modal
      setSuccessMessage("Item successfully deleted!");
      setSuccessModalOpen(true);
         // 🔹 Add a log entry
     await addDoc(collection(db, "Logs"), {
       user: user?.User || "unknown",
       action: `Deleted material ID=${itemToDelete.id}`,
     timestamp: serverTimestamp(),
       details: {
         code: itemToDelete.CODE,
        productName: itemToDelete.PRODUCTNAME,
        },
    });
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete item.");
    }
  };



  // 🔹 Save Edits to Firestore
  const saveEdit = async () => {
    try {
      await updateDoc(doc(db, "Inventory", editingItem), updatedItem);
      setMaterials(materials.map((item) => (item.id === editingItem ? { ...updatedItem, id: editingItem } : item)));
      setEditingItem(null);

      // ✅ Show success modal
      setSuccessMessage("Item successfully updated!");
      setSuccessModalOpen(true);
      // 🔹 Add a log entry
     await addDoc(collection(db, "Logs"), {
         user: user?.User || "unknown",
         action: `Updated material ID=${editingItem}`,
       timestamp: serverTimestamp(),
         oldData: {},      // if you want
        newData: updatedItem,
       });
    } catch (error) {
      console.error("Error updating item:", error);
      alert("Failed to update item.");
    }
  };




  const handleCreate = async (newMaterial) => {
    try {
      const storage = getStorage(); // Initialize Firebase Storage
      let imageUrl = "";

      if (newMaterial.IMAGE) {
        const imageRef = ref(storage, `materials/${newMaterial.IMAGE.name}`);
        await uploadBytes(imageRef, newMaterial.IMAGE);
        imageUrl = await getDownloadURL(imageRef);
      }

      // Include IMAGE_URL in Firestore data
      const materialWithImage = {
        ...newMaterial,
        IMAGE_URL: imageUrl,
      };

      const inventoryCollection = collection(db, "Inventory");
      const docRef = await addDoc(inventoryCollection, materialWithImage);

      setMaterials([...materials, { id: docRef.id, ...materialWithImage }]);
      setIsModalOpen(false);

      // ✅ Show success modal
      setSuccessMessage("Item successfully added to Inventory!");
      setSuccessModalOpen(true);
     
     await addDoc(collection(db, "Logs"), {
         user: user?.User || "unknown",
         action: `Created new material code=${newMaterial.CODE}`,
         timestamp: serverTimestamp(),
         details: {
           productName: newMaterial.PRODUCTNAME,
           brand: newMaterial.BRAND,
         },
       });
    } catch (error) {
      console.error("Error adding item:", error);
      alert("Error adding item to Firestore.");
    }
  };



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
          <Typography
            variant="h4"
            sx={{
              mb: 2,
              fontWeight: "bold",
              color: "#96720b",
              fontFamily: "Arial, sans-serif",
            }}
          >
            Inventory Items
          </Typography>

          <TextField
            label="Search Item..."
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
            sx={{ mb: 2, backgroundColor: "white" }}
          />

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsModalOpen(true)}
            sx={{
              backgroundColor: "#3f5930",
              "&:hover": { backgroundColor: "##96720b" },
              mb: 2,
            }}
          >
            Create New Item
          </Button>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
  <Typography variant="h6">
    Total Items: <strong>{totalItems}</strong>
  </Typography>

  <Box sx={{ display: "flex", gap: 2 }}>
    <Button variant="contained" color="primary" onClick={() => filterByBrand("BLM")}>
      BilMagic ({brandCounts.BLM})
    </Button>
    <Button variant="contained" color="secondary" onClick={() => filterByBrand("KL")}>
      Konllen ({brandCounts.KL})
    </Button>
    <Button variant="contained" color="success" onClick={() => filterByBrand("PERI")}>
      Peri ({brandCounts.PERI})
    </Button>
    <Button variant="outlined" onClick={resetFilter}>
      Reset Filter
    </Button>
  </Box>
</Box>



          <TableContainer component={Paper} sx={{ maxHeight: 900 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#3f5930" }}>
                  {[
                    "IMAGE",
                    "CODE",
                    "CATEGORY",
                    "BRAND",
                    "PRODUCTNAME",
                    "TIPSIZE",
                    "PRICE",
                    "OPENINGSTOCK",
                    "INDELIVERY",
                    "OUTSALE",
                    "ENDINGSTOCK",
                    "STATUS",
                  ].map((key) => (
                    <TableCell
                      key={key}
                      sx={{
                        backgroundColor: "#3f5930",
                        color: "white",
                        fontWeight: "bold",
                        fontSize: "15px",
                      }}
                    >
                      {key}
                    </TableCell>
                  ))}
                  <TableCell
                    sx={{
                      backgroundColor: "#3f5930",
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "15px",
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {materials
                  .filter((item) => {
                    if (!brandFilter) return true; // Show all if no filter
                    return item.CODE.startsWith(brandFilter);
                  })
                  .slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage) // Paginate results
                  .map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {item.IMAGE_URL ? (
                          <img
                            src={item.IMAGE_URL}
                            alt={item.PRODUCTNAME}
                            style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "5px" }}
                          />
                        ) : (
                          "No Image"
                        )}
                      </TableCell>

                      <TableCell>
                        {editingItem === item.id ? (
                          <TextField name="CODE" value={updatedItem.CODE} onChange={handleInputChange} />
                        ) : (
                          item.CODE
                        )}
                      </TableCell>
                      <TableCell>
                        {editingItem === item.id ? (
                          <TextField name="CATEGORY" value={updatedItem.CATEGORY} onChange={handleInputChange} />
                        ) : (
                          item.CATEGORY
                        )}
                      </TableCell>
                      <TableCell>
                        {editingItem === item.id ? (
                          <TextField name="BRAND" value={updatedItem.BRAND} onChange={handleInputChange} />
                        ) : (
                          item.BRAND
                        )}
                      </TableCell>
                      <TableCell>
                        {editingItem === item.id ? (
                          <TextField name="PRODUCTNAME" value={updatedItem.PRODUCTNAME} onChange={handleInputChange} />
                        ) : (
                          item.PRODUCTNAME
                        )}
                      </TableCell>
                      <TableCell>
                        {editingItem === item.id ? (
                          <TextField name="TIPSIZE" value={updatedItem.TIPSIZE} onChange={handleInputChange} />
                        ) : (
                          item.TIPSIZE
                        )}
                      </TableCell>
                      <TableCell>
                        {editingItem === item.id ? (
                          <TextField name="PRICE" value={updatedItem.PRICE} onChange={handleInputChange} />
                        ) : (
                          `₱${new Intl.NumberFormat('en-PH', { style: 'decimal', minimumFractionDigits: 2 }).format(item.PRICE)}`
                        )}
                      </TableCell>
                      <TableCell>
                        {editingItem === item.id ? (
                          <TextField name="OPENINGSTOCK" value={updatedItem.OPENINGSTOCK} onChange={handleInputChange} />
                        ) : (
                          item.OPENINGSTOCK
                        )}
                      </TableCell>
                      <TableCell>
                        {editingItem === item.id ? (
                          <TextField name="INDELIVERY" value={updatedItem.INDELIVERY} onChange={handleInputChange} />
                        ) : (
                          item.INDELIVERY
                        )}
                      </TableCell>
                      <TableCell>
                        {editingItem === item.id ? (
                          <TextField name="OUTSALE" value={updatedItem.OUTSALE} onChange={handleInputChange} />
                        ) : (
                          item.OUTSALE
                        )}
                      </TableCell>
                      <TableCell>
                        {editingItem === item.id ? (
                          <TextField name="ENDINGSTOCK" value={updatedItem.ENDINGSTOCK} onChange={handleInputChange} />
                        ) : (
                          item.ENDINGSTOCK
                        )}
                      </TableCell>
                      <TableCell
                        sx={{
                          backgroundColor:
                            editingItem === item.id
                              ? updatedItem.STATUS === "RESTOCK"
                                ? "red"
                                : "green"
                              : item.STATUS === "RESTOCK"
                                ? "red"
                                : "green",
                          color: "white",
                          fontWeight: "bold",
                          textAlign: "center",
                          borderRadius: "5px",
                          padding: "5px",
                        }}
                      >
                        {editingItem === item.id ? (
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <TextField
                              select
                              name="STATUS"
                              value={updatedItem.STATUS}
                              onChange={handleInputChange}
                              variant="outlined"
                              fullWidth
                              sx={{
                                backgroundColor: "white",
                                borderRadius: "5px",
                                "& .MuiOutlinedInput-root": {
                                  "& fieldset": { borderColor: "white" },
                                  "&:hover fieldset": { borderColor: "gray" },
                                  "&.Mui-focused fieldset": { borderColor: "gray" },
                                },
                              }}
                            >
                              <MenuItem value="OK" sx={{ backgroundColor: "green", color: "white" }}>
                                ✅ OK
                              </MenuItem>
                              <MenuItem value="RESTOCK" sx={{ backgroundColor: "red", color: "white" }}>
                                🚨 RESTOCK
                              </MenuItem>
                            </TextField>
                          </Box>
                        ) : (
                          item.STATUS
                        )}
                      </TableCell>



                      <TableCell>
                        {editingItem === item.id ? (
                          <>
                            <Button variant="contained" color="primary" onClick={saveEdit}>
                              Save
                            </Button>
                            <Button variant="contained" color="secondary" onClick={() => setEditingItem(null)}>
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button variant="outlined" onClick={() => handleEdit(item)}>
                              Edit
                            </Button>
                            <Button variant="contained" color="error" onClick={() => handleDeleteConfirm(item)}>
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
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 2 }}>
  <Button
    variant="contained"
    color="secondary"
    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
    disabled={currentPage === 0}
    sx={{ mr: 2 }}
  >
    Previous
  </Button>

  <Typography variant="body1">
    Page {currentPage + 1} of {Math.ceil(materials.length / itemsPerPage)}
  </Typography>

  <Button
    variant="contained"
    color="primary"
    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(materials.length / itemsPerPage) - 1))}
    disabled={(currentPage + 1) * itemsPerPage >= materials.length}
    sx={{ ml: 2 }}
  >
    Next
  </Button>
</Box>


          <ConfirmDeleteMaterialModal
            isOpen={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            onConfirm={handleDelete}
            materialDescription={itemToDelete ? itemToDelete.PRODUCTNAME : ""}
          />

          <SuccessModal
            open={successModalOpen}
            onClose={() => setSuccessModalOpen(false)}
            message={successMessage}
          />


          <CreateMaterialModal
            show={isModalOpen}
            handleClose={() => setIsModalOpen(false)}
            handleSave={handleCreate}
          />
        </Box>
      </Box>
    </>
  );
};

export default Materials;
