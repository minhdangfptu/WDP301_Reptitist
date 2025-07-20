// src/api/reportApi.js
import axiosClient from "./axiosClient";

const reportApi = {
  reportProduct: (product_id, reason, description) => {
    const url = "/product-reports";
    console.log('Sending POST to:', url, { product_id, reason, description });
    return axiosClient.post(url, { product_id, reason, description });
  },
};

export default reportApi;