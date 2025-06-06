import axiosClient from "./axiosClient";

export const loginApi = (username, password) => {
    return axiosClient.post('/auth/login', {
        username,
        password
    });
};
export const refreshTokenApi = (refreshToken) => {
    return axiosClient.post('/refresh-token', {
        refreshToken
    });
};
export const signupApi = (username,password,email) => {
    return axiosClient.post('/signup', {
        username,
        password,
        email
    });
};
export const logoutApi = (refreshToken) => {
    return axiosClient.post('/logout', {
        refreshToken
    });
};
export const googleLoginApi = () => {
    return axiosClient.get('/auth/google');
};