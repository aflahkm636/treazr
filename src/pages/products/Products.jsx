import React from 'react'
import ProductNavbar from './ProductNavbar'
import { Outlet } from 'react-router-dom'

function Products() {
  return (
    <>
      <ProductNavbar/>
       <div className="container mx-auto p-4">
        <Outlet />
      </div>
    </>
  )
}

export default Products
