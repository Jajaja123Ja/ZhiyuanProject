import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
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
  Typography,
} from "@mui/material";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import Navbar from "../Components/Navbar";
import Sidebar from "../Components/Sidebar";

const ItemsToPromote = () => {
  const [cues, setCues] = useState({ BILMAGIC: [], PERI: [], KONLENN: [] });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const fetchCuesToPromote = async () => {
      try {
        const inventoryCollection = collection(db, "Inventory");
        const snapshot = await getDocs(inventoryCollection);

        const itemsData = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
            ENDINGSTOCK: Number(doc.data().ENDINGSTOCK) || 0,
          }))
          .filter(
            (item) =>
              ["PLAYING CUE", "JUMP CUE", "BREAK CUE"].includes(item.CATEGORY)
          );

        const categorizedCues = { BILMAGIC: [], PERI: [], KONLENN: [] };

        itemsData.forEach((item) => {
          if (item.CODE.startsWith("BLMGC")) {
            categorizedCues.BILMAGIC.push(item);
          } else if (item.CODE.startsWith("PERI")) {
            categorizedCues.PERI.push(item);
          } else if (item.CODE.startsWith("KL")) {
            categorizedCues.KONLENN.push(item);
          }
        });

        const filterTopCues = (cueList, limit) => {
          if (cueList.length === 0) return [];
          
          cueList.sort((a, b) => b.ENDINGSTOCK - a.ENDINGSTOCK);
          
          let topCues = cueList.filter((cue) => cue.ENDINGSTOCK > 50);
          if (topCues.length < limit) {
            const remaining = cueList.filter((cue) => cue.ENDINGSTOCK > 0 && cue.ENDINGSTOCK <= 50);
            topCues = topCues.concat(remaining.slice(0, limit - topCues.length));
          }
          
          return topCues.slice(0, limit);
        };

        categorizedCues.BILMAGIC = filterTopCues(categorizedCues.BILMAGIC, 20);
        categorizedCues.PERI = filterTopCues(categorizedCues.PERI, 10);
        categorizedCues.KONLENN = filterTopCues(categorizedCues.KONLENN, 10);

        setCues(categorizedCues);
      } catch (error) {
        console.error("Error fetching cues:", error);
      }
    };

    fetchCuesToPromote();
  }, []);

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Top Cues to Promote", 14, 15);
    let startY = 25;

    Object.keys(cues).forEach((brand) => {
      if (cues[brand].length > 0) {
        doc.setFontSize(14);
        doc.text(brand, 14, startY);
        startY += 5;

        const headers = [["Code", "Product Name", "Type", "Ending Stock"]];
        const data = cues[brand].map((item) => [
          item.CODE,
          item.PRODUCTNAME,
          item.CATEGORY,
          item.ENDINGSTOCK,
        ]);

        doc.autoTable({
          head: headers,
          body: data,
          startY: startY + 5,
        });

        startY = doc.lastAutoTable.finalY + 10;
      }
    });

    doc.save("Top_Cues_To_Promote.pdf");
  };

  return (
    <>
      <Navbar isHovered={isHovered} />
      <Box sx={{ display: "flex", marginTop: "64px" }}>
        <Sidebar isHovered={isHovered} setIsHovered={setIsHovered} />
        <Box sx={{ flexGrow: 1, padding: 3 }}>
          <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold", color: "#96720b" }}>
            Top Cues to Promote
          </Typography>
          <Button variant="contained" color="primary" onClick={downloadPDF} sx={{ mb: 2 }}>
            Download PDF
          </Button>
          {Object.keys(cues).map((brand) => (
            <Box key={brand} sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ mb: 2, color: "#3f5930" }}>
                {brand}
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#3f5930" }}>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>Code</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>Product Name</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>Type</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>Ending Stock</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cues[brand].map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.CODE}</TableCell>
                        <TableCell>{item.PRODUCTNAME}</TableCell>
                        <TableCell>{item.CATEGORY}</TableCell>
                        <TableCell>{item.ENDINGSTOCK}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ))}
        </Box>
      </Box>
    </>
  );
};

export default ItemsToPromote;
