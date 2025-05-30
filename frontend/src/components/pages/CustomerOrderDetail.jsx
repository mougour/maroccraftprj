import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns'; // Import date-fns
import { User } from 'lucide-react';

const CustomerOrderDetail = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        // Assuming an API endpoint for fetching a single order by ID
        const response = await axios.get(`http://localhost:5000/api/orders/${orderId}`);
        if (response.data.success) {
          setOrder(response.data.order);
          console.log('Order Data with Artisan:', response.data.order);
        } else {
          setOrder(null);
          setError(response.data.error || 'Failed to fetch order details.');
        }
      } catch (err) {
        setError('Failed to fetch order details.');
        console.error('Error fetching order details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading order details...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-red-600">Error: {error}</div>;
  }

  if (!order) {
    return <div className="flex justify-center items-center min-h-screen">Order not found.</div>;
  }

  // Get artisan ID from the first product in the order
  const artisanId = order.products?.[0]?.productId?.user?._id;
  console.log('Artisan ID:', artisanId);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
        {/* Artisan Profile Button - top right */}
        {artisanId && (
          <div className="flex justify-end mb-4">
            <button
              onClick={() => navigate(`/artisans/${artisanId}`)}
              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
            >
              <User size={18} /> Artisan Profile
            </button>
          </div>
        )}
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Details #{order._id.substring(0, 8)}</h2> {/* Shorten ID */}

        {/* Order Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-gray-600 text-sm">Order Date:</p>
            <p className="text-gray-800 font-medium">{order.orderDate ? format(new Date(order.orderDate), 'PPP') : 'N/A'}</p> {/* Format date */}
          </div>
          <div>
            <p className="text-gray-600 text-sm">Status:</p>
            <p className={`font-medium ${order.status === 'Pending' ? 'text-yellow-600' : order.status === 'Completed' ? 'text-green-600' : 'text-gray-600'}`}>
              {order.status || 'N/A'}
            </p>
          </div>
          <div className="md:col-span-2">
             <p className="text-gray-600 text-sm">Total Amount:</p>
            <p className="text-xl font-bold text-green-600">${order.totalAmount ? Number(order.totalAmount).toFixed(2) : '0.00'}</p> {/* Format total */}
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Order Items</h3>
          <div className="border-t border-b border-gray-200 divide-y divide-gray-200">
            {order.products && order.products.length > 0 ? (
              order.products.map((item) => (
                <div key={item._id} className="py-3 flex justify-between items-center text-sm">
                  <p className="text-gray-700">{item.quantity}x {item.productId?.name || 'Unknown Product'}</p>
                  <p className="text-gray-900 font-medium">${item.price ? Number(item.price * item.quantity).toFixed(2) : '0.00'}</p>
                </div>
              ))
            ) : (
              <div className="py-3 text-gray-600">No items in this order.</div>
            )}
          </div>
        </div>

        {/* Shipping and Payment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Shipping Address</h3>
            <p className="text-gray-700">{order.shippingAddress || 'N/A'}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Payment Status</h3>
            <p className="text-gray-700">{order.paymentStatus || 'N/A'}</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CustomerOrderDetail; 