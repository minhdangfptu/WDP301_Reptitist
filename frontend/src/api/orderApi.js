import axiosClient from './axiosClient';

export const getMyOrders = async () => {
  const res = await axiosClient.get('/my-order');
  return res.data.data || res.data;
};

export const getOrderDetail = async (id) => {
  const res = await axiosClient.get(`/get-order-by-id?id=${id}`);
  return res.data.data || res.data;
};

export const updateOrderStatus = async (id, status) => {
  const res = await axiosClient.get(`/update-order-status?id=${id}&status=${status}`);
  return res.data.data || res.data;
};

export const softDeleteOrder = async (id) => {
  const res = await axiosClient.delete(`/order/${id}`);
  return res.data.data || res.data;
}; 