import axios from 'axios';

const API_URL = 'https://agriconnect-k5uz.onrender.com/';

export const analyzeCrop = (data) => {
    return axios.post(`${API_URL}/crop-monitoring`, data);
};

export const detectPest = (data) => {
    return axios.post(`${API_URL}/pest-detection`, data);
};

export const getLegalInfo = () => {
    return axios.get(`${API_URL}/legal`);
};

export const getPricingInfo = () => {
    return axios.get(`${API_URL}/pricing`);
};

export const retrieveOfflineData = (data) => {
    return axios.post(`${API_URL}/offline-data/retrieve`, data);
};
