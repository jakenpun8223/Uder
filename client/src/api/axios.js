import axios from 'axios';

export default axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', // Your Backend URL
    withCredentials: true // CRITICAL: Sends the HttpOnly Cookie
});