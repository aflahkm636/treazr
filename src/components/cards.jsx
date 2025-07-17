// cards/ProductCard.js
import React from 'react';

const ProductCard = ({ product }) => {
  return (
    <div className="product-card">
      <div className="product-image">
        <img src={product.image || '/default-product.jpg'} alt={product.name} />
      </div>
      <div className="product-details">
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <div className="product-price">${product.price}</div>
        <button className="add-to-cart">Add to Cart</button>
      </div>
    </div>
  );
};

export default ProductCard;