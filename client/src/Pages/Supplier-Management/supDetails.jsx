import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

import './sup_details.css';
import NavBar from "./supNav.jsx";
//import Footer from "./supFooter.js";
//import { PDFDocument, rgb } from 'pdf-lib';

function SupDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [supplier, setSupplier] = useState(null);
  const [updatedSupplier, setUpdatedSupplier] = useState({
    SupplierName: '',
    SupplierContact: '',
    SupplierEmail: '',
    SupplierAddress: '',
    SupplierType: '',
    SupplierStatus: '',
    SupplierContractStartDate: '',
    SupplierContractEndDate: '',
    SupplierTotalOrders: '',
    SupplierProducts: '',
  });

  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const fetchSupplierDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/supplier/get/${id}`);
        console.log(response.data);
        setSupplier(response.data);
        setUpdatedSupplier({
          SupplierName: response.data.SupplierName,
          SupplierContact: response.data.SupplierContact,
          SupplierEmail: response.data.SupplierEmail,
          SupplierAddress: response.data.SupplierAddress,
          SupplierType: response.data.SupplierType,
          SupplierStatus: response.data.SupplierStatus,
          SupplierContractStartDate: response.data.SupplierContractStartDate,
          SupplierContractEndDate: response.data.SupplierContractEndDate,
          SupplierTotalOrders: response.data.SupplierTotalOrders,
          SupplierProducts: response.data.SupplierProducts,
        });
      } catch (error) {
        console.error("Error fetching supplier details:", error);
      }
    };

    fetchSupplierDetails();
  }, [id]);

  const handleUpdateClick = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdatedSupplier({ ...updatedSupplier, [name]: value });
  };

  const handleUpdateSubmit = async () => {
    try {
      await axios.put(`http://localhost:3000/supplier/update/${id}`, updatedSupplier);
      setOpenDialog(false);
      navigate(0); 
    } catch (error) {
      console.error("Error updating supplier:", error);
    }
  };


  const generatePDF = async () => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 750]);
  
    const titleFontSize = 24;
    const titleX = (page.getWidth() - titleFontSize * 8) / 2;
    page.drawText(`Supplier Details`, { x: titleX, y: 700, size: titleFontSize, color: rgb(0, 0, 0) });

    const fontSize = 12;
    let yPosition = 660; 
  
    const addSection = (title, content) => {
      page.drawText(title, { x: 50, y: yPosition, size: fontSize, color: rgb(0, 0, 0) });
      page.drawText(String(content), { x: 200, y: yPosition, size: fontSize, color: rgb(0, 0, 0) });
      yPosition -= 20; 
    };
  
    addSection("Supplier Name:", supplier.SupplierName);
    addSection("Supplier Contact:", supplier.SupplierContact);
    addSection("Supplier Email:", supplier.SupplierEmail);
    addSection("Supplier Address:", supplier.SupplierAddress);
    addSection("Supplier Type:", supplier.SupplierType);
    addSection("Supplier Status:", supplier.SupplierStatus);
    addSection("Contract Start Date:", supplier.SupplierContractStartDate);
    addSection("Contract End Date:", supplier.SupplierContractEndDate);
    addSection("Total Orders:", supplier.SupplierTotalOrders);
    addSection("Products Supplied:", supplier.SupplierProducts);
  
    yPosition -= 20; 
  
    addSection("Communication Rating:", supplier.performanceMetrics.communication);
    addSection("Quality Rating:", supplier.performanceMetrics.quality);
    addSection("Average Delivery Time:", supplier.performanceMetrics.averageDeliveryTime);
    addSection("On-Time Delivery Rate:", supplier.performanceMetrics.onTimeDeliveryRate);
    addSection("Last Updated:", supplier.performanceMetrics.lastUpdated);
  
    const pdfBytes = await pdfDoc.save();
  
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `supplier_${supplier._id}.pdf`;
    link.click();
  };

  if (!supplier) return <p>Loading...</p>;

  return (
    <div>
      <div className="supplier-detail-container">
        <h2>Supplier Details</h2><br/>
        <p><strong>Supplier Name:</strong> {supplier.SupplierName}</p>

        <div className="section-spacing">
          <p><strong>Contact:</strong> {supplier.SupplierContact}</p>
          <p><strong>Email:</strong> {supplier.SupplierEmail}</p>
          <p><strong>Address:</strong> {supplier.SupplierAddress}</p>
          <p><strong>Type:</strong> {supplier.SupplierType}</p>
          <p><strong>Status:</strong> {supplier.SupplierStatus}</p>
        </div>
        <br/>
        <div className="section-spacing">
          <p><strong>Contract Start Date:</strong> {supplier.SupplierContractStartDate}</p>
          <p><strong>Contract End Date:</strong> {supplier.SupplierContractEndDate}</p>
          <p><strong>Total Orders:</strong> {supplier.SupplierTotalOrders}</p>
          <p><strong>Products Supplied:</strong> {supplier.SupplierProducts}</p>
        </div>
        <br/>
        <div className="section-spacing">
          <p><strong>Communication Rating:</strong> {supplier.performanceMetrics.communication}</p>
          <p><strong>Quality Rating:</strong> {supplier.performanceMetrics.quality}</p>
          <p><strong>Average Delivery Time:</strong> {supplier.performanceMetrics.averageDeliveryTime}</p>
          <p><strong>On-Time Delivery Rate:</strong> {supplier.performanceMetrics.onTimeDeliveryRate}</p>
          <p><strong>Last Updated:</strong> {supplier.performanceMetrics.lastUpdated}</p>
        </div>

        <br/>

        <div className="button-group">
          <button onClick={handleUpdateClick}>Update</button><br/><br/>
          
          <button onClick={generatePDF}>Download Supplier Details</button>
        </div>
        
        <Dialog open={openDialog} onClose={handleCloseDialog}
  sx={{ 
    '& .MuiDialog-paper': { 
      backgroundColor: 'var(--primary-color)', 
      width: '400px', 
      maxWidth: '100%', 
    }
  }}>
  <DialogTitle
    sx={{ 
      backgroundColor: 'var(--accent-color)', 
      color: 'var(--white)' 
    }}>
    Edit Supplier Details
  </DialogTitle>

  <DialogContent>
    <div className="dialog-form">
      <label htmlFor="SupplierName">Supplier Name:</label>
      <input type="text" id="SupplierName" name="SupplierName" onChange={handleUpdateChange} value={updatedSupplier.SupplierName} />

      <label htmlFor="SupplierContact">Supplier Contact:</label>
      <input type="text" id="SupplierContact" name="SupplierContact" onChange={handleUpdateChange} value={updatedSupplier.SupplierContact} />

      <label htmlFor="SupplierEmail">Supplier Email:</label>
      <input type="email" id="SupplierEmail" name="SupplierEmail" onChange={handleUpdateChange} value={updatedSupplier.SupplierEmail} />

      <label htmlFor="SupplierAddress">Supplier Address:</label>
      <input type="text" id="SupplierAddress" name="SupplierAddress" onChange={handleUpdateChange} value={updatedSupplier.SupplierAddress} />

      <label htmlFor="SupplierType">Supplier Type:</label>
      <input type="text" id="SupplierType" name="SupplierType" onChange={handleUpdateChange} value={updatedSupplier.SupplierType} />

      <label htmlFor="SupplierContractStartDate">Contract Start Date:</label>
      <input type="date" id="SupplierContractStartDate" name="SupplierContractStartDate" onChange={handleUpdateChange} value={updatedSupplier.SupplierContractStartDate} />

      <label htmlFor="SupplierContractEndDate">Contract End Date:</label>
      <input type="date" id="SupplierContractEndDate" name="SupplierContractEndDate" onChange={handleUpdateChange} value={updatedSupplier.SupplierContractEndDate} />

      <label htmlFor="SupplierTotalOrders">Total Orders:</label>
      <input type="number" id="SupplierTotalOrders" name="SupplierTotalOrders" onChange={handleUpdateChange} value={updatedSupplier.SupplierTotalOrders} />

      <label htmlFor="SupplierProducts">Supplier Products:</label>
      <input type="text" id="SupplierProducts" name="SupplierProducts" onChange={handleUpdateChange} value={updatedSupplier.SupplierProducts} />
    </div>
  </DialogContent>

  <DialogActions>
    <button onClick={handleCloseDialog} 
      style={{
        backgroundColor: 'var(--dark-color)', 
        color: 'var(--white)',
        border: 'none',
        padding: '8px 16px',
        cursor: 'pointer'
      }}>
      Cancel
    </button>
    <button onClick={handleUpdateSubmit} 
      style={{
        backgroundColor: 'var(--dark-color)', 
        color: 'var(--white)',
        border: 'none',
        padding: '8px 16px',
        cursor: 'pointer'
      }}>
      Update
    </button>
  </DialogActions>
</Dialog>


      </div>
      
    </div>
  );
}

export default SupDetails;
