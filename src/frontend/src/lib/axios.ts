import axios from 'axios';
import { useAuthStore } from '../stores/useAuthStore';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

/* 
Interceptor is the same as middleware in server side. It run before and after sending request.
Interceptor to auto set token to request header. 
*/
api.interceptors.request.use((config) => {
    const { accessToken } = useAuthStore.getState(); // getState() to get current accessToken;

    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    } else {
        console.log('Access token does not set!');
    }
    return config;
});

api.interceptors.response.use((res) => res, async (error) => {
    const originalRequest = error.config;
    if (originalRequest.url.includes("/auth/signin") ||
        originalRequest.url.includes("/auth/signup") ||
        originalRequest.url.includes("/auth/refresh")) {
        return Promise.reject(error);
    }
    originalRequest._retryCount = originalRequest._retryCount || 0;
    if (error.response?.status === 403 && originalRequest._retryCount < 4) {
        originalRequest._retryCount += 1;
        try {
            const res = await api.post("/auth/refresh", { withCredentials: true });
            const newAccessToken = res.data.accessToken;
            useAuthStore.getState().setAccessToken(newAccessToken);
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            return api(originalRequest);
        } catch (refreshError) {
            useAuthStore.getState().clearState();
            return Promise.reject(refreshError);
        }
    }
    return Promise.reject(error);
});

export default api;