import cartApi from '../api/cartApi';

const addToCartService = async (productId, quantity) => {
  try {
    const response = await cartApi.addToCartApi(productId, quantity);
    return response.data;
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw error;
  }
}
const getCartService = async () => {
  try {
    const response = await cartApi.getCartApi();
    return response.data;
  } catch (error) {
    console.error("Error fetching cart:", error);
    throw error;
  }
}
const deleteProductFromCartService = async (cartItemId) => {
  try {
    const response = await cartApi.deleteProductFromCartApi(cartItemId);
    return response.data;
  } catch (error) {
    console.error("Error deleting product from cart:", error);
    throw error;
  }
}
const deleteAllProductFromCartService = async () => {
  try {
    const response = await cartApi.deleteAllProductFromCartApi();
    return response.data;
  } catch (error) {
    console.error("Error deleting all products from cart:", error);
    throw error;
  }
}
const countCartItemsService = async () => {
  try {
    const response = await cartApi.countCartItemsApi();
    return response.data;
  } catch (error) {
    console.error("Error counting cart items:", error);
    throw error;
  }
}
const checkProductAvailabilityService = async (productId) => {
  try {
    const response = await cartApi.checkProductAvailabilityApi(productId);
    return response.data;
  } catch (error) {
    console.error("Error checking product availability:", error);
    throw error;
  }
}

export { addToCartService, getCartService,countCartItemsService, deleteProductFromCartService, deleteAllProductFromCartService, checkProductAvailabilityService };    