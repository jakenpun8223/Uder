import axios from 'axios';

export default axios.create({
    baseURL: 'http://localhost:5000/api', // Your Backend URL
    withCredentials: true // CRITICAL: Sends the HttpOnly Cookie
});