import React, { useState, useEffect } from "react";
import Navbar from "../Components/Navbar";
import Sidebar from "../Components/Sidebar";
import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
  onSnapshot
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
  Button,
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
          const formattedMonth = `${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(2, "0")}`; // YYYY-MM
          months.add(formattedMonth);
        }
      });

      setAvailableMonths([...months]); // Convert Set to Array
    } catch (error) {
      console.error("Error fetching available months:", error);
    }
  };

  /** 🔹 Fetch Logs Based on Selected Month */
  const fetchLogs = () => {
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
  
    // ✅ Real-time listener
    const unsubscribe = onSnapshot(logsQuery, (snapshot) => {
      const logsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      // ✅ Fetch Borrowed & Returned Items separately in real-time
      const borrowedRef = collection(db, "borrowedItems");
      const borrowedUnsub = onSnapshot(borrowedRef, (borrowedSnapshot) => {
        const borrowedData = borrowedSnapshot.docs.map((doc) => ({
          id: doc.id,
          action: doc.data().status === "IN" ? "Returned Item" : "Borrowed Item",
          timestamp: doc.data().status === "IN" ? doc.data().returnedAt : doc.data().borrowedAt,
          user: doc.data().returnedBy || doc.data().borrowedBy || "Unknown",
          details: {
            borrower: doc.data().borrower,
            itemName: doc.data().itemName,
            quantity: doc.data().quantity,
          },
        }));
  
        // ✅ Merge and sort logs in real-time
        setLogs(
          [...logsData, ...borrowedData].sort((a, b) => 
            new Date(b.timestamp?.toDate ? b.timestamp.toDate() : b.timestamp) - 
            new Date(a.timestamp?.toDate ? a.timestamp.toDate() : a.timestamp)
          )
        );
        
      });
  
      return () => borrowedUnsub(); // Unsubscribe when component unmounts
    });
  
    return () => unsubscribe(); // Unsubscribe when component unmounts
  };
  
  

  /** 🔹 Format Firestore Timestamp to Readable Date */
  const formatDate = (timestamp) => {
    if (timestamp?.toDate) {
      return timestamp.toDate().toLocaleString();
    }
    return "Unknown";
  };

  return (
    <>
      <Navbar isHovered={isHovered} />
      <Box sx={{ display: "flex", marginTop: "64px" }}>
        <Sidebar isHovered={isHovered} setIsHovered={setIsHovered} />
        <Box sx={{ flexGrow: 1, padding: 3 }}>
          <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold", color: "#96720b" }}>
            Activity Logs
          </Typography>

          {/* Month Selector */}
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
                    {date.toLocaleString("default", {
                      month: "long",
                      year: "numeric",
                    })}
                  </MenuItem>
                );
              })}
            </Select>
          </Box>

          <TableContainer component={Paper} sx={{ minHeight: "400px", overflow: "auto" }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#3f5930" }}>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>User</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Action</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Timestamp</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Details</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Changes Made</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
  {logs.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage).map(log => (
    <TableRow key={log.id}>
      <TableCell>{log.user ? log.user : "Unknown"}</TableCell>
      <TableCell>{log.action}</TableCell>
      <TableCell>{formatDate(log.timestamp)}</TableCell>
      <TableCell>
  {log.details ? (
    <Box>
      {log.action === "Borrowed Item" ? (
        <>
          <Typography variant="body2">
            <strong>Borrower:</strong> {log.details.borrower || "N/A"}
          </Typography>
          <Typography variant="body2">
            <strong>Item:</strong> {log.details.itemName || "N/A"}
          </Typography>
          <Typography variant="body2">
            <strong>Quantity:</strong> {log.details.quantity || "N/A"}
          </Typography>
        </>
      ) : log.action === "Returned Item" ? (
        <>
          <Typography variant="body2">
            <strong>Returned By:</strong> {log.user || "Unknown"} {/* ✅ Show user */}
          </Typography>
          <Typography variant="body2">
            <strong>Item:</strong> {log.details.itemName || "N/A"}
          </Typography>
          <Typography variant="body2">
            <strong>Quantity:</strong> {log.details.quantity || "N/A"}
          </Typography>
        </>
      ) : (
        <>
          <Typography variant="body2">
            <strong>Product:</strong> {log.details.product || "N/A"}
          </Typography>
          <Typography variant="body2">
            <strong>Quantity:</strong> {log.details.qty || "N/A"}
          </Typography>
        </>
      )}
    </Box>
  ) : "N/A"}
</TableCell>

      <TableCell>
        {log.changes && Object.keys(log.changes).length > 0 ? (
          <Box sx={{ maxWidth: "250px", overflow: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            <Typography variant="body2" fontWeight="bold">Changes:</Typography>
            {Object.entries(log.changes).map(([field, values]) => (
              <Typography key={field} variant="body2" sx={{ fontSize: "12px", color: "gray" }}>
                <strong>{field}:</strong>{" "}
                <span style={{ textDecoration: "line-through", color: "red" }}>
                  {values.before}
                </span>{" "}
                ➝{" "}
                <span style={{ color: "green" }}>
                  {values.after}
                </span>
              </Typography>
            ))}
          </Box>
        ) : "N/A"}
      </TableCell>
    </TableRow>
  ))}
</TableBody>

            </Table>
          </TableContainer>

          {/* Pagination Controls */}
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 2 }}>
            <Button variant="contained" color="secondary" onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))} disabled={currentPage === 0} sx={{ mr: 2 }}>
              Previous
            </Button>
            <Select value={currentPage} onChange={(e) => setCurrentPage(e.target.value)} sx={{ mx: 2 }}>
              {Array.from({ length: Math.ceil(logs.length / itemsPerPage) }, (_, i) => (
                <MenuItem key={i} value={i}>Page {i + 1}</MenuItem>
              ))}
            </Select>
            <Button variant="contained" color="primary" onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(logs.length / itemsPerPage) - 1))} disabled={(currentPage + 1) * itemsPerPage >= logs.length} sx={{ ml: 2 }}>
              Next
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default ActivityLogs;
