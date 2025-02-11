import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, Grid, Button } from "@mui/material";
import { Bar, Line, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from "chart.js";
import Navbar from "../Components/Navbar";
import Sidebar from "../Components/Sidebar";

// Register chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [salesData, setSalesData] = useState([]);
  const [stockData, setStockData] = useState(null);
  const [returnsData, setReturnsData] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const sales = Array.from({ length: 30 }, () => Math.floor(Math.random() * 1000));
      const stock = {
        sold: Math.floor(Math.random() * 500),
        restocked: Math.floor(Math.random() * 300),
        returned: Math.floor(Math.random() * 200),
      };
      const returns = {
        defective: Math.floor(Math.random() * 50),
        wrongItem: Math.floor(Math.random() * 30),
        customerChange: Math.floor(Math.random() * 20),
      };

      setSalesData(sales);
      setStockData(stock);
      setReturnsData(returns);
    } catch (error) {
      console.error("Error fetching dashboard data", error);
    }
  };

  return (
    <>
      <Navbar isHovered={isHovered} />
      <Box sx={{ display: "flex", marginTop: "64px" }}>
        <Sidebar isHovered={isHovered} setIsHovered={setIsHovered} />
        <Box sx={{ flexGrow: 1, padding: 3, backgroundColor: "#f4f4f4", minHeight: "100vh" }}>
          <Typography variant="h4" sx={{ fontWeight: "bold", color: "#96720b", mb: 2 }}>
            Dashboard
          </Typography>

          <Grid container spacing={2}>
            {/* KPI Cards */}
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h6">Total Stock</Typography>
                <Typography variant="h4">1,500</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h6">Items Sold</Typography>
                <Typography variant="h4">{stockData?.sold}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h6">Restocked</Typography>
                <Typography variant="h4">{stockData?.restocked}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="h6">Returns</Typography>
                <Typography variant="h4">{stockData?.returned}</Typography>
              </Paper>
            </Grid>

            {/* Sales Performance Chart */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: 350 }}>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>Sales Performance (Last 30 Days)</Typography>
                <Line
                  data={{
                    labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
                    datasets: [{
                      label: "Sales",
                      data: salesData,
                      borderColor: "#3f5930",
                      backgroundColor: "rgba(63, 89, 48, 0.2)",
                      fill: true,
                    }],
                  }}
                />
              </Paper>
            </Grid>

            {/* Stock Movement Chart */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: 350 }}>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>Stock Movement</Typography>
                <Bar
                  data={{
                    labels: ["Sold", "Restocked", "Returned"],
                    datasets: [{
                      label: "Stock Movement",
                      data: [stockData?.sold, stockData?.restocked, stockData?.returned],
                      backgroundColor: ["#4caf50", "#ff9800", "#f44336"],
                    }],
                  }}
                />
              </Paper>
            </Grid>

            {/* Inventory Breakdown */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: 350 }}>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>Inventory Breakdown</Typography>
                <Pie
                  data={{
                    labels: ["Available Stock", "Low Stock", "Out of Stock"],
                    datasets: [{
                      data: [900, 400, 200],
                      backgroundColor: ["#4caf50", "#ff9800", "#f44336"],
                    }],
                  }}
                />
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </>
  );
};

export default Dashboard;
