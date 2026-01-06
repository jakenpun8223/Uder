import { createContext, useState, useEffect, useContext } from 'react';
import { socket } from '../socket'; // Import the shared socket
import useAuth from '../hooks/useAuth';

const WaiterContext = createContext();

export const useWaiter = () => useContext(WaiterContext);

export const WaiterProvider = ({ children }) => {
    const { user } = useAuth();
    // Load saved tables from localStorage or default to empty
    const [myTables, setMyTables] = useState(() => {
        const saved = localStorage.getItem('myTables');
        return saved ? JSON.parse(saved) : [];
    });
    
    const [notifications, setNotifications] = useState([]);

    // Save preference whenever it changes
    useEffect(() => {
        localStorage.setItem('myTables', JSON.stringify(myTables));
    }, [myTables]);

    // Toggle table subscription
    const toggleTable = (tableNum) => {
        setMyTables(prev => 
            prev.includes(tableNum) 
                ? prev.filter(t => t !== tableNum)
                : [...prev, tableNum].sort((a, b) => a - b)
        );
    };

    // Listen for socket events
    useEffect(() => {
        if (!user || (user.role !== 'staff' && user.role !== 'admin')) return;

        const handleCall = (data) => {
            // Only notify if we are watching this table (or if we watch nothing, maybe show all? Let's stick to strict watching)
            if (myTables.includes(parseInt(data.tableNumber))) {
                
                // Add to notification list
                const newNotif = {
                    id: Date.now(),
                    table: data.tableNumber,
                    message: data.message || `Table ${data.tableNumber} needs help!`,
                    time: new Date().toLocaleTimeString()
                };

                setNotifications(prev => [newNotif, ...prev]);

                // Play Sound (Optional)
                // new Audio('/ping.mp3').play().catch(e => console.log(e));
            }
        };

        socket.on('table_calling', handleCall);

        return () => socket.off('table_calling', handleCall);
    }, [user, myTables]);

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return (
        <WaiterContext.Provider value={{ myTables, toggleTable, notifications, removeNotification }}>
            {children}
        </WaiterContext.Provider>
    );
};