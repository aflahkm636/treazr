import axios from "axios";
import { URL } from "./Api";

export async function GetAllProducts(start = 0, end = 100) {
  try {
    const response = await axios.get(`${URL}/products`);
    let data = response.data;

    // Slice using start and end
    data = data.slice(start, end);

    return data;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function GetProductById(id) {
  const response = await fetch(`http://localhost:3000/products/${id}`);
  if (!response.ok) throw new Error("Product not found");
  return response.json();
}
