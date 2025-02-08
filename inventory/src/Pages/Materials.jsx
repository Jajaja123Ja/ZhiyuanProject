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
  Chip,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import { useAuthContext } from "../hooks/useAuthContext";
import Navbar from "../Components/Navbar";
import ConfirmDeleteMaterialModal from "../Components/ConfirmDeleteMaterialModal";
import CreateMaterialModal from "../Components/CreateMaterialModal";
import Sidebar from "../Components/Sidebar";
import { db, collection, addDoc, getDocs, deleteDoc, doc } from "../firebase"; // Firestore methods

const Materials = () => {
  const [materials, setMaterials] = useState([]);
  const [isEditing, setIsEditing] = useState(null);
  const [editedMaterial, setEditedMaterial] = useState({});
  const { user } = useAuthContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedManufacturer, setSelectedManufacturer] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState(null);

  // Sidebar hover state
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const fetchMaterials = async () => {
      setLoading(true);
      try {
        const inventoryCollection = collection(db, "Inventory");
        const snapshot = await getDocs(inventoryCollection);
        const realData = snapshot.docs.map((doc) => ({
          id: doc.id, // Firestore document ID
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
        }));
  
        setMaterials(realData);
      } catch (error) {
        console.error("Error fetching materials:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchMaterials();
  }, []);

  const handleCreate = async (newMaterial) => {
    try {
      const inventoryCollection = collection(db, "Inventory"); // Reference Firestore collection
  
      // Ensure all fields match the Firestore schema
      const newItem = {
        CODE: newMaterial.CODE, // User-provided CODE
        CATEGORY: newMaterial.CATEGORY || "",
        BRAND: newMaterial.BRAND || "",
        PRODUCTNAME: newMaterial.PRODUCTNAME || "",
        TIPSIZE: newMaterial.TIPSIZE || "",
        PRICE: newMaterial.PRICE || "",
        OPENINGSTOCK: newMaterial.OPENINGSTOCK || 0,
        INDELIVERY: newMaterial.INDELIVERY || 0,
        OUTSALE: newMaterial.OUTSALE || 0,
        ENDINGSTOCK: newMaterial.ENDINGSTOCK || 0,
        STATUS: newMaterial.STATUS || "OK",
      };
  
      // Save to Firestore
      const docRef = await addDoc(inventoryCollection, newItem);
      const savedItem = { id: docRef.id, ...newItem }; // Include Firestore ID
  
      // Update the UI with new item
      setMaterials([...materials, savedItem]);
      setIsModalOpen(false);
      alert("Item successfully added to Firestore!");
  
    } catch (error) {
      console.error("Error adding item: ", error);
      alert("Error adding item to Firestore.");
    }
  };
  
  

  const filterMaterials = () => {
    let filtered = materials;
    if (selectedManufacturer !== "All") {
      filtered = filtered.filter(
        (material) => material.MANUFACTURER === selectedManufacturer
      );
    }
    if (searchTerm) {
      filtered = filtered.filter(
        (material) =>
          material.PRODUCTNAME &&
          material.PRODUCTNAME.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this item?");
    if (!confirmDelete) return;
  
    try {
      await deleteDoc(doc(db, "Inventory", id)); // Delete from Firestore
      setMaterials(materials.filter((material) => material.id !== id));
      alert("Item successfully deleted.");
    } catch (error) {
      console.error("Error deleting item: ", error);
      alert("Error deleting item.");
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
              backgroundColor: "#96720b",
              "&:hover": { backgroundColor: "##96720b" },
              mb: 2,
            }}
          >
            Create New Item
          </Button>

          <TableContainer component={Paper} sx={{ maxHeight: 900 }}>
            <Table stickyHeader>
            <TableHead>
  <TableRow sx={{ backgroundColor: "#3f5930" }}>
    {[
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
                {filterMaterials().map((material) => (
                  <TableRow key={material.id}>
                    {Object.keys(material).map((key) => (
                      <TableCell key={key}>
                        {key === "STATUS" ? (
                          <Chip
                            label={material.STATUS}
                            sx={{
                              backgroundColor:
                                material.STATUS === "RESTOCK"
                                  ? "red"
                                  : "green",
                              color: "white",
                              fontWeight: "bold",
                              padding: "5px",
                            }}
                          />
                        ) : (
                          material[key]
                        )}
                      </TableCell>
                    ))}
                    <TableCell>
                      <Button
                        variant="outlined"
                        sx={{ mr: 1 }}
                        onClick={() => setIsEditing(material.id)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleDelete(material.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <CreateMaterialModal
  show={isModalOpen}
  handleClose={() => setIsModalOpen(false)}
  handleSave={handleCreate} // Pass handleCreate function
/>
        </Box>
      </Box>
    </>
  );
};

export default Materials;
