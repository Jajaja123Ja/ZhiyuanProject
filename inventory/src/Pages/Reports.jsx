import React, { useState, useRef, useEffect } from "react";
import { Box, Typography, Paper, CircularProgress, Grid, Button } from "@mui/material";
import { Bar, Line, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from "chart.js";
import Navbar from "../Components/Navbar";
import Sidebar from "../Components/Sidebar";

// ✅ Register chart.js components (Fixes the import issue)
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

const Reports = () => {
  const [salesData, setSalesData] = useState([]);
  const [stockData, setStockData] = useState(null);
  const [returnsData, setReturnsData] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(true);

  // **Refs for charts to enable downloads**
  const salesChartRef = useRef(null);
  const stockChartRef = useRef(null);
  const returnsChartRef = useRef(null);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
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
      console.error("Error fetching report data", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ **Download function for charts with fixed white background**
  const downloadChart = (chartRef, filename) => {
    if (!chartRef.current) return;

    const chartInstance = chartRef.current;
    const canvas = chartInstance.canvas;
    const ctx = canvas.getContext("2d");

    // Save original state
    ctx.save();

    // **Fix: Properly add white background and redraw chart**
    ctx.fillStyle = "#ffffff"; // Set white background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // **Force chart to redraw on top of the white background**
    chartInstance.update("none");

    // Export chart as PNG
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = filename;
    link.click();

    // Restore original state
    ctx.restore();
  };
  return (
    <>
      <Navbar isHovered={isHovered} />
      <Box sx={{ display: "flex", marginTop: "64px" }}>
        <Sidebar isHovered={isHovered} setIsHovered={setIsHovered} />
        <Box sx={{ flexGrow: 1, padding: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: "bold", color: "#96720b", mb: 2 }}>
            Reports Dashboard
          </Typography>

          {loading ? (
            <Box sx={{ textAlign: "center", marginTop: 4 }}>
              <CircularProgress />
              <Typography variant="h6" sx={{ mt: 2 }}>Loading Reports...</Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {/* Sales Performance Chart */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ padding: 2, height: 350, backgroundColor: "white" }}>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>Sales Performance (Last 30 Days)</Typography>
                  <Line
                    ref={salesChartRef}
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
                    options={{ maintainAspectRatio: false }}
                  />
                  <Button onClick={() => downloadChart(salesChartRef, "sales-report.png")} variant="contained" sx={{ mt: 1, backgroundColor: "#96720b" }}>
                    Download Sales Chart
                  </Button>
                </Paper>
              </Grid>

              {/* Stock Movement Chart */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ padding: 2, height: 350, backgroundColor: "white" }}>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>Stock Movement</Typography>
                  <Bar
                    ref={stockChartRef}
                    data={{
                      labels: ["Sold", "Restocked", "Returned"],
                      datasets: [{
                        label: "Stock Movement",
                        data: [stockData.sold, stockData.restocked, stockData.returned],
                        backgroundColor: ["#4caf50", "#ff9800", "#f44336"],
                      }],
                    }}
                    options={{ maintainAspectRatio: false }}
                  />
                  <Button onClick={() => downloadChart(stockChartRef, "stock-movement.png")} variant="contained" sx={{ mt: 1, backgroundColor: "#96720b" }}>
                    Download Stock Chart
                  </Button>
                </Paper>
              </Grid>

              {/* Returns Breakdown Chart */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ padding: 2, height: 350, backgroundColor: "white" }}>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>Returns Breakdown</Typography>
                  <Pie
                    ref={returnsChartRef}
                    data={{
                      labels: ["Defective", "Wrong Item", "Customer Change"],
                      datasets: [{
                        label: "Returns",
                        data: [returnsData.defective, returnsData.wrongItem, returnsData.customerChange],
                        backgroundColor: ["#f44336", "#ffeb3b", "#03a9f4"],
                      }],
                    }}
                    options={{ maintainAspectRatio: false }}
                  />
                  <Button onClick={() => downloadChart(returnsChartRef, "returns-report.png")} variant="contained" sx={{ mt: 1, backgroundColor: "#96720b" }}>
                    Download Returns Chart
                  </Button>
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
