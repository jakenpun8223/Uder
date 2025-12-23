import { createContext, useState, useEffect } from 'react';
import axios from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // 1. Check if user is logged in when the app loads
    useEffect(() => {
        const checkLoggedIn = async () => {
            try {
                const { data } = await axios.get('/auth/me');
                setUser(data);
            } catch (err) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkLoggedIn();
    }, []);

    // 2. Login Function
    const login = async (email, password) => {
        const { data } = await axios.post('/auth/login', { email, password });
        // After login, we don't get a token (it's in the cookie), we usually get user data
        // Depending on your backend response, you might need to fetch '/auth/me' again or set data directly
        setUser(data.user || data); 
    };

    // 3. Logout Function
    const logout = async () => {
        await axios.post('/auth/logout'); // You might need a logout route later to clear cookie
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthContext;