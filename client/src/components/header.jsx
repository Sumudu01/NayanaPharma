import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  FaUser, 
  FaBox, 
  FaPlusCircle, 
  FaList, 
  FaTruck, 
  FaDollarSign,
  FaUsers,
  FaChartBar,
  FaShoppingCart,
  FaCapsules
} from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';
import './header.css';  

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);

  return (
    <header className="header">
      <div className="header-container">
        {/* Brand Name with Capsule Icon instead of Logo */}
        <Link to='/' className="logo-container">
          <FaCapsules className="brand-icon" />
          <span className="brand-name">Nayana Pharma</span>
        </Link> 

        {/* Main Navigation */}
        <nav className="nav-menu">
          <ul className="nav-list">
            {/* Inventory Dropdown */}
            <li className="nav-item dropdown">
              <div className="nav-link">
                <FaBox className="nav-icon" />
                <span>Inventory</span>
                <div className="dropdown-content">
                  <Link to='/inventory/ProductDashboard'>
                    <MdDashboard className="dropdown-icon" />
                    <span>Dashboard</span>
                  </Link>
                  <Link to='/inventory/add'>
                    <FaPlusCircle className="dropdown-icon" />
                    <span>New Product</span>
                  </Link>
                  <Link to='/inventory/list'>
                    <FaList className="dropdown-icon" />
                    <span>All Products</span>
                  </Link>
                </div>
              </div>
            </li>

            {/* Sales Dropdown */}
            <li className="nav-item dropdown">
              <div className="nav-link">
                <FaDollarSign className="nav-icon" />
                <span>Sales</span>
                <div className="dropdown-content">
                  <Link to='/Saleshome'>
                    <FaShoppingCart className="dropdown-icon" />
                    <span>Billing</span>
                  </Link>
                  <Link to='/sales/report'>
                    <FaChartBar className="dropdown-icon" />
                    <span>Sales Report</span>
                  </Link>
                </div>
              </div>
            </li>

            {/* Suppliers Dropdown - Updated with sub-navigation */}
            <li className="nav-item dropdown">
              <div className="nav-link">
                <FaBox className="nav-icon" />
                <span>Suppliers</span>
                <div className="dropdown-content">
                  <Link to='/Suplier'>
                    <MdDashboard className="dropdown-icon" />
                    <span>Supplier Dashboard</span>
                  </Link>
                  <Link to='/supAdd'>
                    <FaPlusCircle className="dropdown-icon" />
                    <span>Add Supplier</span>
                  </Link>
                  <Link to='/supAll'>
                    <FaList className="dropdown-icon" />
                    <span>View All Suppliers</span>
                  </Link>
                </div>
              </div>
            </li>

            {/* Customers */}
            <li className="nav-item">
              <Link to='/customers' className="nav-link">
                <FaUsers className="nav-icon" />
                <span>Customers</span>
              </Link>
            </li>

            {/* Deliveries */}
            <li className="nav-item">
              <Link to='/deliveries' className="nav-link">
                <FaTruck className="nav-icon" />
                <span>Deliveries</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* Profile/Sign In */}
        <div className="profile-section">
          <Link to='/profile' className="profile-link">
            {currentUser ? (
              <img src={currentUser.profilePicture} alt='Profile' className='profile-img' />
            ) : (
              <>
                <FaUser className="profile-icon" />
                <span>Sign In</span>
              </>
            )}
          </Link>  
        </div>
      </div>   
    </header>
  );
}


