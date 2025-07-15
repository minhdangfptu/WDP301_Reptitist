import paymentApi from "../api/paymentApi";

export const createPayment = async (data) => {
    try {
        const response = await paymentApi.createVNPayTransaction(data);
        return response.data;
    } catch (error) {
        console.error('Error to create transaction:', error);
    throw error;
    }
};
export const getTransactionHistory = async (dayRange) => {
    try {
        const response = await paymentApi.getTransactionHistory(dayRange);
        return response.data;
    } catch (error) {
        console.error('Error to get transaction history:', error);
        throw error;
    }
}
