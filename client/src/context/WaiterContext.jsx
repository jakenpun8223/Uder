import { createContext, useState, useEffect, useContext } from 'react';
import { socket } from '../socket'; 
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';

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

    // Soft, pleasant notification sound
    const playSoftSound = () => {
        try {
            const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
            audio.volume = 0.5;
            audio.play().catch(err => console.error("Audio blocked:", err));
        } catch (e) {
            console.error("Audio error", e);
        }
    };

    const addHistory = (table, message, type) => {
        setNotifications(prev => [{
            id: Date.now(),
            table,
            message,
            type,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }, ...prev].slice(0, 10)); // Keep only the 10 most recent logs
    };

    useEffect(() => {
        if (!socket.connected) socket.connect();
        if (!user || (user.role !== 'staff' && user.role !== 'admin')) return;

        // 1. Customer calls for help
        const handleCall = (data) => {
            // Only notify if we are watching this table (or if we watch nothing, maybe show all? Let's stick to strict watching)
            if (myTables.includes(parseInt(data.tableNumber))) {
                const msg = `Table ${data.tableNumber} needs help!`;
                
                // A. Visual Toast (The smooth pop-up)
                toast(msg, {
                    icon: '👋',
                    style: { borderRadius: '10px', background: '#333', color: '#fff' },
                });

                playSoftSound();
                addHistory(data.tableNumber, msg, 'alert');
            }
        };

        // 2. Kitchen marks order as ready
        const handleOrderUpdate = (order) => {
            if (myTables.includes(order.tableNumber) && order.status === 'ready') {
                const msg = `Order for Table ${order.tableNumber} is Ready!`;

                // A. Visual Toast
                toast.success(msg, {
                    duration: 5000, 
                    style: { border: '1px solid #4ade80', padding: '16px', color: '#1f2937' },
                });

                playSoftSound();
                addHistory(order.tableNumber, msg, 'success');
            }
        };

        socket.on('table_calling', handleCall);
        socket.on('order_updated', handleOrderUpdate);

        return () => {
            socket.off('table_calling', handleCall);
            socket.off('order_updated', handleOrderUpdate);
        };
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