// components/Categories.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const categories = [
  { name: 'action-figures', image: 'https://i.pinimg.com/1200x/d6/ae/93/d6ae9327c89b54a469eb58c67884bad4.jpg', slug: 'action-figure' },
  { name: 'Diecast Cars', image: 'https://i.pinimg.com/1200x/0d/46/61/0d46615f14419a3223b56a5d5beb7638.jpg', slug: 'Diecast Cars' },
  { name: 'Comics', image: '/images/comics.jpg', slug: 'comics' },
  { name: 'Games', image: '/images/games.jpg', slug: 'games' },
];

function Categories() {
  return (
    <div className="py-8 px-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Shop by Category</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <Link
            to={`/category/${cat.slug}`}
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
