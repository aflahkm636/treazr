import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { URL } from '../../services/Api';
import ProductCard from "../../common/components/cards";
import Loading from '../../common/components/Loading';
import { useSearch } from './Products';

const ActionFigures = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { searchQuery } = useSearch();

  useEffect(() => {
    const fetchActionFigures = async () => {
      try {
        const response = await axios.get(`${URL}/products`);
        const actionFigures = response.data.filter(
          (product) => product.category.toLowerCase() === "action-figure"
        );
        setProducts(actionFigures);
        setFilteredProducts(actionFigures);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchActionFigures();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.brand && product.brand.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, products]);

  if (loading) {
    return <Loading name="Action figures" />;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Action Figures</h2>
      
      {filteredProducts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {searchQuery ? "No matching action figures found" : "No action figures available"}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ActionFigures;