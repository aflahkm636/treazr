import React from 'react';
import { Link } from 'react-router-dom';

const categories = [
  { 
    name: 'Action Figures', 
    image: 'https://i.pinimg.com/1200x/d6/ae/93/d6ae9327c89b54a469eb58c67884bad4.jpg',
    slug: 'products/action-figures' 
  },
  { 
    name: 'Diecast Cars', 
    image: 'https://i.pinimg.com/1200x/0d/46/61/0d46615f14419a3223b56a5d5beb7638.jpg',
    slug: 'products/diecast-cars' 
  },
  { 
    name: 'Comics', 
    image: 'https://i.pinimg.com/736x/cd/0f/90/cd0f90b9aa12a294679e311c405023e1.jpg',
    slug: 'products/comics' 
  },
  { 
    name: 'Trading Cards', 
    image: 'https://i.pinimg.com/1200x/29/4a/b2/294ab27746705b329ebcd1275cb90df3.jpg',
    slug: 'products/TradingCards' 
  },
];

function Categories() {
  return (
    <div className="py-16 px-4 sm:px-8 lg:px-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-12 text-center text-gray-900">
          Curated Collections
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((cat) => (
            <Link
              to={`/${cat.slug}`}
              key={cat.slug}
              className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
            >
              {/* Image with gradient overlay */}
              <div className="relative h-64 w-full overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
              </div>
              
              {/* Category name */}
              <div className="absolute bottom-0 left-0 w-full p-6">
                <h3 className="text-2xl font-serif font-semibold text-white group-hover:text-gold-300 transition-colors duration-300">
                  {cat.name}
                </h3>
                <div className="mt-2 w-12 h-1 bg-amber-400 transform group-hover:scale-x-125 origin-left transition-transform duration-500" />
              </div>
              
              {/* Hover indicator */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-amber-400/30 transition-all duration-500 rounded-2xl pointer-events-none" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Categories;