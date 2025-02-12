import React, { useState, useEffect } from "react";
import Navbar from "../Components/Navbar";
import Sidebar from "../Components/Sidebar";
import {
  collection,
  getDocs,
  orderBy,
  query,
  where
} from "firebase/firestore";
import { db } from "../firebase";
import {
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Typography,
  Select,
  MenuItem,
  Button
} from "@mui/material";
import jsPDF from "jspdf";
import "jspdf-autotable";

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [availableMonths, setAvailableMonths] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 3;

  useEffect(() => {
    fetchLogs();
  }, [selectedMonth]);

  useEffect(() => {
    fetchAvailableMonths();
  }, []);

  /** 🔹 Fetch Available Months Dynamically */
  const fetchAvailableMonths = async () => {
    try {
      const logsRef = collection(db, "Logs");
      const logsQuery = query(logsRef, orderBy("timestamp", "desc"));
      const snapshot = await getDocs(logsQuery);
      const months = new Set();

      snapshot.docs.forEach((doc) => {
        const timestamp = doc.data().timestamp;
        if (timestamp && timestamp.toDate) {
          const date = timestamp.toDate();
          const formattedMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`; // YYYY-MM
          months.add(formattedMonth);
        }
      });

      setAvailableMonths([...months]); // Convert Set to Array
    } catch (error) {
      console.error("Error fetching available months:", error);
    }
  };

  /** 🔹 Fetch Logs Based on Selected Month */
  const fetchLogs = async () => {
    try {
      const logsRef = collection(db, "Logs");
      let logsQuery = query(logsRef, orderBy("timestamp", "desc"));

      if (selectedMonth) {
        const [year, month] = selectedMonth.split("-");
        const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
        const endDate = new Date(Date.UTC(year, month, 1, 0, 0, 0));

        logsQuery = query(
          logsRef,
          where("timestamp", ">=", startDate),
          where("timestamp", "<", endDate),
          orderBy("timestamp", "desc")
        );
      }

      const snapshot = await getDocs(logsQuery);
      const logsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLogs(logsData);
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
  };

  /** 🔹 Format Firestore Timestamp to Readable Date */
  const formatDate = (timestamp) => {
    if (timestamp?.toDate) {
      return timestamp.toDate().toLocaleString();
    }
    return "Unknown";
  };

 
  const downloadPDF = () => {
    if (logs.length === 0) {
      alert("No logs available for download.");
      return;
    }
  
    const doc = new jsPDF({
      orientation: "landscape", // Ensures better table fitting
      unit: "mm",
      format: "a4",
    });
  
    doc.text(`Activity Logs Report - ${selectedMonth || "All Months"}`, 14, 15);
  
    const tableColumn = ["User", "Action", "Timestamp", "Product", "Quantity", "Old Data", "New Data"];
    const tableRows = [];
  
    logs.forEach(log => {
      const user = log.user || "Unknown";
      const action = log.action.replace(/,/g, " ");
      const timestamp = formatDate(log.timestamp);
      const product = log.details?.product || "N/A";
      const qty = log.details?.qty || "N/A";
      const oldData = log.oldData && Object.keys(log.oldData).length > 0
        ? JSON.stringify(log.oldData, null, 2).replace(/[\{\}"]/g, '') // Clean formatting
        : "N/A";
      const newData = log.newData && Object.keys(log.newData).length > 0
        ? JSON.stringify(log.newData, null, 2).replace(/[\{\}"]/g, '')
        : "N/A";
  
      tableRows.push([user, action, timestamp, product, qty, oldData, newData]);
    });
  
    doc.autoTable({
      startY: 25,
      head: [tableColumn],
      body: tableRows,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [3, 63, 48], textColor: [255, 255, 255] }, // Green header
      columnStyles: {
        0: { cellWidth: 25 }, // User
        1: { cellWidth: 40 }, // Action
        2: { cellWidth: 40 }, // Timestamp
        3: { cellWidth: 30 }, // Product
        4: { cellWidth: 15 }, // Quantity
        5: { cellWidth: 50 }, // Old Data
        6: { cellWidth: 50 }  // New Data
      },
      margin: { top: 20 },
    });
  
    doc.save(`Activity_Logs_${selectedMonth || "All"}.pdf`);
  };
  


  return (
    <>
      <Navbar isHovered={isHovered} />
      <Box sx={{ display: "flex", marginTop: "64px" }}>
        <Sidebar isHovered={isHovered} setIsHovered={setIsHovered} />
        <Box sx={{ flexGrow: 1, padding: 3 }}>
          <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold" }}>
            Activity Logs
          </Typography>

          {/* Month Selector and PDF Download Button */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              displayEmpty
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">All Months</MenuItem>
              {availableMonths.map((month) => {
                const [year, monthNum] = month.split("-");
                const date = new Date(year, monthNum - 1);
                return (
                  <MenuItem key={month} value={month}>
                    {date.toLocaleString("default", { month: "long", year: "numeric" })}
                  </MenuItem>
                );
              })}
            </Select>
            <Button variant="contained" color="primary" onClick={downloadPDF}>
              Download PDF Report
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#3f5930" }}>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>User</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Action</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Timestamp</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Details</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>OLD DATA</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>NEW DATA</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage).map(log => (
                  <TableRow key={log.id}>
                    <TableCell>{log.user}</TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>{formatDate(log.timestamp)}</TableCell>
                    <TableCell>
                      {log.details ? (
                        <Box>
                          <Typography variant="body2">
                            <strong>Product:</strong> {log.details.product || "N/A"}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Quantity:</strong> {log.details.qty || "N/A"}
                          </Typography>
                        </Box>
                      ) : "N/A"}
                    </TableCell>

                    {/* Old Data */}
                    <TableCell>
                      {log.oldData && Object.keys(log.oldData).length > 0 ? (
                        <Box sx={{ maxWidth: "250px", overflow: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                          <Typography variant="body2" fontWeight="bold">Old Data:</Typography>
                          <Typography variant="body2" sx={{ fontSize: "12px", color: "gray" }}>
                            {JSON.stringify(log.oldData, null, 2)}
                          </Typography>
                        </Box>
                      ) : "N/A"}
                    </TableCell>

                    {/* New Data */}
                    <TableCell>
                      {log.newData && Object.keys(log.newData).length > 0 ? (
                        <Box sx={{ maxWidth: "250px", overflow: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                          <Typography variant="body2" fontWeight="bold">New Data:</Typography>
                          <Typography variant="body2" sx={{ fontSize: "12px", color: "gray" }}>
                            {JSON.stringify(log.newData, null, 2)}
                          </Typography>
                        </Box>
                      ) : "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>


            </Table>
          </TableContainer>
          {/* Pagination */}
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
              {Array.from({ length: Math.ceil(logs.length / itemsPerPage) }, (_, i) => (
                <MenuItem key={i} value={i}>Page {i + 1}</MenuItem>
              ))}
            </Select>

            <Button
              variant="contained"
              color="primary"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(logs.length / itemsPerPage) - 1))}
              disabled={(currentPage + 1) * itemsPerPage >= logs.length}
              sx={{ ml: 2 }}
            >
              Next
            </Button>
          </Box>

        </Box>
      </Box>
    </>
  );
};

export default ActivityLogs;
