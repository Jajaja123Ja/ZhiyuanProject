import React, { useState } from "react";
import * as XLSX from "xlsx";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  writeBatch,
  serverTimestamp
} from "firebase/firestore";

const desiredSheets = [
  "BM SUMMARY (FEB)",
  "KL SUMMARY (FEB)",
  "PERI SUMMARY (FEB)"
];

const ExcelUploader = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Function to handle missing values
  const safe = (val) => (val === undefined || val === null || val === "" ? "" : val.toString().trim());

  const handleUpload = async () => {
    if (!file) {
      alert("Please select an Excel file first.");
      return;
    }

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });

      for (const sheetName of desiredSheets) {
        if (!workbook.Sheets[sheetName]) {
          console.warn(`Sheet "${sheetName}" not found.`);
          continue;
        }

        const ws = workbook.Sheets[sheetName];

        // Extract all rows first
        let allRows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

        console.log("Raw Extracted Rows:", allRows.slice(0, 10)); // Debug first 10 rows

        // Identify and skip title rows
        let headerRowIndex = 0;
        for (let i = 0; i < allRows.length; i++) {
          if (allRows[i].includes("CODE")) {
            headerRowIndex = i;
            break;
          }
        }

        console.log("Detected Header Row Index:", headerRowIndex);

        // Extract headers from the detected row
        const headers = allRows[headerRowIndex].map((h) => (h ? h.trim() : ""));
        console.log("Extracted Headers:", headers);

        // Ensure headers are valid
        if (!headers.includes("CODE") || !headers.includes("CATEGORY")) {
          console.error("Headers not detected correctly. Check Excel format.");
          alert("Error: Column headers were not detected properly.");
          return;
        }

        // Manually map columns to avoid shifting errors
        const columnMap = {
          CODE: "CODE",
          CATEGORY: "CATEGORY",
          BRAND: "BRAND",
          PRODUCTNAME: "PRODUCT NAME",
          TIPSIZE: "TIP SIZE",
          PRICE: "PRICE",
          OPENINGSTOCK: "OPENING STOCK",
          INDELIVERY: "IN (DELIVERY)",
          INRTS: "IN (RTS)",
          INYUANREPAIRED: "IN (YUAN REPAIRED)",
          OUTSALE: "OUT (SALE)",
          OUTDAMAGED: "OUT (DAMAGED)",
          OUTFREEBIES: "OUT (FREEBIE/S)",
          ENDINGSTOCK: "ENDING STOCK",
          STATUS: "STATUS"
        };

        // Extract data starting from the row AFTER the headers
        let rows = XLSX.utils.sheet_to_json(ws, {
          header: headers,
          range: headerRowIndex + 1,
          defval: "",
          raw: false,
        });

        console.log("First 5 Parsed Rows:", rows.slice(0, 5));

        let lastBrand = ""; // Keep track of last non-empty brand

        for (const row of rows) {
          if (!row[columnMap.CODE] || row[columnMap.CODE].trim() === "") {
            console.warn("Skipping row due to missing CODE:", row);
            continue; // Skip rows with empty CODE
          }

          // Fill missing BRAND values from previous row
          let brandVal = safe(row[columnMap.BRAND]);
          if (!brandVal) {
            brandVal = lastBrand;
          } else {
            lastBrand = brandVal;
          }

          // Extract other fields with correct mapping
          const docData = {
            CODE: safe(row[columnMap.CODE]),
            CATEGORY: safe(row[columnMap.CATEGORY]),
            BRAND: brandVal,
            PRODUCTNAME: safe(row[columnMap.PRODUCTNAME]),
            TIPSIZE: safe(row[columnMap.TIPSIZE]),
            PRICE: safe(row[columnMap.PRICE]).replace(/[P,]/g, ""), // Clean price
            OPENINGSTOCK: safe(row[columnMap.OPENINGSTOCK]),
            INDELIVERY: safe(row[columnMap.INDELIVERY]),
            INRTS: safe(row[columnMap.INRTS]),
            INYUANREPAIRED: safe(row[columnMap.INYUANREPAIRED]),
            OUTSALE: safe(row[columnMap.OUTSALE]),
            OUTDAMAGED: safe(row[columnMap.OUTDAMAGED]),
            OUTFREEBIES: safe(row[columnMap.OUTFREEBIES]),
            ENDINGSTOCK: safe(row[columnMap.ENDINGSTOCK]),
            STATUS: safe(row[columnMap.STATUS]) || "OK", // Default to OK
            CREATED_AT: serverTimestamp()
          };

          console.log("Sheet:", sheetName);
          console.log("Processed Row:", docData);

          await addDoc(collection(db, "Inventory"), docData);
        }
      }

      alert("Import complete!");
    } catch (err) {
      console.error("Error importing Excel:", err);
      alert("Failed to import Excel. See console for details.");
    }
  };

  // Handler for deleting ALL docs in `Inventory`
  const handleDeleteAll = async () => {
    if (!window.confirm("Are you sure you want to delete ALL Inventory docs?")) {
      return;
    }

    try {
      const snapshot = await getDocs(collection(db, "Inventory"));
      const batch = writeBatch(db);
      snapshot.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });
      await batch.commit();
      alert("All Inventory docs have been deleted!");
    } catch (error) {
      console.error("Error deleting inventory docs:", error);
      alert("Failed to delete Inventory docs. See console for details.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Excel Import</h2>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
      <button onClick={handleUpload}>Import to Firestore</button>

      <hr />

      <button
        onClick={handleDeleteAll}
        style={{ backgroundColor: "red", color: "white" }}
      >
        Delete All Inventory
      </button>
    </div>
  );
};

export default ExcelUploader;
