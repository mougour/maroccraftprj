import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import CustomerSidebar from '../global/CustomerSidebar'; // Import the new CustomerSidebar

function CustomerDashboardLayout({ children }) {
  const location = useLocation();
  const user = JSON.parse(sessionStorage.getItem('user'));

  // If there's no logged in user or the user is not a customer, redirect to login
  // You might want to adjust this logic based on your exact authentication/authorization needs
  if (!user || user.role !== 'customer') { // Using 'costumer' to match the observed typo
    return <Navigate to="/login" replace />;
  }

  // You can add logic here to get the page title based on location.pathname if needed
  const getPageTitle = (pathname) => {
    const pathSegments = pathname.split('/').filter(segment => segment !== '');
    if (pathSegments.length === 0) return 'Dashboard';
    const lastSegment = pathSegments[pathSegments.length - 1];
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace('-', ' ');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <CustomerSidebar /> {/* Use the CustomerSidebar */}
      <div className={`lg:ml-64 transition-margin duration-300 ease-in-out `}>
        <header className="bg-white border-b border-gray-100">
          <div className="px-8 py-6">
             <h2 className="text-2xl font-semibold text-gray-800">
               {getPageTitle(location.pathname)}
             </h2>
          </div>
        </header>
        <main className="w-full max-w-7xl mx-auto px-8 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default CustomerDashboardLayout; 