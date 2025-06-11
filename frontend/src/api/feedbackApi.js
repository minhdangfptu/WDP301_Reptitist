import axiosClient from "./axiosClient";

const createFeedbackAndRatingApi = (productId,rating, comment) => {
    return axiosClient.post(`shop/products-feedbacks/${productId}`, {
        rating,
        comment
    });
};

const feedbackApi = {
    createFeedbackAndRatingApi
};
export default feedbackApi;

