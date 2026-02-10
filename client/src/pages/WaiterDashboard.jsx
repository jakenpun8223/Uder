import { useEffect, useState } from 'react';
import TableSelector from '../components/TableSelector';
import { useWaiter } from '../context/WaiterContext';
import { socket } from '../socket'; // Use shared socket instance
import axios from '../api/axios';

const WaiterDashboard = () => {
    const { notifications, myTables } = useWaiter();
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

            // ALERT: If order is READY, show browser alert or toast
            if (myTables.includes(updatedOrder.tableNumber) && updatedOrder.status === 'ready') {
                alert(`✅ Order for Table ${updatedOrder.tableNumber} is READY!`);
            }
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
                    <p className="text-gray-500 mt-2">
                        Select tables to manage orders and alerts.
                    </p>
                </header>
                <TableSelector />
            </div>

            {/* RIGHT COLUMN: Live Feed */}
            <div className="space-y-6">
                
                {/* 1. Notifications Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 text-lg mb-4 flex justify-between">
                        Alerts <span className="text-red-500">{notifications.length}</span>
                    </h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {notifications.length === 0 ? <p className="text-gray-400 text-sm">No active alerts.</p> : 
                            notifications.map(n => (
                                <div key={n.id} className="p-3 bg-red-50 text-red-700 text-sm rounded border border-red-100">
                                    <strong>Table {n.table}</strong>: {n.message}
                                </div>
                            ))
                        }
                    </div>
                </div>

                {/* 2. My Active Orders Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 text-lg mb-4">Kitchen Progress</h3>
                    <div className="space-y-3">
                        {myOrders.length === 0 ? (
                            <p className="text-gray-400 text-sm">No active orders for your tables.</p>
                        ) : (
                            myOrders.map(order => (
                                <div key={order._id} className="p-4 border rounded-lg bg-gray-50">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-gray-800">Table {order.tableNumber}</span>
                                        <Badge status={order.status} />
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {order.items.length} items • ${order.totalAmount}
                                    </p>
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
        ready: 'bg-green-100 text-green-800 border-green-200 border animate-pulse',
        served: 'bg-gray-100 text-gray-400'
    };
    return (
        <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${colors[status] || 'bg-gray-100'}`}>
            {status}
        </span>
    );
};

export default WaiterDashboard;