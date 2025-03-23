import './App.css'; 
import {
  Layout,
  Package,
  TrendingUp,
  Users,
  Truck,
  AlertTriangle,
  LogOut,
  User
} from 'lucide-react';
import { useState } from 'react';



// Dashboard View Component
const DashboardView = () => (
  <div className="p-6 space-y-6">
    <div className="grid grid-cols-4 gap-6">
      {[
        { label: 'Products', icon: Package },
        { label: 'Sales', icon: TrendingUp },
        { label: 'Suppliers', icon: Users },
        { label: 'Customers', icon: Users },
      ].map(({ label, icon: Icon }) => (
        <div key={label} className="bg-white rounded-lg shadow p-6 block block-col items-center">
          <Icon className="h-10 w-10 text-blue-600 mb-2" />
          <h3 className="text-lg font-semibold text-gray-800">{label}</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">0</p>
        </div>
      ))}
    </div>


    <div className="grid grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Delivery Tracking</h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Truck className="h-5 w-5 text-blue-600" />
                <span className="text-gray-700">Delivery #{i}</span>
              </div>
              <span className="text-green-600">In Transit</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Low Stock Products</h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <span className="text-gray-700">Product #{i}</span>
              </div>
              <span className="text-orange-500">Low Stock</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Products View Component
const ProductsView = () => (
  <div className="p-6">
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Products Management</h2>
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Package className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-medium">Product #{i}</h3>
                <p className="text-sm text-gray-500">Stock: {Math.floor(Math.random() * 100)} units</p>
              </div>
            </div>
            <span className="text-blue-600">$99.99</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Sales View Component
const SalesView = () => (
  <div className="p-6">
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Sales Overview</h2>
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <h3 className="font-medium">Order #{i}</h3>
                <p className="text-sm text-gray-500">Customer: John Doe</p>
              </div>
            </div>
            <span className="text-green-600">$199.99</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Suppliers View Component
const SuppliersView = () => (
  <div className="p-6">
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Suppliers Directory</h2>
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <h3 className="font-medium">Supplier #{i}</h3>
                <p className="text-sm text-gray-500">Products: {Math.floor(Math.random() * 50)}</p>
              </div>
            </div>
            <span className="text-purple-600">Active</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Customers View Component
const CustomersView = () => (
  <div className="p-6">
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Customer Management</h2>
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-indigo-600" />
              <div>
                <h3 className="font-medium">Customer #{i}</h3>
                <p className="text-sm text-gray-500">Orders: {Math.floor(Math.random() * 20)}</p>
              </div>
            </div>
            <span className="text-indigo-600">Regular</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Delivery Tracking View Component
const DeliveryTrackingView = () => (
  <div className="p-6">
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Active Deliveries</h2>
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Truck className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-medium">Delivery #{i}</h3>
                <p className="text-sm text-gray-500">ETA: {Math.floor(Math.random() * 60)} mins</p>
              </div>
            </div>
            <span className="text-blue-600">In Transit</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'products':
        return <ProductsView />;
      case 'sales':
        return <SalesView />;
      case 'suppliers':
        return <SuppliersView />;
      case 'customers':
        return <CustomersView />;
      case 'delivery':
        return <DeliveryTrackingView />;
      default:
        return <DashboardView />;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Layout },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'sales', label: 'Sales', icon: TrendingUp },
    { id: 'suppliers', label: 'Suppliers', icon: Users },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'delivery', label: 'Delivery Tracking', icon: Truck },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg fixed h-full">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-blue-600">Nayana Pharma</h1>
        </div>

        <nav className="mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex items-center space-x-3 px-4 py-3 cursor-pointer ${
                  currentView === item.id
                    ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                    : 'hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </div>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full">
          <div className="flex items-center space-x-3 px-4 py-3 cursor-pointer hover:bg-gray-100">
            <LogOut className="h-5 w-5 text-red-500" />
            <span className="text-red-500">Logout</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
     <div className="ml-64 flex-1">{renderView()}</div>
    </div>
  );
}

export default App;


