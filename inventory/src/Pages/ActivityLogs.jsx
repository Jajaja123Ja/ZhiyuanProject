// ActivityLogs.jsx
import React, { useState, useEffect } from "react";
import Navbar from "../Components/Navbar";
import Sidebar from "../Components/Sidebar";
import {
  collection,
  getDocs,
  orderBy,
  query
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
  Typography
} from "@mui/material";

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        // Fetch from "Logs" collection, ordered by timestamp descending
        const logsRef = collection(db, "Logs");
        const logsQuery = query(logsRef, orderBy("timestamp", "desc"));
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

    fetchLogs();
  }, []);

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
            transition: "margin-left 0.3s ease-in-out"
          }}
        >
          <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold" }}>
            Activity Logs
          </Typography>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#3f5930" }}>
                  <TableCell sx={{ color: "white" }}>User</TableCell>
                  <TableCell sx={{ color: "white" }}>Action</TableCell>
                  <TableCell sx={{ color: "white" }}>Timestamp</TableCell>
                  <TableCell sx={{ color: "white" }}>Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map(log => {
                  // Convert Firestore timestamp to a string if needed
                  let timeStr = "";
                  if (log.timestamp && log.timestamp.toDate) {
                    timeStr = log.timestamp.toDate().toLocaleString();
                  }
                  return (
                    <TableRow key={log.id}>
                      <TableCell>{log.user}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{timeStr}</TableCell>
                      <TableCell>
                        {/* If you stored details, you can show JSON or parse it */}
                        {log.details && JSON.stringify(log.details)}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {logs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No logs found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </>
  );
};

export default ActivityLogs;
