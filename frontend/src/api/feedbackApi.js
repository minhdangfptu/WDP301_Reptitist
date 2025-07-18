import axiosClient from "./axiosClient";

const createFeedbackAndRatingApi = (productId,rating, comment) => {
    return axiosClient.post(`shop/products-feedbacks/${productId}`, {
        rating,
        comment
    });
};
const updateFeedbackAndRatingApi = (feedbackId, rating, comment) => {
    return axiosClient.put(`shop/products-feedbacks/${feedbackId}`, {
        rating,
        comment
    });
};
const deleteFeedbackAndRatingApi = (feedbackId) => {
    return axiosClient.delete(`shop/products-feedbacks/${feedbackId}`);
}

const feedbackApi = {
    createFeedbackAndRatingApi,
    updateFeedbackAndRatingApi,
    deleteFeedbackAndRatingApi
};
export default feedbackApi;
