import React, { useState, useEffect } from "react";
import {
  Box, Typography, Paper, CircularProgress, Grid, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Select, MenuItem
} from "@mui/material";
import { collection, getDocs } from "firebase/firestore";
import Navbar from "../Components/Navbar";
import Sidebar from "../Components/Sidebar";
import { db } from "../firebase";

const Reports = () => {
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10; // Adjust pagination size if needed

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      const inventoryCollection = collection(db, "Inventory");
      const snapshot = await getDocs(inventoryCollection);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        CODE: doc.data().CODE || "",
        PRODUCTNAME: doc.data().PRODUCTNAME || "",
        BRAND: doc.data().BRAND || "",
        CATEGORY: doc.data().CATEGORY || "",
        OUTSALE: doc.data().OUTSALE || 0, // Sales count
        ENDINGSTOCK: doc.data().ENDINGSTOCK || 0, // Stock left
      }));

      setInventoryData(data);
    } catch (error) {
      console.error("Error fetching inventory data", error);
    } finally {
      setLoading(false);
    }
  };

  // Sorting Fast and Slow moving items based on OUTSALE (sales volume)
  const sortedInventory = [...inventoryData].sort((a, b) => b.OUTSALE - a.OUTSALE);

  const fastMovingItems = sortedInventory.slice(0, 5); // Top 5 Fast Moving
  const slowMovingItems = sortedInventory.slice(-5); // Bottom 5 Slow Moving

  // Paginated Fast-Moving Items List (Beyond Top 5)
  const paginatedFastMovingItems = sortedInventory.slice(5).slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  return (
    <>
      <Navbar isHovered={isHovered} />
      <Box sx={{ display: "flex", marginTop: "64px" }}>
        <Sidebar isHovered={isHovered} setIsHovered={setIsHovered} />
        <Box sx={{ flexGrow: 1, padding: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: "bold", color: "#96720b", mb: 2 }}>
            Inventory Reports
          </Typography>

          {loading ? (
            <Box sx={{ textAlign: "center", marginTop: 4 }}>
              <CircularProgress />
              <Typography variant="h6" sx={{ mt: 2 }}>Loading Reports...</Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {/* Fast Moving Items (Top 5) */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ padding: 2, backgroundColor: "white" }}>
                  <Typography variant="h6" sx={{ fontWeight: "bold", color: "#388e3c" }}>
                    Fast Moving Items (Top 5)
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: "#388e3c" }}>
                          <TableCell sx={{ fontWeight: "bold", color: "white" }}>Code</TableCell>
                          <TableCell sx={{ fontWeight: "bold", color: "white" }}>Product Name</TableCell>
                          <TableCell sx={{ fontWeight: "bold", color: "white" }}>Brand</TableCell>
                          <TableCell sx={{ fontWeight: "bold", color: "white" }}>Sold</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {fastMovingItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.CODE}</TableCell>
                            <TableCell>{item.PRODUCTNAME}</TableCell>
                            <TableCell>{item.BRAND}</TableCell>
                            <TableCell>{item.OUTSALE}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>

              {/* Slow Moving Items (Bottom 5) */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ padding: 2, backgroundColor: "white" }}>
                  <Typography variant="h6" sx={{ fontWeight: "bold", color: "#d32f2f" }}>
                    Slow Moving Items (Bottom 5)
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: "#d32f2f" }}>
                          <TableCell sx={{ fontWeight: "bold", color: "white" }}>Code</TableCell>
                          <TableCell sx={{ fontWeight: "bold", color: "white" }}>Product Name</TableCell>
                          <TableCell sx={{ fontWeight: "bold", color: "white" }}>Brand</TableCell>
                          <TableCell sx={{ fontWeight: "bold", color: "white" }}>Sold</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {slowMovingItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.CODE}</TableCell>
                            <TableCell>{item.PRODUCTNAME}</TableCell>
                            <TableCell>{item.BRAND}</TableCell>
                            <TableCell>{item.OUTSALE}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>

              {/* Paginated Fast-Moving Items List */}
              <Grid item xs={12}>
                <Paper sx={{ padding: 2, backgroundColor: "white" }}>
                  <Typography variant="h6" sx={{ fontWeight: "bold", color: "#388e3c" }}>
                    Fast Moving Items (Paginated)
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: "#388e3c" }}>
                          <TableCell sx={{ fontWeight: "bold", color: "white" }}>Rank</TableCell>
                          <TableCell sx={{ fontWeight: "bold", color: "white" }}>Code</TableCell>
                          <TableCell sx={{ fontWeight: "bold", color: "white" }}>Product Name</TableCell>
                          <TableCell sx={{ fontWeight: "bold", color: "white" }}>Brand</TableCell>
                          <TableCell sx={{ fontWeight: "bold", color: "white" }}>Sold</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedFastMovingItems.map((item, index) => (
                          <TableRow key={item.id}>
                            <TableCell>#{index + 6 + currentPage * itemsPerPage}</TableCell>
                            <TableCell>{item.CODE}</TableCell>
                            <TableCell>{item.PRODUCTNAME}</TableCell>
                            <TableCell>{item.BRAND}</TableCell>
                            <TableCell>{item.OUTSALE}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Pagination Controls */}
                  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 2 }}>
                    <Button variant="contained" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))} disabled={currentPage === 0}>
                      Previous
                    </Button>
                    <Select value={currentPage} onChange={(e) => setCurrentPage(e.target.value)}>
                      {Array.from({ length: Math.ceil((sortedInventory.length - 5) / itemsPerPage) }, (_, i) => (
                        <MenuItem key={i} value={i}>Page {i + 1}</MenuItem>
                      ))}
                    </Select>
                    <Button variant="contained" onClick={() => setCurrentPage(prev => prev + 1)} disabled={paginatedFastMovingItems.length < itemsPerPage}>
                      Next
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}
        </Box>
      </Box>
    </>
  );
};

export default Reports;
