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
                const { data } = await axios.get('/orders');
                // Keep only active kitchen orders
                const activeOrders = data.filter(o => ['pending', 'preparing', 'ready'].includes(o.status));
                setOrders(activeOrders);
            } catch (err) {
                console.error("Error fetching orders:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();

        // Update timer every minute for the "15 min" warning
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // 2. Real-Time Listeners
    useEffect(() => {
        if (!socket) return;

        // A. New Order Received
        socket.on('receive_order', (newOrder) => {
            setOrders((prev) => [newOrder, ...prev]);
        });

        // B. Order Updated (By another chef or waiter)
        socket.on('order_updated', (updatedOrder) => {
            setOrders((prev) => 
                prev.map((order) => 
                    order._id === updatedOrder._id ? updatedOrder : order
                )
            );
        });

        return () => {
            socket.off('receive_order');
            socket.off('order_updated');
        };
    }, [socket]);

    // 3. Handle Status Click
    const handleStatusUpdate = async (orderId, newStatus) => {
        // Optimistic Update (Instant UI change)
        setOrders(prev => prev.map(order => 
            order._id === orderId ? { ...order, status: newStatus } : order
        ));

        try {
            await axios.patch(`/orders/${orderId}/status`, { status: newStatus });
        } catch (err) {
            console.error("Status update failed:", err);
            // In a real app, you might revert the state here on error
        }
    };

    const getMinutesWaiting = (createdAt) => {
        return Math.floor((currentTime - new Date(createdAt)) / 60000);
    };

    if (loading) return <div className="p-10 text-center text-xl animate-pulse">Loading Kitchen Feed...</div>;

    // Filter into columns
    const columns = {
        pending: orders.filter(o => o.status === 'pending'),
        preparing: orders.filter(o => o.status === 'preparing'),
        ready: orders.filter(o => o.status === 'ready'),
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span>👨‍🍳</span> Kitchen Display System
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatusColumn 
                    title="New Orders" 
                    orders={columns.pending} 
                    color="bg-red-50 border-red-200" 
                    badgeColor="bg-red-100 text-red-800"
                    btnColor="bg-red-600 hover:bg-red-700"
                    actionLabel="Start Cooking"
                    nextStatus="preparing"
                    onAction={handleStatusUpdate}
                    getMinutesWaiting={getMinutesWaiting}
                />
                <StatusColumn 
                    title="Cooking" 
                    orders={columns.preparing} 
                    color="bg-orange-50 border-orange-200" 
                    badgeColor="bg-orange-100 text-orange-800"
                    btnColor="bg-orange-500 hover:bg-orange-600"
                    actionLabel="Mark Ready"
                    nextStatus="ready"
                    onAction={handleStatusUpdate}
                    getMinutesWaiting={getMinutesWaiting}
                />
                <StatusColumn 
                    title="Ready to Serve" 
                    orders={columns.ready} 
                    color="bg-green-50 border-green-200" 
                    badgeColor="bg-green-100 text-green-800"
                    btnColor="bg-green-600 hover:bg-green-700"
                    actionLabel="Complete"
                    nextStatus="served"
                    onAction={handleStatusUpdate}
                    getMinutesWaiting={getMinutesWaiting}
                />
            </div>
        </div>
    );
};

// Reusable Card Component
const StatusColumn = ({ title, orders, color, badgeColor, btnColor, actionLabel, nextStatus, onAction, getMinutesWaiting }) => (
    <div className={`rounded-xl border-2 p-4 ${color} min-h-[600px] flex flex-col`}>
        <div className="flex justify-between items-center mb-4">
            <h2 className={`text-lg font-bold px-3 py-1 rounded-full ${badgeColor}`}>
                {title}
            </h2>
            <span className="text-gray-500 font-medium">{orders.length}</span>
        </div>
        
        <div className="space-y-4 flex-1 overflow-y-auto">
            {orders.map(order => {
                const mins = getMinutesWaiting(order.createdAt);
                const isLate = mins > 15;

                return (
                    <div key={order._id} className={`bg-white p-4 rounded-lg shadow-sm border-l-4 transition-all ${isLate ? 'border-red-500 animate-pulse' : 'border-gray-300'}`}>
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <span className="text-xl font-bold text-gray-800">T-{order.tableNumber}</span>
                                <div className="text-xs text-gray-400 mt-1">#{order._id.slice(-4)}</div>
                            </div>
                            <span className={`text-xs font-mono font-bold px-2 py-1 rounded ${isLate ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                                {mins}m
                            </span>
                        </div>

                        <div className="border-t border-b border-gray-100 py-2 my-2 space-y-1">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm text-gray-700">
                                    <span className="font-semibold">{item.quantity}x</span>
                                    <span>{item.name || item.product?.name}</span>
                                </div>
                            ))}
                        </div>

                        <button 
                            onClick={() => onAction(order._id, nextStatus)}
                            className={`w-full py-2 rounded-md font-bold text-white text-sm transition shadow-sm ${btnColor}`}
                        >
                            {actionLabel}
                        </button>
                    </div>
                );
            })}
            {orders.length === 0 && (
                <div className="h-full flex items-center justify-center text-gray-400 opacity-50 italic">
                    No orders
                </div>
            )}
        </div>
    </div>
);

export default KitchenDashboard;