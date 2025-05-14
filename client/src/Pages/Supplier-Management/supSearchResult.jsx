import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress } from "@mui/material";
import NavBar from "./supNav.jsx";
import "./supplier_management.css";


const SupSearchResult = () => {
    const { query } = useParams();
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSearchResults = async () => {
            try {
                const response = await fetch(`http://localhost:8070/supplier/search/${query}`);
                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }
                const data = await response.json();
                setSearchResults(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchSearchResults();
    }, [query]);

    const handleView = (id) => {
        navigate(`/supplier/${id}`);
    };

    if (loading) return <CircularProgress className="loading-spinner" />;

    return (
        <div className="search-results-container">
            <NavBar />
            <br />
            <p className="supplier-table-main-heading" style={{ fontSize: "1.5rem", fontWeight: "bold", textAlign: "center", color: "var(--dark-color)" }}>Search Results for "{query}"</p>
            
            <div className="supplier-table-container" style={{ fontWeight: "bold", color: "var(--dark-color)" }}>
                <TableContainer component={Paper} className="supplier-table-wrapper">
                    <Table className="supplier-table-summary">
                        <TableHead>
                            <TableRow className="supplier-table-header-row">
                                <TableCell className="supplier-table-header">Supplier Name</TableCell>
                                <TableCell className="supplier-table-header">Contact</TableCell>
                                <TableCell className="supplier-table-header">Email</TableCell>
                                <TableCell className="supplier-table-header">Address</TableCell>
                                <TableCell className="supplier-table-header">Type</TableCell>
                                <TableCell className="supplier-table-header">Status</TableCell>
                                <TableCell className="supplier-table-header">Total Orders</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {searchResults.length > 0 ? (
                                searchResults.map((supplier) => (
                                    <TableRow 
                                        key={supplier._id} 
                                        className="supplier-table-row"
                                        onClick={() => handleView(supplier._id)}
                                    >
                                        <TableCell className="supplier-table-data">{supplier.SupplierName}</TableCell>
                                        <TableCell className="supplier-table-data">{supplier.SupplierContact}</TableCell>
                                        <TableCell className="supplier-table-data">{supplier.SupplierEmail}</TableCell>
                                        <TableCell className="supplier-table-data">{supplier.SupplierAddress}</TableCell>
                                        <TableCell className="supplier-table-data">{supplier.SupplierType}</TableCell>
                                        <TableCell className={`supplier-status ${supplier.SupplierStatus === "Active" ? "active-status" : "inactive-status"}`}>
                                            {supplier.SupplierStatus}
                                        </TableCell>
                                        <TableCell className="supplier-table-data">{supplier.SupplierTotalOrders}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="no-results">No results found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
        </div>
    );
};

export default SupSearchResult;
