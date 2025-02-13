import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  Button,
  Select,
  MenuItem,
} from "@mui/material";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import Navbar from "../Components/Navbar";
import Sidebar from "../Components/Sidebar";

const Dashboard = () => {
  const [totalStock, setTotalStock] = useState(0);
  const [itemsSold, setItemsSold] = useState(0);
  const [returnsCount, setReturnsCount] = useState(0);
  const [stockData, setStockData] = useState({ sold: 0, restocked: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categoryReport, setCategoryReport] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
        const inventoryCollection = collection(db, "Inventory");
        const snapshot = await getDocs(inventoryCollection);
        const inventory = snapshot.docs.map((doc) => ({
            id: doc.id,
            CATEGORY: doc.data().CATEGORY || "Uncategorized",
            ENDINGSTOCK: Number(doc.data().ENDINGSTOCK) || 0,
            OUTSALE: Number(doc.data().OUTSALE) || 0,
            INDELIVERY: Number(doc.data().INDELIVERY) || 0,
            INRTS: Number(doc.data().INRTS) || 0,  // ✅ Fetch INRTS (Returns)
        }));

        console.log("Fetched Inventory Data:", inventory);

        const categoryData = {};
        inventory.forEach((item) => {
            if (!categoryData[item.CATEGORY]) {
                categoryData[item.CATEGORY] = { stock: 0, sold: 0, restocked: 0, returns: 0 };  // ✅ Include `returns`
            }
            categoryData[item.CATEGORY].stock += item.ENDINGSTOCK;
            categoryData[item.CATEGORY].sold += item.OUTSALE;
            categoryData[item.CATEGORY].restocked += item.INDELIVERY;
            categoryData[item.CATEGORY].returns += item.INRTS;  // ✅ Add INRTS (Returns)
        });
        

        setCategoryReport(categoryData);

        const totalItemsSold = inventory.reduce((sum, item) => sum + item.OUTSALE, 0);
        const totalReturns = inventory.reduce((sum, item) => sum + item.INRTS, 0);  // ✅ Compute total returns

        setTotalStock(inventory.reduce((sum, item) => sum + item.ENDINGSTOCK, 0));
        setItemsSold(totalItemsSold);
        setReturnsCount(totalReturns);  // ✅ Update Returns Count

        setStockData({
            sold: totalItemsSold,
            restocked: inventory.reduce((sum, item) => sum + item.INDELIVERY, 0),
        });

        setLoading(false);
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
    }
};


  const categoryEntries = Object.entries(categoryReport);
  const totalPages = Math.max(1, Math.ceil(categoryEntries.length / itemsPerPage));

  const displayedCategories = categoryEntries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <Navbar isHovered={isHovered} />
      <Box sx={{ display: "flex", marginTop: "64px" }}>
        <Sidebar isHovered={isHovered} setIsHovered={setIsHovered} />
        <Box sx={{ flexGrow: 1, padding: 3, backgroundColor: "#f4f4f4", minHeight: "100vh" }}>
          <Typography variant="h4" sx={{ fontWeight: "bold", color: "#96720b", mb: 2 }}>
            Dashboard
          </Typography>

          {loading ? (
            <Typography variant="h6" sx={{ textAlign: "center" }}>Loading Data...</Typography>
          ) : (
            <>
              {/* 📊 Dashboard Summary Cards */}
              <Grid container spacing={3}>
                {[
                  { label: "Total Stock", value: totalStock, color: "#3f5930" },
                  { label: "Items Sold", value: itemsSold, color: "#b71c1c" },
                  { label: "Restocked", value: stockData.restocked, color: "#1976d2" },
                  { label: "Returns", value: returnsCount, color: "#ff6f00" },
                ].map((stat, index) => (
                  <Grid key={index} item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 3, textAlign: "center", borderRadius: "12px", boxShadow: 3, bgcolor: "#ffffff" }}>
                      <Typography variant="h6">{stat.label}</Typography>
                      <Typography
                        variant="h3"
                        sx={{ fontWeight: "bold", color: stat.color }}
                      >
                        {stat.value.toLocaleString()} {/* Number Formatting */}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              {/* 📌 Category Report Section */}
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: "bold", color: "#3f5930" }}>
                  Inventory Report by Category
                </Typography>
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table>
                  <TableHead>
    <TableRow>
        <TableCell sx={{ fontWeight: "bold" }}>Category</TableCell>
        <TableCell sx={{ fontWeight: "bold" }}>Total Stock</TableCell>
        <TableCell sx={{ fontWeight: "bold" }}>Total Sold</TableCell>
        <TableCell sx={{ fontWeight: "bold" }}>Total Restocked</TableCell>
        <TableCell sx={{ fontWeight: "bold" }}>Total Returns</TableCell> {/* ✅ Add this */}
    </TableRow>
</TableHead>

<TableBody>
    {displayedCategories.length > 0 ? (
        displayedCategories.map(([category, data]) => (
            <TableRow key={category}>
                <TableCell>{category}</TableCell>
                <TableCell>{data.stock}</TableCell>
                <TableCell>{data.sold}</TableCell>
                <TableCell>{data.restocked}</TableCell>
                <TableCell>{data.returns}</TableCell> {/* ✅ Display per-category returns */}
            </TableRow>
        ))
    ) : (
        <TableRow>
            <TableCell colSpan={5} align="center">
                No category data available.
            </TableCell>
        </TableRow>
    )}
</TableBody>

                  </Table>
                </TableContainer>

                {/* 📌 Pagination Controls */}
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 2 }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    sx={{ mr: 2 }}
                  >
                    Previous
                  </Button>

                  <Select
                    value={currentPage}
                    onChange={(e) => setCurrentPage(Number(e.target.value))}
                    sx={{ mx: 2, minWidth: 100 }}
                  >
                    {Array.from({ length: totalPages }, (_, i) => (
                      <MenuItem key={i + 1} value={i + 1}>Page {i + 1}</MenuItem>
                    ))}
                  </Select>

                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage >= totalPages}
                    sx={{ ml: 2 }}
                  >
                    Next
                  </Button>
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </>
  );
};

export default Dashboard;
