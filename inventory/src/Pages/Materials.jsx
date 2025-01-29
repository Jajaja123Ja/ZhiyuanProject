import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Button,
  TextField,
  CircularProgress,
  Modal,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  InputLabel,
  FormControl
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useAuthContext } from "../hooks/useAuthContext";
import Navbar from "../Components/Navbar";
import ConfirmDeleteMaterialModal from "../Components/ConfirmDeleteMaterialModal";

const validUnits = [
  'lot', 'cu.m', 'bags', 'pcs', 'shts', 'kgs', 'gal', 'liters',
  'set', 'm', 'L-m', 'sheets', 'pieces', 'meters', 'bar', 'tin', 'tubes','boxes'
];

const Materials = () => {
  const [materials, setMaterials] = useState([]);
  const [isEditing, setIsEditing] = useState(null);
  const [editedMaterial, setEditedMaterial] = useState({ description: '', unit: '', cost: 0 });
  const { user } = useAuthContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [newMaterial, setNewMaterial] = useState({ description: '', unit: validUnits[0], cost: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true); 
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState(null);

  useEffect(() => {
    // You can set a mock user here if it's unavailable
    const fakeUser = { token: "fakeToken123" };
    if (!fakeUser || !fakeUser.token) return;
  
    const fetchMaterials = async () => {
      setLoading(true);
      try {
        // Fake data for testing
        const fakeData = [
            { CODE: 'BLMGC-SD-0001', CATEGORY: 'PLAYING CUE', BRAND: 'S-DIAMOND', PRODUCTNAME: 'S-DIAMOND RED', TIPSIZE: '12.5 MM', PRICE: 'P1,100', OPENINGSTOCK: 0, INDEV: 0, INRTS: 0, INYUANR: 0, OS: 0, YUANDMG: 0, FREEBIES: 0, ES: 0, STATUS: 'RESTOCK' },
            { CODE: 'BLMGC-SD-0002', CATEGORY: 'PLAYING CUE', BRAND: '', PRODUCTNAME: 'S-DIAMOND WHITE', TIPSIZE: '12.5 MM', PRICE: 'P1,100', OPENINGSTOCK: 1, INDEV: 0, INRTS: 0, INYUANR: 0, OS: 0, YUANDMG: 0, FREEBIES: 0, ES: 1, STATUS: 'RESTOCK' },
            { CODE: 'BLMGC-SD-0003', CATEGORY: 'PLAYING CUE', BRAND: '', PRODUCTNAME: 'S-DIAMOND BLUE', TIPSIZE: '12.5 MM', PRICE: 'P1,100', OPENINGSTOCK: 1, INDEV: 0, INRTS: 0, INYUANR: 0, OS: 0, YUANDMG: 0, FREEBIES: 0, ES: 1, STATUS: 'RESTOCK' },
            { CODE: 'BLMGC-SD-0004', CATEGORY: 'PLAYING CUE', BRAND: '', PRODUCTNAME: 'S-DIAMOND GREEN', TIPSIZE: '12.5 MM', PRICE: 'P1,100', OPENINGSTOCK: 4, INDEV: 0, INRTS: 0, INYUANR: 0, OS: 0,YUANDMG: 0, FREEBIES: 0, ES: 4, STATUS: 'RESTOCK' },
            { CODE: 'BLMGC-SC0R-0001', CATEGORY: 'PLAYING CUE', BRAND: 'SCORPION', PRODUCTNAME: 'SC01-RED WINE', TIPSIZE: '11.5 MM', PRICE: 'P1,300', OPENINGSTOCK: 0, INDEV: 0, INRTS: 0, INYUANR: 0, OS: 0, YUANDMG: 0, FREEBIES: 0, ES: 0, STATUS: 'RESTOCK' },
            { CODE: 'BLMGC-SC0R-0002', CATEGORY: 'PLAYING CUE', BRAND: '', PRODUCTNAME: 'SC01-RED WINE', TIPSIZE: '12.5 MM', PRICE: 'P1,300', OPENINGSTOCK: 0, INDEV: 0, INRTS: 0, INYUANR: 0, OS: 0, YUANDMG: 0, FREEBIES: 0, ES: 0, STATUS: 'RESTOCK' },
            { CODE: 'BLMGC-SC0R-0003', CATEGORY: 'PLAYING CUE', BRAND: '', PRODUCTNAME: 'SC02-TOASTED PEACAN', TIPSIZE: '11.5 MM', PRICE: 'P1,300', OPENINGSTOCK: 0, INDEV: 0, INRTS: 0, INYUANR: 0,OS: 0, YUANDMG: 0, FREEBIES: 0, ES: 0, STATUS: 'RESTOCK' },
            { CODE: 'BLMGC-SC0R-0004', CATEGORY: 'PLAYING CUE', BRAND: '', PRODUCTNAME: 'SC02-TOASTED PEACAN', TIPSIZE: '12.5 MM', PRICE: 'P1,300', OPENINGSTOCK: 0, INDEV: 0, INRTS: 0, INYUANR: 0, OS: 0,YUANDMG: 0, FREEBIES: 0,ES: 0, STATUS: 'RESTOCK' },
            // Continue adding all your data similarly
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
  
  

  const handleEdit = (material) => {
    setIsEditing(material._id);
    setEditedMaterial({
      description: material.description,
      unit: material.unit,
      cost: material.cost === 0 ? "" : material.cost 
    });
  };

  const handleSave = async (id) => {
    try {
      const updatedMaterial = {
        ...editedMaterial,
        cost: editedMaterial.cost === "" ? 0 : editedMaterial.cost // Convert empty cost to 0 before saving
      };
      await axios.patch(`https://foxconstruction-final.onrender.com/api/materials/${id}`, updatedMaterial, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
  
      setMaterials((prevMaterials) =>
        prevMaterials.map((material) =>
          material._id === id ? { ...material, ...updatedMaterial } : material
        )
      );
      setIsEditing(null);
    } catch (error) {
      console.error('Error updating material:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://foxconstruction-final.onrender.com/api/materials/${id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      setMaterials((prevMaterials) => prevMaterials.filter((material) => material._id !== id));
      setIsConfirmDeleteOpen(false); 
    } catch (error) {
      console.error('Error deleting material:', error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filterMaterials = () => {
    if (!searchTerm) return materials;

    return materials.filter(
      (material) =>
        material.description &&
        material.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleCreate = async () => {
    try {
      if (!newMaterial.description || !newMaterial.unit || newMaterial.cost < 0) {
        console.error('All fields are required and cost cannot be negative.');
        return;
      }
  
      const response = await axios.post(`https://foxconstruction-final.onrender.com/api/materials`, newMaterial, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
  
      setMaterials((prevMaterials) => [...prevMaterials, response.data]);
      setNewMaterial({ description: '', unit: validUnits[0], cost: 0 }); 
      setIsModalOpen(false); 
    } catch (error) {
      console.error('Error creating material:', error.response?.data || error.message);
    }
  };

  const filteredMaterials = filterMaterials();

  const openConfirmDeleteModal = (material) => {
    setMaterialToDelete(material);
    setIsConfirmDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (materialToDelete) {
      handleDelete(materialToDelete._id);
    }
  };

  return (
    <>
      <Navbar />
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
          Item
        </Typography>
        <TextField
          label="Search Item..."
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <Typography variant="body1" sx={{ mb: 2 }}>
          Total Item: {filteredMaterials.length}
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsModalOpen(true)}
          sx={{ backgroundColor: "#96720b", "&:hover": { backgroundColor: "#96720b" }, mb: 2 }}
        >
          Create New item
        </Button>

        {loading ? (
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <CircularProgress />
            <Typography variant="body1" sx={{ mt: 2 }}>
              Loading Item...
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
            <Table stickyHeader>
  <TableHead>
    <TableRow>
      <TableCell><strong>CODE</strong></TableCell>
      <TableCell><strong>CATEGORY</strong></TableCell>
      <TableCell><strong>BRAND</strong></TableCell>
      <TableCell><strong>PRODUCT NAME</strong></TableCell>
      <TableCell><strong>TIP SIZE</strong></TableCell>
      <TableCell><strong>PRICE</strong></TableCell>
      <TableCell><strong>OPENING STOCK</strong></TableCell>
      <TableCell><strong>IN (DELIVERY)</strong></TableCell>
      <TableCell><strong>IN (RTS)</strong></TableCell>
      <TableCell><strong>IN (YUAN REPAIRED)</strong></TableCell>
      <TableCell><strong>OUT (SALE)</strong></TableCell>
      <TableCell><strong>OUT (YUAN/DAMAGED)</strong></TableCell>
      <TableCell><strong>OUT (FREEBIE/S)</strong></TableCell>
      <TableCell><strong>ENDING STOCK</strong></TableCell>
      <TableCell><strong>STATUS</strong></TableCell>
      <TableCell><strong>Actions</strong></TableCell>
    </TableRow>
  </TableHead>
  <TableBody>
    {filteredMaterials.map((material) => (
      <TableRow key={material._id}>
        <TableCell>{material.CODE}</TableCell> {/* Assuming "code" is a field in material */}
        <TableCell>{material.CATEGORY}</TableCell> {/* Assuming "category" is a field in material */}
        <TableCell>{material.BRAND}</TableCell> {/* Assuming "brand" is a field in material */}
        <TableCell>{material.PRODUCTNAME}</TableCell> {/* Assuming "brand" is a field in material */}
        <TableCell>{material.TIPSIZE}</TableCell> {/* Assuming "tipSize" is a field in material */}
        <TableCell>{material.PRICE}</TableCell> {/* Assuming "tipSize" is a field in material */}
        <TableCell>{material.OPENINGSTOCK}</TableCell> {/* Assuming "openingStock" is a field */}
        <TableCell>{material.INDEV}</TableCell> {/* Assuming "inDelivery" is a field */}
        <TableCell>{material.INRTS}</TableCell> {/* Assuming "inRts" is a field */}
        <TableCell>{material.INYUANR}</TableCell> {/* Assuming "inYuanRepaired" is a field */}
        <TableCell>{material.OS}</TableCell> {/* Assuming "outSale" is a field */}
        <TableCell>{material.YUANDMG}</TableCell> {/* Assuming "outYuanDamaged" is a field */}
        <TableCell>{material.FREEBIES}</TableCell> {/* Assuming "outFreebie" is a field */}
        <TableCell>{material.ES}</TableCell> {/* Assuming "endingStock" is a field */}
        <TableCell>{material.STATUS}</TableCell> {/* Assuming "status" is a field */}
        <TableCell>
          {isEditing === material._id ? (
            <Button onClick={() => handleSave(material._id)} variant="contained" color="primary">
              Save
            </Button>
          ) : (
            <>
              <Button onClick={() => handleEdit(material)} variant="outlined" sx={{ mr: 1 }}>
                Edit
              </Button>
              <Button onClick={() => openConfirmDeleteModal(material)} variant="contained" color="error">
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
        )}

        {/* Create Material Modal */}
        <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 400,
              bgcolor: 'background.paper',
              p: 4,
              boxShadow: 24,
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Create New Item
            </Typography>
            <TextField
              label="Material Name"
              value={newMaterial.description}
              onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
              fullWidth
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Unit</InputLabel>
              <Select
                value={newMaterial.unit}
                onChange={(e) => setNewMaterial({ ...newMaterial, unit: e.target.value })}
              >
                {validUnits.map((unit) => (
                  <MenuItem key={unit} value={unit}>
                    {unit}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Cost"
              type="number"
              value={newMaterial.cost === 0 ? "" : newMaterial.cost}
              onChange={(e) => {
                const value = e.target.value;
                setNewMaterial({ ...newMaterial, cost: value === "" ? "" : Math.max(0, parseFloat(value)) });
              }}
              fullWidth
              margin="normal"
            />
            <Button
              variant="contained"
              onClick={handleCreate}
              sx={{ mt: 2, backgroundColor: "#96720b", "&:hover": { backgroundColor: "#6b7c61" } }}
              fullWidth
            >
              Create Item
            </Button>
          </Box>
        </Modal>

        {/* Confirm Delete Material Modal */}
        <ConfirmDeleteMaterialModal
          isOpen={isConfirmDeleteOpen}
          onClose={() => setIsConfirmDeleteOpen(false)}
          onConfirm={confirmDelete}
          materialDescription={materialToDelete?.description}
        />
      </Box>
    </>
  );
};

export default Materials;