import { useEffect, useState } from 'react';
import TableSelector from '../components/TableSelector';
import { useWaiter } from '../context/WaiterContext';
import { socket } from '../socket'; 
import axios from '../api/axios';

const WaiterDashboard = () => {
    // 1. Pull removeNotification from context!
    const { notifications, myTables, removeNotification } = useWaiter();
    const [myOrders, setMyOrders] = useState([]);

    // 1. Fetch Active Orders on Load
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await axios.get('/orders');
                // Filter orders that belong to "My Tables" and are not paid/closed
                const active = data.filter(o => 
                    myTables.includes(o.tableNumber) && 
                    o.status !== 'paid' && 
                    o.status !== 'served'
                );
                setMyOrders(active);
            } catch (err) {
                console.error("Failed to fetch orders", err);
            }
        };
        
        if (myTables.length > 0) fetchOrders();

        // Connect Socket
        if (!socket.connected) socket.connect();

        // 2. Listen for Status Updates (Kitchen -> Waiter)
        const handleUpdate = (updatedOrder) => {
            setMyOrders(prev => {
                // If this order belongs to one of my tables
                if (myTables.includes(updatedOrder.tableNumber)) {
                    // Update existing order or add if new (and active)
                    const exists = prev.find(o => o._id === updatedOrder._id);
                    if (exists) {
                        return prev.map(o => o._id === updatedOrder._id ? updatedOrder : o);
                    } else if (['pending', 'preparing', 'ready'].includes(updatedOrder.status)) {
                        return [updatedOrder, ...prev];
                    }
                }
                return prev;
            });
        };

        socket.on('order_updated', handleUpdate);
        socket.on('new_order', handleUpdate); // Also listen for new orders added by other staff

        return () => {
            socket.off('order_updated', handleUpdate);
            socket.off('new_order', handleUpdate);
        };
    }, [myTables]); // Re-run if selected tables change

    return (
        <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN: Table Management */}
            <div className="lg:col-span-2 space-y-8">
                <header>
                    <h1 className="text-3xl font-black text-gray-800">My Station 🛎️</h1>
                    <p className="text-gray-500 mt-2">Select tables to manage orders and alerts.</p>
                </header>
                <TableSelector />
            </div>

            {/* RIGHT COLUMN: Live Feed */}
            <div className="space-y-6">
                
                {/* 1. Notifications Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 text-lg mb-4 flex justify-between">
                        Recent Alerts 
                        {notifications.length > 0 && <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{notifications.length}</span>}
                    </h3>
                    
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                        {notifications.length === 0 ? <p className="text-gray-400 text-sm">No recent activity.</p> : 
                            notifications.map(n => {
                                const isSuccess = n.type === 'success';
                                return (
                                    <div key={n.id} className={`p-3 text-sm rounded-lg border shadow-sm flex justify-between items-center ${isSuccess ? 'bg-green-50 text-green-900 border-green-200' : 'bg-red-50 text-red-900 border-red-200'}`}>
                                        <div className="flex items-start gap-3">
                                            {/* Icons for immediate visual difference */}
                                            <span className="text-2xl mt-0.5">{isSuccess ? '🍲' : '🔔'}</span>
                                            <div>
                                                <span className="block font-bold">Table {n.table}</span>
                                                <span className="block text-xs mt-0.5">{n.message}</span>
                                                <span className="text-[10px] opacity-60 mt-1 block font-mono">{n.time}</span>
                                            </div>
                                        </div>
                                        {/* Acknowledge Button */}
                                        <button 
                                            onClick={() => removeNotification(n.id)}
                                            className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors ${isSuccess ? 'bg-green-200 hover:bg-green-300 text-green-800' : 'bg-red-200 hover:bg-red-300 text-red-800'}`}
                                        >
                                            Ack
                                        </button>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>

                {/* My Active Orders Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 text-lg mb-4">Kitchen Progress</h3>
                    <div className="space-y-3">
                        {myOrders.length === 0 ? (
                            <p className="text-gray-400 text-sm">No active orders for your tables.</p>
                        ) : (
                            myOrders.map(order => (
                                <div key={order._id} className="p-4 border rounded-lg bg-gray-50 flex justify-between items-center">
                                    <div>
                                        <span className="font-bold text-gray-800 block mb-1">Table {order.tableNumber}</span>
                                        <p className="text-xs text-gray-500">
                                            {order.items.length} items • ${order.totalAmount}
                                        </p>
                                    </div>
                                    <Badge status={order.status} />
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper for Status Colors
const Badge = ({ status }) => {
    const colors = {
        pending: 'bg-gray-200 text-gray-700',
        preparing: 'bg-blue-100 text-blue-800',
        ready: 'bg-green-100 text-green-800 border-green-200 border-2 animate-pulse',
        served: 'bg-gray-100 text-gray-400'
    };
    return (
        <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${colors[status] || 'bg-gray-100'}`}>
            {status}
        </span>
    );
};

export default WaiterDashboard;