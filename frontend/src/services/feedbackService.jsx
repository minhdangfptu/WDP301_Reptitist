import feedbackApi from '../api/feedbackApi';

export  const createFeedbackAndRating = async (productId, rating, comment) => {
  try {
    const response = await feedbackApi.createFeedbackAndRatingApi(productId, rating, comment);
    return response.data;
  } catch (error) {
    console.error('Error creating feedback and rating:', error);
    throw error;
  }
}