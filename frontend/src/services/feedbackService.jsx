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
export const updateFeedbackAndRating = async (feedbackId, rating, comment) => {
  try {
    const response = await feedbackApi.updateFeedbackAndRatingApi(feedbackId, rating, comment);
    return response.data;
  } catch (error) {
    console.error('Error updating feedback and rating:', error);
    throw error;
  }
}
export const deleteFeedbackAndRating = async (feedbackId) => {
  try {
    const response = await feedbackApi.deleteFeedbackAndRatingApi(feedbackId);
    return response.data;
  } catch (error) {
    console.error('Error deleting feedback and rating:', error);
    throw error;
  }
}

