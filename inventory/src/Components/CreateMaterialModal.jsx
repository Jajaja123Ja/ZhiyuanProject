import React, { useState } from "react";
import { 
  Modal, Box, TextField, Button, Typography, Select, MenuItem, 
  FormControl, InputLabel 
} from "@mui/material";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

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
    IMAGE_URL: "" // Stores the uploaded image URL
  });

  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Handle text input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setMaterial({ ...material, [name]: value });
  };

  // Handle image selection
  const handleImageUpload = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  // Upload image and create material entry
  const handleSubmit = async () => {
    if (!material.CODE) {
      alert("CODE is required!");
      return;
    }
  
    setUploading(true);
  
    try {
      let imageUrl = ""; // Default to empty if no image is provided
  
      // Only upload if an image is selected
      if (image) {
        const storage = getStorage();
        const storageRef = ref(storage, `materials/${image.name}`);
        await uploadBytes(storageRef, image);
        imageUrl = await getDownloadURL(storageRef);
        console.log("Image URL:", imageUrl);
      }
  
      // Save material data, including image URL (if available)
      handleSave({ ...material, IMAGE_URL: imageUrl });
  
      // Close modal and reset form
      setUploading(false);
      handleClose();
      setMaterial({
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
        IMAGE_URL: "" // Reset to empty
      });
      setImage(null);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Image upload failed. Please try again.");
      setUploading(false);
    }
  };
  

  return (
    <Modal open={show} onClose={handleClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" component="h2" gutterBottom>
          Create Material
        </Typography>

        {/* Dynamic Form Fields */}
        {Object.keys(material).map((key) => (
          key !== "STATUS" && key !== "IMAGE_URL" ? (
            <TextField
              key={key}
              label={key}
              name={key}
              value={material[key]}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
          ) : null
        ))}

        {/* Status Dropdown */}
        <FormControl fullWidth margin="normal">
          <InputLabel>Status</InputLabel>
          <Select name="STATUS" value={material.STATUS} onChange={handleChange}>
            <MenuItem value="OK">OK</MenuItem>
            <MenuItem value="RESTOCK">RESTOCK</MenuItem>
          </Select>
        </FormControl>

        {/* Image Upload */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1">Upload Image</Typography>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
        </Box>

        {/* Image Preview */}
        {image && (
          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Typography variant="body2">Preview:</Typography>
            <img 
              src={URL.createObjectURL(image)} 
              alt="Preview" 
              style={{ width: "100px", height: "100px", borderRadius: "5px", objectFit: "cover" }} 
            />
          </Box>
        )}

        {/* Buttons */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button onClick={handleClose} sx={{ mr: 1 }} disabled={uploading}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmit} disabled={uploading}>
            {uploading ? "Uploading..." : "Save"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default CreateMaterialModal;
