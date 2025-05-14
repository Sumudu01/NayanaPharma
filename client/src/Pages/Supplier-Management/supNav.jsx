import React, { useState } from "react";
import { Link } from "react-router-dom";
import {  InputBase } from "@mui/material";

import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';

import "./supplier_management.css";
import NayanaPharmaLogo from "./NayanaPharmaLogo.png";

function Navbar() {
  //const [openMenu, setOpenMenu] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search/${searchQuery}`);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <>

      {/* Sub-navbar */}
      <div className="subnav-container">

        <div className="logo-container">
          <Link to = "/supDashboard">
          <p className="logo-container"><img src={NayanaPharmaLogo} alt="logo" className="logo-small"/></p>
          </Link>
        </div>

        <div className="search-container">
          <InputBase
            placeholder="Search suppliers..."
            inputProps={{ 'aria-label': 'search' }}
            className="subnav-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <SearchIcon className="search-icon" onClick={handleSearch} />
        </div>
        <div className="link-container">
          <Link to="/supAdd" className="subnav-link" aria-label="Add Supplier">Add Supplier</Link>
          <Link to="/supAll" className="subnav-link" aria-label="View All Suppliers">View All Suppliers</Link>
        </div>
      </div>
    </>
  );
}

export default Navbar;
