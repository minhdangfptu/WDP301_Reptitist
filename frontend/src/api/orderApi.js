import axiosClient from './axiosClient';

export const getMyOrders = async () => {
  const res = await axiosClient.get('order/my-order');
  return res.data.data || res.data;
};

export const getOrderDetail = async (id) => {
  const res = await axiosClient.get(`order/get-order-by-id?id=${id}`);
  return res.data.data || res.data;
};

export const updateOrderStatus = async (id, status) => {
  const res = await axiosClient.get(`order/update-order-status?id=${id}&status=${status}`);
  return res.data.data || res.data;
};

export const softDeleteOrder = async (id) => {
  const res = await axiosClient.delete(`order/order/${id}`);
  return res.data.data || res.data;
};

export const createOrder = async (order_items, delivery_info) => {
  const res = await axiosClient.post('order/create-order', { order_items,delivery_info });
  return res.data.data || res.data;
}; 