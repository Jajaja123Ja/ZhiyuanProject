import React, { useState } from "react";
import { Modal, Box, TextField, Button, Typography, Select, MenuItem, FormControl, InputLabel } from "@mui/material";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

const CreateMaterialModal = ({ show, handleClose, handleSave }) => {
  const [material, setMaterial] = useState({
    CODE: "",
    CATEGORY: "",
    BRAND: "",
    PRODUCTNAME: "",
    TIPSIZE: "",
    PRICE: "",
    OPENINGSTOCK: 0,
    INDELIVERY: 0,
    OUTSALE: 0,
    ENDINGSTOCK: 0,
    STATUS: "OK",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMaterial({ ...material, [name]: value });
  };

  const handleSubmit = () => {
    if (!material.CODE) {
      alert("CODE is required!");
      return;
    }
  
    handleSave(material); // Send data to parent component
  };
  

  return (
    <Modal open={show} onClose={handleClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" component="h2" gutterBottom>
          Create Material
        </Typography>
        {Object.keys(material).map((key) => (
          key !== "STATUS" ? (
            <TextField
              key={key}
              label={key}
              name={key}
              value={material[key]}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
          ) : (
            <FormControl fullWidth key={key} margin="normal">
              <InputLabel>Status</InputLabel>
              <Select name="STATUS" value={material.STATUS} onChange={handleChange}>
                <MenuItem value="OK">OK</MenuItem>
                <MenuItem value="RESTOCK">RESTOCK</MenuItem>
              </Select>
            </FormControl>
          )
        ))}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button onClick={handleClose} sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmit}>
            Save
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default CreateMaterialModal;
