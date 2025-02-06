import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Box,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import { useAuthContext } from "../hooks/useAuthContext";
import Navbar from "../Components/Navbar";
import ConfirmDeleteMaterialModal from "../Components/ConfirmDeleteMaterialModal";
import CreateMaterialModal from "../Components/CreateMaterialModal";
import Sidebar from "../Components/Sidebar"; 

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
        const fakeData = [
          { CODE: 1, MANUFACTURER: 'BILMAGIC', CATEGORY: 'PLAYING CUE', BRAND: 'S-DIAMOND', PRODUCTNAME: 'S-DIAMOND RED', TIPSIZE: '12.5 MM', PRICE: 'P1,100', OPENINGSTOCK: 0, INDEV: 0, INRTS: 0, INYUANR: 0, OS: 0, YUANDMG: 0, FREEBIES: 0, ES: 0, STATUS: 'RESTOCK' },
          { CODE: 12, MANUFACTURER: 'PERI', CATEGORY: 'PLAYING CUE', BRAND: '', PRODUCTNAME: 'S-DIAMOND WHITE', TIPSIZE: '12.5 MM', PRICE: 'P1,100', OPENINGSTOCK: 1, INDEV: 0, INRTS: 0, INYUANR: 0, OS: 0, YUANDMG: 0, FREEBIES: 0, ES: 1, STATUS: 'RESTOCK' },
          { CODE: 13, MANUFACTURER: 'PREDATOR', CATEGORY: 'PLAYING CUE', BRAND: '', PRODUCTNAME: 'S-DIAMOND BLUE', TIPSIZE: '12.5 MM', PRICE: 'P1,100', OPENINGSTOCK: 1, INDEV: 0, INRTS: 0, INYUANR: 0, OS: 0, YUANDMG: 0, FREEBIES: 0, ES: 1, STATUS: 'OK' },
          { CODE: 14, MANUFACTURER: 'BILMAGIC', CATEGORY: 'PLAYING CUE', BRAND: '', PRODUCTNAME: 'S-DIAMOND GREEN', TIPSIZE: '12.5 MM', PRICE: 'P1,100', OPENINGSTOCK: 4, INDEV: 0, INRTS: 0, INYUANR: 0, OS: 0, YUANDMG: 0, FREEBIES: 0, ES: 4, STATUS: 'RESTOCK' },
          { CODE: 15, MANUFACTURER: 'BILMAGIC', CATEGORY: 'PLAYING CUE', BRAND: 'SCORPION', PRODUCTNAME: 'SC01-RED WINE', TIPSIZE: '11.5 MM', PRICE: 'P1,300', OPENINGSTOCK: 0, INDEV: 0, INRTS: 0, INYUANR: 0, OS: 0, YUANDMG: 0, FREEBIES: 0, ES: 0, STATUS: 'OK' },
          { CODE: 16, MANUFACTURER: 'PREDATOR', CATEGORY: 'PLAYING CUE', BRAND: '', PRODUCTNAME: 'SC01-RED WINE', TIPSIZE: '12.5 MM', PRICE: 'P1,300', OPENINGSTOCK: 0, INDEV: 0, INRTS: 0, INYUANR: 0, OS: 0, YUANDMG: 0, FREEBIES: 0, ES: 0, STATUS: 'RESTOCK' },
          { CODE: 17, MANUFACTURER: 'PERI', CATEGORY: 'PLAYING CUE', BRAND: '', PRODUCTNAME: 'SC02-TOASTED PEACAN', TIPSIZE: '11.5 MM', PRICE: 'P1,300', OPENINGSTOCK: 0, INDEV: 0, INRTS: 0, INYUANR: 0, OS: 0, YUANDMG: 0, FREEBIES: 0, ES: 0, STATUS: 'OK' },
          { CODE: 18, MANUFACTURER: 'PREDATOR', CATEGORY: 'PLAYING CUE', BRAND: '', PRODUCTNAME: 'SC02-TOASTED PEACAN', TIPSIZE: '12.5 MM', PRICE: 'P1,300', OPENINGSTOCK: 0, INDEV: 0, INRTS: 0, INYUANR: 0, OS: 0, YUANDMG: 0, FREEBIES: 0, ES: 0, STATUS: 'RESTOCK' },
          { CODE: 19, MANUFACTURER: 'BILMAGIC', CATEGORY: 'PLAYING CUE', BRAND: 'S-DIAMOND', PRODUCTNAME: 'S-DIAMOND RED', TIPSIZE: '12.5 MM', PRICE: 'P1,100', OPENINGSTOCK: 0, INDEV: 0, INRTS: 0, INYUANR: 0, OS: 0, YUANDMG: 0, FREEBIES: 0, ES: 0, STATUS: 'OK' },
          { CODE: 20, MANUFACTURER: 'PERI', CATEGORY: 'PLAYING CUE', BRAND: '', PRODUCTNAME: 'S-DIAMOND WHITE', TIPSIZE: '12.5 MM', PRICE: 'P1,100', OPENINGSTOCK: 1, INDEV: 0, INRTS: 0, INYUANR: 0, OS: 0, YUANDMG: 0, FREEBIES: 0, ES: 1, STATUS: 'RESTOCK' },
          { CODE: 21, MANUFACTURER: 'PERI', CATEGORY: 'PLAYING CUE', BRAND: '', PRODUCTNAME: 'S-DIAMOND BLUE', TIPSIZE: '12.5 MM', PRICE: 'P1,100', OPENINGSTOCK: 1, INDEV: 0, INRTS: 0, INYUANR: 0, OS: 0, YUANDMG: 0, FREEBIES: 0, ES: 1, STATUS: 'RESTOCK' },
          { CODE: 22, MANUFACTURER: 'PREDATOR', CATEGORY: 'PLAYING CUE', BRAND: '', PRODUCTNAME: 'S-DIAMOND GREEN', TIPSIZE: '12.5 MM', PRICE: 'P1,100', OPENINGSTOCK: 4, INDEV: 0, INRTS: 0, INYUANR: 0, OS: 0, YUANDMG: 0, FREEBIES: 0, ES: 4, STATUS: 'RESTOCK' },
          { CODE: 23, MANUFACTURER: 'BILMAGIC', CATEGORY: 'PLAYING CUE', BRAND: 'SCORPION', PRODUCTNAME: 'SC01-RED WINE', TIPSIZE: '11.5 MM', PRICE: 'P1,300', OPENINGSTOCK: 0, INDEV: 0, INRTS: 0, INYUANR: 0, OS: 0, YUANDMG: 0, FREEBIES: 0, ES: 0, STATUS: 'OK' },
          { CODE: 24, MANUFACTURER: 'BILMAGIC', CATEGORY: 'PLAYING CUE', BRAND: '', PRODUCTNAME: 'SC01-RED WINE', TIPSIZE: '12.5 MM', PRICE: 'P1,300', OPENINGSTOCK: 0, INDEV: 0, INRTS: 0, INYUANR: 0, OS: 0, YUANDMG: 0, FREEBIES: 0, ES: 0, STATUS: 'RESTOCK' },
          { CODE: 25, MANUFACTURER: 'PREDATOR', CATEGORY: 'PLAYING CUE', BRAND: '', PRODUCTNAME: 'SC02-TOASTED PEACAN', TIPSIZE: '11.5 MM', PRICE: 'P1,300', OPENINGSTOCK: 0, INDEV: 0, INRTS: 0, INYUANR: 0, OS: 0, YUANDMG: 0, FREEBIES: 0, ES: 0, STATUS: 'OK' },
          { CODE: 26, MANUFACTURER: 'BILMAGIC', CATEGORY: 'PLAYING CUE', BRAND: '', PRODUCTNAME: 'SC02-TOASTED PEACAN', TIPSIZE: '12.5 MM', PRICE: 'P1,300', OPENINGSTOCK: 0, INDEV: 0, INRTS: 0, INYUANR: 0, OS: 0, YUANDMG: 0, FREEBIES: 0, ES: 0, STATUS: 'RESTOCK' },
          { CODE: 27, MANUFACTURER: 'PERI', CATEGORY: 'PLAYING CUE', BRAND: 'S-DIAMOND', PRODUCTNAME: 'S-DIAMOND RED', TIPSIZE: '12.5 MM', PRICE: 'P1,100', OPENINGSTOCK: 0, INDEV: 0, INRTS: 0, INYUANR: 0, OS: 0, YUANDMG: 0, FREEBIES: 0, ES: 0, STATUS: 'RESTOCK' },
          { CODE: 28, MANUFACTURER: 'BILMAGIC', CATEGORY: 'PLAYING CUE', BRAND: '', PRODUCTNAME: 'S-DIAMOND WHITE', TIPSIZE: '12.5 MM', PRICE: 'P1,100', OPENINGSTOCK: 1, INDEV: 0, INRTS: 0, INYUANR: 0, OS: 0, YUANDMG: 0, FREEBIES: 0, ES: 1, STATUS: 'RESTOCK' },
          { CODE: 29, MANUFACTURER: 'PREDATOR', CATEGORY: 'PLAYING CUE', BRAND: '', PRODUCTNAME: 'S-DIAMOND BLUE', TIPSIZE: '12.5 MM', PRICE: 'P1,100', OPENINGSTOCK: 1, INDEV: 0, INRTS: 0, INYUANR: 0, OS: 0, YUANDMG: 0, FREEBIES: 0, ES: 1, STATUS: 'RESTOCK' },
          { CODE: 30, MANUFACTURER: 'BILMAGIC', CATEGORY: 'PLAYING CUE', BRAND: '', PRODUCTNAME: 'S-DIAMOND GREEN', TIPSIZE: '12.5 MM', PRICE: 'P1,100', OPENINGSTOCK: 4, INDEV: 0, INRTS: 0, INYUANR: 0, OS: 0, YUANDMG: 0, FREEBIES: 0, ES: 4, STATUS: 'RESTOCK' },
          { CODE: 31, MANUFACTURER: 'PERI', CATEGORY: 'PLAYING CUE', BRAND: 'SCORPION', PRODUCTNAME: 'SC01-RED WINE', TIPSIZE: '11.5 MM', PRICE: 'P1,300', OPENINGSTOCK: 0, INDEV: 0, INRTS: 0, INYUANR: 0, OS: 0, YUANDMG: 0, FREEBIES: 0, ES: 0, STATUS: 'RESTOCK' },
          { CODE: 32, MANUFACTURER: 'BILMAGIC', CATEGORY: 'PLAYING CUE', BRAND: '', PRODUCTNAME: 'SC01-RED WINE', TIPSIZE: '12.5 MM', PRICE: 'P1,300', OPENINGSTOCK: 0, INDEV: 0, INRTS: 0, INYUANR: 0, OS: 0, YUANDMG: 0, FREEBIES: 0, ES: 0, STATUS: 'RESTOCK' },
          { CODE: 33, MANUFACTURER: 'PERI', CATEGORY: 'PLAYING CUE', BRAND: '', PRODUCTNAME: 'SC02-TOASTED PEACAN', TIPSIZE: '11.5 MM', PRICE: 'P1,300', OPENINGSTOCK: 0, INDEV: 0, INRTS: 0, INYUANR: 0, OS: 0, YUANDMG: 0, FREEBIES: 0, ES: 0, STATUS: 'RESTOCK' },
          { CODE: 34, MANUFACTURER: 'PERI', CATEGORY: 'PLAYING CUE', BRAND: '', PRODUCTNAME: 'SC02-TOASTED PEACAN', TIPSIZE: '12.5 MM', PRICE: 'P1,300', OPENINGSTOCK: 0, INDEV: 0, INRTS: 0, INYUANR: 0, OS: 0, YUANDMG: 0, FREEBIES: 0, ES: 0, STATUS: 'RESTOCK' },

        ];
        setMaterials(fakeData);
      } catch (error) {
        console.error('Error fetching materials:', error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  const filterMaterials = () => {
    let filtered = materials;
    if (selectedManufacturer !== "All") {
      filtered = filtered.filter(material => material.MANUFACTURER === selectedManufacturer);
    }
    if (searchTerm) {
      filtered = filtered.filter(
        material => material.PRODUCTNAME && material.PRODUCTNAME.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  };

  const handleEdit = (material) => {
    setIsEditing(material.CODE);
    setEditedMaterial({ ...material });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedMaterial({ ...editedMaterial, [name]: value });
  };

  const handleSave = (code) => {
    setMaterials((prevMaterials) =>
      prevMaterials.map((material) =>
        material.CODE === code ? { ...material, ...editedMaterial } : material
      )
    );
    setIsEditing(null);
  };

  const handleDelete = (code) => {
    setMaterials((prevMaterials) => prevMaterials.filter((material) => material.CODE !== code));
    setIsConfirmDeleteOpen(false);
  };

  const openDeleteModal = (material) => {
    setMaterialToDelete(material);
    setIsConfirmDeleteOpen(true);
  };

  const handleCreate = (newMaterial) => {
    const newItem = {
      CODE: materials.length + 1,
      MANUFACTURER: selectedManufacturer !== "All" ? selectedManufacturer : "UNKNOWN",
      ...newMaterial
    };
    setMaterials([...materials, newItem]);
  };

  return (
    <>
      <Navbar isHovered={isHovered} />
      <Box sx={{ display: 'flex', marginTop: "64px" }}> 
        <Sidebar isHovered={isHovered} setIsHovered={setIsHovered} />

        <Box sx={{
          flexGrow: 1,
          padding: 3,
          marginLeft: isHovered ? "10px" : "10px",
          transition: "margin-left 0.3s ease-in-out",
          width: `calc(100% - ${isHovered ? "10px" : "10px"})`,
        }}>
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold', color: "#96720b", fontFamily: "Arial, sans-serif" }}>
            Inventory Items
          </Typography>
          <TextField
            label="Search Item..."
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
            sx={{ mb: 2, backgroundColor: 'white' }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsModalOpen(true)}
            sx={{ backgroundColor: "#96720b", "&:hover": { backgroundColor: "#96720b" }, mb: 2 }}
          >
            Create New Item
          </Button>
          <TableContainer component={Paper} sx={{ maxHeight: 900 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#3f5930" }}>
                  {Object.keys(materials[0] || {}).map((key) => (
                    <TableCell key={key} sx={{ backgroundColor: "#3f5930", color: "white", fontWeight: "bold", fontSize: "15px" }}>
                      {key}
                    </TableCell>
                  ))}
                  <TableCell sx={{ backgroundColor: "#3f5930", color: "white", fontWeight: "bold", fontSize: "15px" }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filterMaterials().map((material) => (
                  <TableRow key={material.CODE}>
                    {Object.keys(material).map((key) => (
                       <TableCell 
                       key={key} 
                       sx={{
                         fontSize: "14px", 
                         fontFamily: "Arial, sans-serif",
                         backgroundColor: key === "STATUS" ? (material.STATUS === "RESTOCK" ? "#ffcccc" : "#ccffcc") : "inherit",
                         color: key === "STATUS" ? "black" : "inherit",
                         fontWeight: key === "STATUS" ? "bold" : "normal"
                       }}
                     >
                        {isEditing === material.CODE ? (
                          key === "STATUS" ? (
                            <FormControl fullWidth>
                              <InputLabel>Status</InputLabel>
                              <Select
                                name="STATUS"
                                value={editedMaterial.STATUS || ''}
                                onChange={handleEditChange}
                              >
                                <MenuItem value="OK">OK</MenuItem>
                                <MenuItem value="RESTOCK">RESTOCK</MenuItem>
                              </Select>
                            </FormControl>
                          ) : (
                            <TextField
                              name={key}
                              value={editedMaterial[key] || ''}
                              onChange={handleEditChange}
                              fullWidth
                            />
                          )
                        ) : (
                          material[key]
                        )}
                      </TableCell>
                    ))}
                    <TableCell>
                      {isEditing === material.CODE ? (
                        <Button onClick={() => handleSave(material.CODE)} variant="contained" color="primary">
                          Save
                        </Button>
                      ) : (
                        <>
                          <Button onClick={() => handleEdit(material)} variant="outlined" sx={{ mr: 1 }}>
                            Edit
                          </Button>
                          <Button onClick={() => openDeleteModal(material)} variant="contained" color="error">
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

          <ConfirmDeleteMaterialModal
            isOpen={isConfirmDeleteOpen}
            onClose={() => setIsConfirmDeleteOpen(false)}
            onConfirm={() => materialToDelete && handleDelete(materialToDelete.CODE)}
            materialDescription={materialToDelete?.PRODUCTNAME}
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
