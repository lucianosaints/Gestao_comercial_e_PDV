import API_BASE_URL from './config';
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? `${API_BASE_URL}'
    : `http://${window.location.hostname}:8000`; // Na AWS, usa o IP da URL

export default API_BASE_URL;