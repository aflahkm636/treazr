// services/updateUserCart.js
import axios from "axios";
import { URL } from "./Api";

export const updateUserCart = async (userId, updatedCart) => {
  try {
    const response = await axios.patch(`${URL}/users/${userId}`, {
      cart: updatedCart,
    });

    const updatedUser = response.data;

    // ✅ Save updated user to localStorage
    localStorage.setItem("user", JSON.stringify(updatedUser));

    return updatedUser;
  } catch (error) {
    console.error("Failed to update cart:", error);
    throw error;
  }
};
