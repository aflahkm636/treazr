import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../common/context/AuthProvider';

const OrderStatus = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, setUser } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      try {
        const userResponse = await axios.get(`http://localhost:3000/users/${user.id}`);
        setUser(userResponse.data);

        const foundOrder = userResponse.data.orders.find(o => o.id === orderId);
        setOrder(foundOrder || null);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching order details:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id, orderId]);

  if (loading) return <div>Loading...</div>;
  if (!order) return <div>Order not found</div>;

  return (
    <div className="order-details-container">
      <h2>Order Details</h2>
      <div className="order-info">
        <p><strong>Order ID:</strong> {order.id}</p>
        <p><strong>Order Date:</strong> {new Date(order.date).toLocaleString()}</p>
        <p><strong>Status:</strong> <span className={`status-${order.status}`}>{order.status}</span></p>
        <p><strong>Payment Method:</strong> {order.paymentMethod.toUpperCase()}</p>
        <p><strong>Total:</strong> ${order.total.toFixed(2)}</p>
      </div>
      
      <div className="shipping-info">
        <h3>Shipping Address</h3>
        <p>{order.shippingAddress.street}</p>
        <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
        <p>{order.shippingAddress.country}</p>
      </div>
      
      <div className="order-items">
        <h3>Order Items</h3>
        {order.items.map((item, index) => (
          <div key={index} className="order-item">
            <img src={item.image} alt={item.name} width="60" />
            <div className="item-details">
              <h4>{item.name}</h4>
              <p>${item.price.toFixed(2)} x {item.quantity}</p>
            </div>
            <div className="item-total">
              ${(item.price * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderStatus;
