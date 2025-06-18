import axiosClient from "./axiosClient";

const addToCartApi = (productId,quantity) => {
    return axiosClient.post("shop/cart/add-product", {
        product_id: productId,
        quantity: quantity
    });
}
const getCartApi = () => {
    return axiosClient.get("shop/my-cart");
}
const deleteProductFromCartApi = (cartItemId) => {
    return axiosClient.delete(`shop/cart/${cartItemId}`);
}
const deleteAllProductFromCartApi = () => {
    return axiosClient.delete("shop/my-cart");
}
const countCartItemsApi = () => {
    return axiosClient.get("shop/cart/count");
}
const checkProductAvailabilityApi = (productId) => {
    return axiosClient.get(`shop/cart/product/check/${productId}`);
}
const cartApi = {addToCartApi, getCartApi, deleteProductFromCartApi, deleteAllProductFromCartApi,countCartItemsApi, checkProductAvailabilityApi};
export default cartApi;

