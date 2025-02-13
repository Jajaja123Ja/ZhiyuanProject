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
  MenuItem,
  Chip,
  Select,
} from "@mui/material";
import { serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
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
  updateDoc,
} from "firebase/firestore";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton, Tooltip } from "@mui/material";


const Materials = () => {
  const [materials, setMaterials] = useState([]);
  const { user } = useAuthContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(""); // New debounced state

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
  const [selectedMonth, setSelectedMonth] = useState("");
  const [monthlyReport, setMonthlyReport] = useState([]);


  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setDebouncedSearch(searchTerm.toLowerCase().trim());
    }, 300); // 300ms delay for better performance

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);



  useEffect(() => {
    const fetchMaterials = async () => {
        setLoading(true);
        try {
            const inventoryCollection = collection(db, "Inventory");
            const snapshot = await getDocs(inventoryCollection);
            const today = new Date();
            const isFirstDayOfMonth = today.getDate() === 1;

            const lastMonth = new Date();
            lastMonth.setMonth(today.getMonth() - 1);
            const lastMonthName = lastMonth.toLocaleString("default", { month: "long" });

            const reportCollection = collection(db, "MonthlyReports");

            const realData = await Promise.all(snapshot.docs.map(async (docSnapshot) => {
                const data = docSnapshot.data();
                const docRef = doc(db, "Inventory", docSnapshot.id);

                let openingStock = parseInt(data.OPENINGSTOCK) || 0;
                let endingStock = parseInt(data.ENDINGSTOCK) || 0;
                let inDelivery = parseInt(data.INDELIVERY) || 0;
                let outSale = parseInt(data.OUTSALE) || 0;
                let price = parseFloat(data.PRICE) || 0;
                let inRTS = parseInt(data.INRTS) || 0;  
let outFreebies = parseInt(data.OUTFREEBIES) || 0;  

                // ✅ Save monthly report and reset stock on first day of month
                if (isFirstDayOfMonth) {
                    await addDoc(reportCollection, {
                        CODE: data.CODE,
                        PRODUCTNAME: data.PRODUCTNAME,
                        CATEGORY: data.CATEGORY,
                        BRAND: data.BRAND,
                        PRICE: price,
                        OPENINGSTOCK: openingStock,
                        INDELIVERY: inDelivery,
                        INRTS: inRTS,
                        OUTSALE: outSale,
                        OUTFREEBIES: outFreebies,
                        ENDINGSTOCK: endingStock,
                        MONTH: lastMonthName,
                        YEAR: lastMonth.getFullYear(),
                        TIMESTAMP: serverTimestamp(),
                    });

                    // ✅ Reset stock values for new month
                    openingStock = endingStock;
                    inDelivery = 0;
                    outSale = 0;

                    await updateDoc(docRef, {
                        OPENINGSTOCK: openingStock,
                        INDELIVERY: inDelivery,
                        OUTSALE: outSale,
                        ENDINGSTOCK: openingStock, 
                    });
                }

                return {
                  id: docSnapshot.id,
                  CODE: data.CODE || "",
                  CATEGORY: data.CATEGORY || "",
                  BRAND: data.BRAND || "",
                  PRODUCTNAME: data.PRODUCTNAME || "",
                  TIPSIZE: data.TIPSIZE || "",
                  PRICE: price,
                  OPENINGSTOCK: openingStock,
                  INDELIVERY: inDelivery,
                  INRTS: inRTS,  // Add this
                  OUTSALE: outSale,
                  OUTFREEBIES: outFreebies,  // Add this
                  ENDINGSTOCK: endingStock,
                  STATUS: data.STATUS || "OK",
                  IMAGE_URL: data.IMAGE_URL || "",
              };
            }));

            // ✅ Set materials and total items
            setMaterials(realData);
            setTotalItems(realData.length);

            // ✅ Update brand counts correctly
            const brandCounter = {
                BLM: realData.filter((item) => item.CODE.startsWith("BLM")).length,
                KL: realData.filter((item) => item.CODE.startsWith("KL")).length,
                PERI: realData.filter((item) => item.CODE.startsWith("PERI")).length,
            };

            setBrandCounts(brandCounter); // ✅ Updates brand count state
        } catch (error) {
            console.error("Error fetching materials:", error);
        } finally {
            setLoading(false);
        }
    };

    fetchMaterials();
}, []);


  const fetchMonthlyReport = async (month, year) => {
    setLoading(true);
    try {
      const reportCollection = collection(db, "MonthlyReports");
      const q = query(reportCollection, where("MONTH", "==", month), where("YEAR", "==", year));
      const snapshot = await getDocs(q);

      const reportData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setMonthlyReport(reportData);
    } catch (error) {
      console.error("Error fetching monthly reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterByBrand = (brand) => {
    setBrandFilter(brand);
    setCurrentPage(0); // Reset to first page when brand filter changes
  };

  // Function to reset the filter and pagination
  const resetFilter = () => {
    setBrandFilter("");
    setCurrentPage(0); // Reset pagination on filter reset
  };


  const handleEdit = (item) => {
    setEditingItem(item.id); // Store the ID of the editing item
    setUpdatedItem({ ...item }); // Load current values into the form
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Allow empty values to prevent auto-reset
    if (value === "") {
        setUpdatedItem((prev) => ({
            ...prev,
            [name]: "",
        }));
        return;
    }

    // Fields that should only accept numbers
    const numericFields = ["PRICE", "OPENINGSTOCK", "INDELIVERY", "INRTS", "OUTSALE", "OUTFREEBIES", "ENDINGSTOCK"];

    if (numericFields.includes(name)) {
        const numericValue = value.replace(/[^0-9]/g, ""); // Ensure numeric input only

        setUpdatedItem((prev) => {
            let newValue = parseInt(numericValue) || 0;
            
            // Previous values
            let prevINDELIVERY = parseInt(prev.INDELIVERY) || 0;
            let prevINRTS = parseInt(prev.INRTS) || 0;
            let prevOUTSALE = parseInt(prev.OUTSALE) || 0;
            let prevOUTFREEBIES = parseInt(prev.OUTFREEBIES) || 0;

            // Calculate the base ending stock
            let prevEndingStock =
                (parseInt(prev.OPENINGSTOCK) || 0) +
                (parseInt(prev.INDELIVERY) || 0) +
                (parseInt(prev.INRTS) || 0) -
                (parseInt(prev.OUTSALE) || 0) -
                (parseInt(prev.OUTFREEBIES) || 0);

            let newEndingStock = prevEndingStock;

            // Adjust ENDINGSTOCK when INDELIVERY changes (New deliveries add to stock)
            if (name === "INDELIVERY") {
                let diff = newValue - prevINDELIVERY;
                newEndingStock += diff;
            }

            // Adjust ENDINGSTOCK when INRTS changes (Returns increase stock)
            if (name === "INRTS") {
                let diff = newValue - prevINRTS;
                newEndingStock += diff;
            }

            // Adjust ENDINGSTOCK when OUTSALE changes (Sales decrease stock)
            if (name === "OUTSALE") {
                let diff = newValue - prevOUTSALE;
                newEndingStock -= diff;
            }

            // Adjust ENDINGSTOCK when OUTFREEBIES changes (Freebies decrease stock)
            if (name === "OUTFREEBIES") {
                let diff = newValue - prevOUTFREEBIES;
                newEndingStock -= diff;
            }

            return {
                ...prev,
                [name]: numericValue,
                ENDINGSTOCK: newEndingStock, // ✅ Fully dynamic stock calculation
            };
        });
    } else {
        // Allow normal text input for other fields (CODE, CATEGORY, BRAND, PRODUCTNAME, etc.)
        setUpdatedItem((prev) => ({
            ...prev,
            [name]: value,
        }));
    }
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
  
      // ✅ Log the delete action in a consistent format
      await addDoc(collection(db, "Logs"), {
        user: user?.User || "unknown",
        action: `Deleted material ID=${itemToDelete.CODE}`,
        timestamp: serverTimestamp(),
        details: {
          code: itemToDelete.CODE,
          productName: itemToDelete.PRODUCTNAME,
        },
      });
  
      setSuccessMessage("Item successfully deleted!");
      setSuccessModalOpen(true);
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete item.");
    }
  };
  const tableHeaderStyle = {
    backgroundColor: "#3f5930",
    color: "white",
    fontWeight: "bold",
    fontSize: "15px",
  };

  const statusStyles = {
    OK: {
      backgroundColor: "green",
      color: "white",
      width: "100px", // Ensures uniform width
      height: "40px", // Ensures uniform height
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontWeight: "bold",
      borderRadius: "8px",
      fontSize: "14px",
    },
    RESTOCK: {
      backgroundColor: "red",
      color: "white",
      width: "100px",
      height: "40px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontWeight: "bold",
      borderRadius: "8px",
      fontSize: "14px",
    },
  };



  const actionButtonStyle = {
    margin: "5px",
  };


  const saveEdit = async () => {
    if (!editingItem) return;
  
    try {
      const itemRef = doc(db, "Inventory", editingItem);
      
      // ✅ Fetch the current data before updating
      const existingItem = materials.find(item => item.id === editingItem);
      
      // ✅ Update Firestore
      await updateDoc(itemRef, updatedItem);
  
      setMaterials(
        materials.map((item) =>
          item.id === editingItem ? { ...updatedItem, id: editingItem } : item
        )
      );
  
      setEditingItem(null);
  
      
      await addDoc(collection(db, "Logs"), {
        user: user?.User || "unknown",
        action: `Updated material CODE=${existingItem?.CODE || "N/A"}`,
        timestamp: serverTimestamp(),
        details: {
          code: existingItem?.CODE || "N/A",
          productName: existingItem?.PRODUCTNAME || "N/A",
        },
        changes: Object.keys(updatedItem).reduce((acc, key) => {
          if (existingItem[key] !== updatedItem[key]) {
            acc[key] = {
              before: existingItem[key],
              after: updatedItem[key],
            };
          }
          return acc;
        }, {}),
      });
  
      // ✅ Show success modal
      setSuccessMessage("Item successfully updated!");
      setSuccessModalOpen(true);
    } catch (error) {
      console.error("Error updating item:", error);
      alert("Failed to update item.");
    }
  };
  
  




  const handleCreate = async (newMaterial) => {
    try {
      const storage = getStorage();
      let imageUrl = "";
  
      if (newMaterial.IMAGE) {
        const imageRef = ref(storage, `materials/${newMaterial.IMAGE.name}`);
        await uploadBytes(imageRef, newMaterial.IMAGE);
        imageUrl = await getDownloadURL(imageRef);
      }
  
      const materialWithImage = {
        ...newMaterial,
        IMAGE_URL: imageUrl,
      };
  
      const inventoryCollection = collection(db, "Inventory");
      const docRef = await addDoc(inventoryCollection, materialWithImage);
  
      setMaterials([...materials, { id: docRef.id, ...materialWithImage }]);
      setIsModalOpen(false);
  
      // ✅ Log the create action in a consistent format
      await addDoc(collection(db, "Logs"), {
        user: user?.User || "unknown",
        action: `Created new material ID=${docRef.id}`,
        timestamp: serverTimestamp(),
        details: {
          code: newMaterial.CODE,
          productName: newMaterial.PRODUCTNAME,
        },
      });
  
      setSuccessMessage("Item successfully added to Inventory!");
      setSuccessModalOpen(true);
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
            label="Search..."
            variant="outlined"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(0);
            }}
            fullWidth
            sx={{ mb: 2, backgroundColor: "white" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
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
                    // "IMAGE",
                    "CODE",
                    "CATEGORY",
                    "BRAND",
                    "PRODUCTNAME",
                    "MEASUREMENT/COLOR/QTY",
                    "PRICE",
                    "OPENINGSTOCK",
                    "INDELIVERY",
                    "IN(RTS)",
                    "OUTSALE",
                    "OUT(FREEBIES)",
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
                    const term = debouncedSearch; 

                    const matchesSearch =
                      term === "" ||
                      item.CODE?.toLowerCase().includes(term) ||
                      item.CATEGORY?.toLowerCase().includes(term) ||
                      item.BRAND?.toLowerCase().includes(term) ||
                      item.PRODUCTNAME?.toLowerCase().includes(term);

                    const matchesBrand = !brandFilter || item.CODE.startsWith(brandFilter);

                    return matchesSearch && matchesBrand;
                  })
                  .slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage) 
                  .map((item) => (
                    <TableRow key={item.id}>
                      {/* <TableCell>
                        {item.IMAGE_URL ? (
                          <img
                            src={item.IMAGE_URL}
                            alt={item.PRODUCTNAME}
                            style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "5px" }}
                          />
                        ) : (
                          "No Image"
                        )}
                      </TableCell> */}

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
                          <TextField name="INRTS" value={updatedItem.INRTS} onChange={handleInputChange} />
                        ) : (
                          item.INRTS
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
                          <TextField name="OUTFREEBIES" value={updatedItem.OUTFREEBIES} onChange={handleInputChange} />
                        ) : (
                          item.OUTFREEBIES
                        )}
                      </TableCell>
                      <TableCell>
                        {editingItem === item.id ? (
                          <TextField name="ENDINGSTOCK" value={updatedItem.ENDINGSTOCK} onChange={handleInputChange} />
                        ) : (
                          item.ENDINGSTOCK
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {editingItem === item.id ? (
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
                                "& fieldset": { borderColor: "gray" },
                                "&:hover fieldset": { borderColor: "gray" },
                                "&.Mui-focused fieldset": { borderColor: "gray" },
                              },
                            }}
                          >
                            <MenuItem value="OK">
                              ✅ OK
                            </MenuItem>
                            <MenuItem value="RESTOCK">
                              🚨 RESTOCK
                            </MenuItem>
                          </TextField>
                        ) : (
                          <Chip label={item.STATUS} sx={statusStyles[item.STATUS]} />
                        )}
                      </TableCell>




                      <TableCell>
                        {editingItem === item.id ? (
                          <>
                            <Button variant="contained" color="primary" onClick={saveEdit} sx={actionButtonStyle}>
                              Save
                            </Button>
                            <Button variant="contained" color="secondary" onClick={() => setEditingItem(null)} sx={actionButtonStyle}>
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Tooltip title="Edit">
                              <IconButton onClick={() => handleEdit(item)} color="primary">
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton onClick={() => handleDeleteConfirm(item)} color="error">
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
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

            <Select
              value={currentPage}
              onChange={(e) => setCurrentPage(e.target.value)}
              sx={{ mx: 2 }}
            >
              {Array.from({ length: Math.ceil(materials.length / itemsPerPage) }, (_, i) => (
                <MenuItem key={i} value={i}>Page {i + 1}</MenuItem>
              ))}
            </Select>

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
          <Box sx={{ marginBottom: 3 }}>
            <Typography variant="h6">View Past Reports</Typography>
            <Select
  value={selectedMonth}
  onChange={(e) => {
    const [month, year] = e.target.value.split(" ");
    setSelectedMonth(e.target.value);
    fetchMonthlyReport(month, parseInt(year));
  }}
  sx={{ minWidth: 200, marginBottom: 2 }}
>
  {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    .map((month) => (
      <MenuItem key={`${month} ${new Date().getFullYear()}`} value={`${month} ${new Date().getFullYear()}`}>
        {month} {new Date().getFullYear()}
      </MenuItem>
    ))}
</Select>


          </Box>
          {monthlyReport.length > 0 && (
  <Paper sx={{ padding: 2, marginTop: 3 }}>
    <Typography variant="h6">Monthly Report for {selectedMonth}</Typography>
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><b>Code</b></TableCell>
            <TableCell><b>Product Name</b></TableCell>
            <TableCell><b>Price</b></TableCell>
            <TableCell><b>Opening Stock</b></TableCell>
            <TableCell><b>In Delivery</b></TableCell>
            <TableCell><b>Out Sale</b></TableCell>
            <TableCell><b>Ending Stock</b></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {monthlyReport.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.CODE}</TableCell>
              <TableCell>{item.PRODUCTNAME}</TableCell>
              <TableCell>{item.PRICE}</TableCell>
              <TableCell>{item.OPENINGSTOCK}</TableCell>
              <TableCell>{item.INDELIVERY}</TableCell>
              <TableCell>{item.OUTSALE}</TableCell>
              <TableCell>{item.ENDINGSTOCK}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Paper>
)}




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
