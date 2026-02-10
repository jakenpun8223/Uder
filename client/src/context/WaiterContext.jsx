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
        if (!socket.connected) socket.connect();
        if (!user || (user.role !== 'staff' && user.role !== 'admin')) return;

        const handleCall = (data) => {
            // Only notify if we are watching this table (or if we watch nothing, maybe show all? Let's stick to strict watching)
            if (myTables.includes(parseInt(data.tableNumber))) {
                
                // Add to notification list
                const newNotif = {
                    id: Date.now(),
                    table: data.tableNumber,
                    message: data.message || `Table ${data.tableNumber} needs help!`,
                    type: 'alert',
                    time: new Date().toLocaleTimeString()
                };

                setNotifications(prev => [newNotif, ...prev]);
                playNotificationSound();

                // Play Sound (Optional)
                // new Audio('/ping.mp3').play().catch(e => console.log(e));
            }
        };

        const handleOrderUpdate = (order) => {
            // 1. Check if this order belongs to a table I am watching
            // 2. Check if the status is specifically 'ready'
            if (myTables.includes(order.tableNumber) && order.status === 'ready') {
                const newNotif = {
                    id: Date.now(),
                    table: order.tableNumber,
                    message: `Order for Table ${order.tableNumber} is Ready!`,
                    type: 'success', // [NEW] Green type
                    time: new Date().toLocaleTimeString()
                };
                setNotifications(prev => [newNotif, ...prev]);
                playNotificationSound(); // [NEW] Trigger sound
            }
        };

        socket.on('table_calling', handleCall);
        socket.on('order_updated', handleOrderUpdate); // [NEW] Register the listener

        return () => {
            socket.off('table_calling', handleCall);
            socket.off('order_updated', handleOrderUpdate); // [NEW] Clean up
        };
    }, [user, myTables]);

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const playNotificationSound = () => {
        try {
            const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
            audio.play().catch(err => console.error("Audio play blocked:", err));
        } catch (e) {
            console.error("Audio error", e);
        }
    };

    return (
        <WaiterContext.Provider value={{ myTables, toggleTable, notifications, removeNotification }}>
            {children}
        </WaiterContext.Provider>
    );
};