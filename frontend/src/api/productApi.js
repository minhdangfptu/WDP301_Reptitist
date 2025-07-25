import axiosClient from "./axiosClient";

export const checkStockAvailability = async (productId) => {
  const res = await axiosClient.get(`/shop/products/check-stock-availability/${productId}` );
  console.log("Stock availability response:", res.data);
  return res.data.data || res.data;
  
}