import { useState, useEffect } from 'react';
import axios from '../api/axios';

const KitchenDashboard = ({ socket }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    // 1. Fetch Initial Orders
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                // Get all active orders (we filter out 'paid' or 'served' if needed)
                const { data } = await axios.get('/orders');
                // Filter for active kitchen tasks only
                const activeOrders = data.filter(o => ['pending', 'preparing', 'ready'].includes(o.status));
                setOrders(activeOrders);
            } catch (err) {
                console.error("Error fetching orders:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();

        // Update "currentTime" every minute to trigger re-renders for the timer/visual cues
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // 2. Socket.io Integration (Real-time updates)
    useEffect(() => {
        if (!socket) return;

        // Listen for new orders from Waiter
        socket.on('receive_order', (newOrder) => {
            // Add new order to top of list
            setOrders((prev) => [newOrder, ...prev]);
            
            // Optional: Play a sound here!
            // const audio = new Audio('/notification.mp3');
            // audio.play();
        });

        // Listen for updates (if another chef updates status) - Optional but good practice
        // socket.on('order_updated', (updatedOrder) => { ... })

        return () => {
            socket.off('receive_order');
        };
    }, [socket]);

    // 3. Status Management
    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            // Optimistic Update (Update UI immediately)
            setOrders(prev => prev.map(order => 
                order._id === orderId ? { ...order, status: newStatus } : order
            ));

            // Send to Backend
            await axios.patch(`/orders/${orderId}/status`, { status: newStatus });
            
        } catch (err) {
            console.error("Failed to update status", err);
            // Revert on failure (optional, but recommended)
        }
    };

    // Helper: Calculate minutes waiting
    const getMinutesWaiting = (createdAt) => {
        const start = new Date(createdAt);
        const diff = currentTime - start; 
        return Math.floor(diff / 1000 / 60);
    };

    if (loading) return <div className="p-10 text-center text-xl">Loading Kitchen Feed...</div>;

    // KANBAN COLUMNS
    const columns = {
        pending: orders.filter(o => o.status === 'pending'),
        preparing: orders.filter(o => o.status === 'preparing'),
        ready: orders.filter(o => o.status === 'ready'),
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">👨‍🍳 Kitchen Display System</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* COLUMN 1: PENDING */}
                <StatusColumn 
                    title="New Orders" 
                    orders={columns.pending} 
                    color="bg-red-50 border-red-200" 
                    badgeColor="bg-red-100 text-red-800"
                    actionLabel="Start Cooking"
                    onAction={(id) => handleStatusUpdate(id, 'preparing')}
                    getMinutesWaiting={getMinutesWaiting}
                />

                {/* COLUMN 2: PREPARING */}
                <StatusColumn 
                    title="Cooking" 
                    orders={columns.preparing} 
                    color="bg-yellow-50 border-yellow-200" 
                    badgeColor="bg-yellow-100 text-yellow-800"
                    actionLabel="Mark Ready"
                    onAction={(id) => handleStatusUpdate(id, 'ready')}
                    getMinutesWaiting={getMinutesWaiting}
                />

                {/* COLUMN 3: READY */}
                <StatusColumn 
                    title="Ready to Serve" 
                    orders={columns.ready} 
                    color="bg-green-50 border-green-200" 
                    badgeColor="bg-green-100 text-green-800"
                    actionLabel="Complete (Served)"
                    onAction={(id) => handleStatusUpdate(id, 'served')} // Removes from board
                    getMinutesWaiting={getMinutesWaiting}
                />
            </div>
        </div>
    );
};

// Sub-component for individual cards to keep code clean
const StatusColumn = ({ title, orders, color, badgeColor, actionLabel, onAction, getMinutesWaiting }) => (
    <div className={`rounded-xl border p-4 ${color} min-h-[500px]`}>
        <h2 className={`text-xl font-bold mb-4 px-2 rounded ${badgeColor} inline-block`}>
            {title} ({orders.length})
        </h2>
        
        <div className="space-y-4">
            {orders.map(order => {
                const mins = getMinutesWaiting(order.createdAt);
                const isLate = mins > 15;

                return (
                    <div key={order._id} className={`bg-white p-4 rounded-lg shadow-sm border-2 transition-all ${isLate ? 'border-red-500 animate-pulse' : 'border-transparent'}`}>
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-lg font-bold text-gray-800">Table {order.tableNumber}</span>
                            <span className={`text-xs font-mono px-2 py-1 rounded ${isLate ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                {mins}m ago
                            </span>
                        </div>

                        <div className="mb-4">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-gray-700 text-sm border-b border-gray-100 py-1 last:border-0">
                                    <span>{item.quantity}x {item.name || item.product?.name}</span>
                                </div>
                            ))}
                        </div>

                        <button 
                            onClick={() => onAction(order._id)}
                            className="w-full py-2 rounded-md font-semibold text-sm bg-gray-900 text-white hover:bg-gray-700 transition"
                        >
                            {actionLabel} →
                        </button>
                    </div>
                );
            })}
            {orders.length === 0 && <p className="text-gray-400 text-center italic mt-10">No orders here</p>}
        </div>
    </div>
);

export default KitchenDashboard;