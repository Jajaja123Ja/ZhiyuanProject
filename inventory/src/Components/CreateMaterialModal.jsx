// CreateMaterialModal.jsx
import React, { useState } from 'react';
import { Modal, Box, TextField, Button, Typography } from '@mui/material';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

const CreateMaterialModal = ({ show, handleClose, handleSave }) => {
  const [material, setMaterial] = useState({
    CATEGORY: '',
    BRAND: '',
    PRODUCTNAME: '',
    TIPSIZE: '',
    PRICE: '',
    'ENDING STOCK': '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMaterial({ ...material, [name]: value });
  };

  const handleSubmit = () => {
    handleSave(material);
    handleClose();
  };

  return (
    <Modal open={show} onClose={handleClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" component="h2" gutterBottom>
          Create Material
        </Typography>
        {Object.keys(material).map((key) => (
          <TextField
            key={key}
            label={key}
            name={key}
            value={material[key]}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
        ))}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
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
