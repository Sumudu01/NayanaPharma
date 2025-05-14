import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/header';
import Home from './Pages/Home';
import Login from './Pages/Signin';
import Chathome from './Pages/Home'
import Register from './Pages/SignUp';
import AddItem from './Pages/AddItem';
import UpdateItem from './Pages/UpdateItem';
import PaymentProfileAll from './Pages/paymentProfileAll';
import ItemProfile from './Pages/ItemProfile';
import SalesReport from './Pages/SalesReport';
import Profie from './Pages/Profile';
import api from 'axios';
import MedicineSales from './Pages/MedicineSales';
import Suplier from './Pages/Supplier-Management/supDashboard';
import Cart from './components/Cart';
import MainDashboard from './Pages/MainDashboard';
import MedicineSearch from './components/MedicineSearch';
import DeliveryDashboard from './Pages/DeliveryDashboard';
import SupplierDashboard from './Pages/Supplier-Management/supDashboard';
import SupplierAdd from './Pages/Supplier-Management/supAdd';
import SupplierAll from './Pages/Supplier-Management/supAll';
import UsersList from './Pages/UserList';
import SupDetails from './Pages/Supplier-Management/supDetails';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
         
          <Route path="/" element={<MainDashboard/>} />
          <Route path="/login" element={<Login />} />

          <Route path="/Saleshome" element={<Home />} />
          <Route path="/inventory/add" element={<AddItem />} />
          <Route path="/inventory/ProductDashboard" element={<PaymentProfileAll />} />
          <Route path="/inventory/list" element={<ItemProfile />} />
          <Route path="/register" element={<Register />} />
          <Route path="/inventory/update/:id" element={<UpdateItem />} />
          <Route path="/Suplier" element={<Suplier />} />
          <Route path="/supDashboard" element={<SupplierDashboard />} />
          <Route path="/supAdd" element={<SupplierAdd />} />
          <Route path="/supAll" element={<SupplierAll />} />
          <Route path="/supplier/:id" element={<SupDetails />} />
          
          <Route path="/cart" element={<MedicineSearch />} />
          <Route path="/sales/report" element={<SalesReport />} />
          <Route path="/sales/medicine" element={<MedicineSales />} />
          <Route path="/deliveries" element={<DeliveryDashboard />} />
          <Route path="/customers" element={<UsersList />} />
          <Route path="/profile" element={<Profie />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 



