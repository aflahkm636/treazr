import React from 'react'
import { useSearch } from './Products'

const ProductSearch = () => {
  const { searchQuery, setSearchQuery } = useSearch()

  return (
    <div className="mb-8 max-w-md mx-auto">
      <div className="relative">
        <input
          type="text"
          placeholder="Search all products..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}

export default ProductSearch