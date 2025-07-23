import React, { useState, createContext, useContext } from 'react'
import ProductNavbar from './ProductNavbar'
import { Outlet } from 'react-router-dom'
import ProductSearch from './ProductSearch'

// Create context for search
export const SearchContext = createContext()

function Products() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery }}>
      <ProductNavbar/>
      <div className="container mx-auto p-4">
        {/* <ProductSearch /> */}
        <Outlet />
      </div>
    </SearchContext.Provider>
  )
}

// Custom hook to use search context
export const useSearch = () => useContext(SearchContext)

export default Products