import axios from "axios";
import { URL } from "./Api";

export const updateUserWishlist = async (userId, updatedWishlist) => {
  try {
    const response = await axios.patch(`${URL}/users/${userId}`, {
      wishlist: updatedWishlist,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to update wishlist:", error);
    throw error;
  }
};
