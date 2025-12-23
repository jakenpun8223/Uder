import { createContext, useState, useEffect } from 'react';
import axios from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

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

    const login = async (email, password) => {
        const { data } = await axios.post('/auth/login', { email, password });
        setUser(data.user || data); 
    };

    // --- NEW: Register Function ---
    const register = async (name, email, password) => {
        const { data } = await axios.post('/auth/register', { name, email, password });
        // Assuming backend logs user in immediately after register (sets cookie)
        setUser(data.user || data);
    };

    const logout = async () => {
        await axios.post('/auth/logout'); // Make sure you have this route in backend or just clear state
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthContext;