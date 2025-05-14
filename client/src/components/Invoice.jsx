import React from 'react';

const Invoice = ({ cartItems }) => {
  const totalAmount = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <div className="card mt-4">
      <div className="card-body">
        <h2 className="card-title">Invoice</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>${item.price}</td>
                <td>{item.quantity}</td>
                <td>${item.price * item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-3">
          <strong>Total: ${totalAmount}</strong>
        </div>
        <button className="btn btn-primary mt-3">Download Invoice</button>
      </div>
    </div>
  );
};

export default Invoice;