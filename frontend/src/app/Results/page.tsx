"use client";
import React, { useEffect, useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import ArrowCircleRightOutlinedIcon from '@mui/icons-material/ArrowCircleRightOutlined';
import Image from "next/image";
import Link from "next/link";

interface Business {
  name: string;
  address: string;
  phone: string;
  website: string;
  instagram: string;
  facebook: string;
  linkedin: string;
  rating: number;
  user_ratings_total: number;
}

const Results: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);

  useEffect(() => {
    const data = localStorage.getItem("scrapedData");
    if (data) {
      try {
        setBusinesses(JSON.parse(data));
      } catch (error) {
        console.error("Error parsing scrapedData from localStorage:", error);
      }
    }
  }, []);

  const downloadExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Businesses");

    worksheet.columns = [
      { header: "Name", key: "name", width: 30 },
      { header: "Address", key: "address", width: 40 },
      { header: "Phone", key: "phone", width: 20 },
      { header: "Website", key: "website", width: 40 },
      { header: "Instagram", key: "instagram", width: 30 },
      { header: "Facebook", key: "facebook", width: 30 },
      { header: "LinkedIn", key: "linkedin", width: 30 },
      { header: "Rating", key: "rating", width: 10 },
      { header: "Total Reviews", key: "user_ratings_total", width: 15 },
    ];

    businesses.forEach((business) => {
      worksheet.addRow(business);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "KonarWorks_Businesses.xlsx");
  };

  const downloadPDF = () => {
    const doc = new jsPDF("l", "mm", "a4");
    doc.text("KonarWorks - Businesses", 14, 10);

    const tableColumn = [
      "Name",
      "Address",
      "Phone",
      "Website",
      "Instagram",
      "Facebook",
      "LinkedIn",
      "Rating",
      "Total Reviews",
    ];
    const tableRows: any[] = [];

    businesses.forEach((business) => {
      const rowData = [
        business.name,
        business.address,
        business.phone,
        business.website,
        business.instagram,
        business.facebook,
        business.linkedin,
        business.rating,
        business.user_ratings_total,
      ];
      tableRows.push(rowData);
    });

    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { overflow: "linebreak", cellWidth: "wrap", fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 40 },
        2: { cellWidth: 30 },
        3: { cellWidth: 40 },
        4: { cellWidth: 30 },
        5: { cellWidth: 30 },
        6: { cellWidth: 30 },
        7: { cellWidth: 10 },
        8: { cellWidth: 10 },
      },
      tableWidth: 'wrap',
    });
    
    doc.save("KonarWorks_Businesses.pdf");
  };

  return (
    <div className="flex flex-col w-full h-full relative items-center bg-gray-100">
      <h1 className="text-3xl font-bold mb-3">Download Links</h1>
      {businesses.length > 0 ? (
        <>
          <div className="flex gap-4 mb-4">
            <button
              onClick={downloadExcel}
              className="bg-green-700 text-white font-semibold px-4 py-2 rounded-md hover:bg-green-900 transition flex items-center gap-2"
            >
              <Image src="/excelicon.png" width={30} height={30} alt="Excel Icon" />
              Download Excel
            </button>
            <button
              onClick={downloadPDF}
              className="bg-red-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700 transition flex items-center gap-2"
            >
              <Image src="/pdficon.png" width={30} height={30} alt="PDF Icon" />
              Download PDF
            </button>
          </div>
          <Link href="/MainPage" className="font-medium text-xl mb-3 underline flex items-center gap-1">
            Let's Make a New Search <ArrowCircleRightOutlinedIcon />
          </Link>
          <ul className="bg-white w-10/12 border border-gray-300 rounded-md shadow-md p-4 max-h-[70vh] overflow-y-auto">
            {businesses.map((business, index) => (
              <li key={index} className="p-2 border-b border-gray-300 flex flex-col gap-1">
                <p className="flex items-center gap-2">
                  <BadgeOutlinedIcon />
                  <strong>Name:</strong> {business.name}
                </p>
                <p className="flex items-center gap-2">
                  <BusinessOutlinedIcon />
                  <strong>Address:</strong> {business.address}
                </p>
                <p className="flex items-center gap-2">
                  <LocalPhoneOutlinedIcon />
                  <strong>Phone:</strong> {business.phone}
                </p>
                <p className="flex items-center gap-2">
                  <LanguageOutlinedIcon />
                  <strong>Website:</strong>{" "}
                  {business.website !== "N/A" ? (
                    <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                      {business.website}
                    </a>
                  ) : (
                    "N/A"
                  )}
                </p>
                <p className="flex items-center gap-2">
                  <InstagramIcon />
                  <strong>Instagram:</strong>{" "}
                  {business.instagram !== "N/A" ? (
                    <a href={business.instagram} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                      {business.instagram}
                    </a>
                  ) : (
                    "N/A"
                  )}
                </p>
                <p className="flex items-center gap-2">
                  <FacebookIcon />
                  <strong>Facebook:</strong>{" "}
                  {business.facebook !== "N/A" ? (
                    <a href={business.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                      {business.facebook}
                    </a>
                  ) : (
                    "N/A"
                  )}
                </p>
                <p className="flex items-center gap-2">
                  <LinkedInIcon />
                  <strong>LinkedIn:</strong>{" "}
                  {business.linkedin !== "N/A" ? (
                    <a href={business.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                      {business.linkedin}
                    </a>
                  ) : (
                    "N/A"
                  )}
                </p>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>No businesses found.</p>
      )}
    </div>
  );
};

export default Results;
