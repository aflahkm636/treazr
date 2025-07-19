// components/Categories.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const categories = [
  { name: 'action-figures', image: 'https://i.pinimg.com/1200x/d6/ae/93/d6ae9327c89b54a469eb58c67884bad4.jpg', slug: 'products/action-figures' },
  { name: 'Diecast Cars', image: 'https://i.pinimg.com/1200x/0d/46/61/0d46615f14419a3223b56a5d5beb7638.jpg', slug: 'products/diecast-cars' },
  { name: 'Comics', image: 'https://i.pinimg.com/736x/cd/0f/90/cd0f90b9aa12a294679e311c405023e1.jpg', slug: 'products/comics' },
  { name: 'Trading Cards', image: 'https://i.pinimg.com/1200x/29/4a/b2/294ab27746705b329ebcd1275cb90df3.jpg', slug: 'products/TradingCards' },
];

function Categories() {
  return (
    <div className="py-8 px-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Shop by Category</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <Link
            to={`/${cat.slug}`}
            key={cat.slug}
            className="group block bg-white rounded-xl shadow-md hover:shadow-lg transition p-4"
          >
            <img
              src={cat.image}
              alt={cat.name}
              className="w-full h-32 object-cover rounded-md mb-3 group-hover:scale-105 transition-transform"
            />
            <p className="text-center text-lg font-medium group-hover:text-emerald-600">
              {cat.name}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Categories;
