import { useEffect, useState, useMemo } from 'react';
import TableSelector from '../components/TableSelector';
import { useWaiter } from '../context/WaiterContext';
import { socket } from '../socket'; 
import axios from '../api/axios';
import { useTranslation } from 'react-i18next';
import { CreditCard } from 'lucide-react'; // Import icon
import toast from 'react-hot-toast';
import { useSearchParams, useNavigate } from 'react-router-dom';

const WaiterDashboard = () => {
    const { t } = useTranslation();
    const { notifications, myTables, removeNotification } = useWaiter();
    const [myOrders, setMyOrders] = useState([]);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    // Payment State
    const [selectedTableToClose, setSelectedTableToClose] = useState('');
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    useEffect(() => {
        // Check if we just returned from the Clearing Company
        const isSimulatedPayment = searchParams.get('simulatedPayment');
        const tableToClose = searchParams.get('table');
    
        if (isSimulatedPayment === 'true' && tableToClose) {
            toast.success(`VISA Payment for Table ${tableToClose} Approved! Closing table...`);
            
            // Tell backend to mark it closed
            axios.post('/orders/close-table', { tableNumber: parseInt(tableToClose) })
                .then(() => {
                    navigate('/waiter', { replace: true }); // Clean the URL
                })
                .catch(err => toast.error("Error closing table"));
        }
    }, [searchParams, navigate]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await axios.get('/orders');
                // FIX: Keep 'served' orders visible! Only hide if 'paid' or 'cancelled'
                const active = data.filter(o => myTables.includes(o.tableNumber) && o.status !== 'paid' && o.status !== 'cancelled');
                setMyOrders(active);
            } catch (err) { console.error("Failed to fetch orders", err); }
        };
        if (myTables.length > 0) fetchOrders();

        if (!socket.connected) socket.connect();
        const handleUpdate = (updatedOrder) => {
            setMyOrders(prev => {
                if (myTables.includes(updatedOrder.tableNumber)) {
                    // FIX: Remove order from screen ONLY if it was marked as paid
                    if (updatedOrder.status === 'paid' || updatedOrder.status === 'cancelled') {
                        return prev.filter(o => o._id !== updatedOrder._id);
                    }
                    const exists = prev.find(o => o._id === updatedOrder._id);
                    if (exists) return prev.map(o => o._id === updatedOrder._id ? updatedOrder : o);
                    else return [updatedOrder, ...prev]; // Add new ones
                }
                return prev;
            });
        };
        socket.on('order_updated', handleUpdate);
        socket.on('new_order', handleUpdate); 
        return () => { socket.off('order_updated', handleUpdate); socket.off('new_order', handleUpdate); };
    }, [myTables]);

    // FIX: Calculate the grand total dynamically for the selected table
    const grandTotal = useMemo(() => {
        if (!selectedTableToClose) return 0;
        const tableOrders = myOrders.filter(o => o.tableNumber === parseInt(selectedTableToClose));
        return tableOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    }, [selectedTableToClose, myOrders]);


    // REAL PAYMENT REDIRECT FUNCTION
    const handleProcessPayment = async () => {
        if (!selectedTableToClose || grandTotal === 0) return toast.error("No active orders for this table.");
        
        setIsProcessingPayment(true);
        toast.loading("Connecting to Clearing Company...", { id: 'payment' });
        
        try {
            // Call the backend to generate the real payment link
            const { data } = await axios.post('/orders/generate-payment', {
                tableNumber: parseInt(selectedTableToClose),
                amount: grandTotal
            });

            toast.success("Redirecting to secure payment...", { id: 'payment' });
            
            // Redirect the waiter to the actual clearing company page (Tranzila/PayPlus/etc.)
            window.location.href = data.paymentUrl;
            
        } catch (error) {
            toast.error(error.response?.data?.message || "Payment setup failed", { id: 'payment' });
            setIsProcessingPayment(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <header>
                    <h1 className="text-3xl font-black text-gray-800">{t('my_station')} 🛎️</h1>
                    <p className="text-gray-500 mt-2">{t('select_tables_msg')}</p>
                </header>
                <TableSelector />

                {/* PAYMENT SECTION */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <CreditCard /> Checkout Table
                    </h2>
                    
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <select 
                            value={selectedTableToClose} 
                            onChange={(e) => setSelectedTableToClose(e.target.value)}
                            className="border border-gray-300 p-3 rounded-lg w-full sm:w-48 font-bold"
                        >
                            <option value="">Select Table</option>
                            {/* Get unique table numbers from active orders */}
                            {[...new Set(myOrders.map(o => o.tableNumber))].map(tNum => (
                                <option key={tNum} value={tNum}>Table {tNum}</option>
                            ))}
                        </select>
                        
                        {selectedTableToClose && (
                            <div className="text-lg">
                                Total to pay: <span className="font-black text-primary text-2xl">₪{grandTotal.toFixed(2)}</span>
                            </div>
                        )}

                        <button 
                            onClick={handleProcessPayment}
                            disabled={!selectedTableToClose || isProcessingPayment || grandTotal === 0}
                            className="bg-green-600 hover:bg-green-700 text-white font-black py-3 px-6 rounded-lg disabled:opacity-50 transition w-full sm:w-auto shadow-md"
                        >
                            {isProcessingPayment ? "Loading..." : "Pay via VISA"}
                        </button>
                    </div>
                </div>
            </div>
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 text-lg mb-4 flex justify-between">{t('recent_alerts')} {notifications.length > 0 && <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{notifications.length}</span>}</h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                        {notifications.length === 0 ? <p className="text-gray-400 text-sm">{t('no_recent_activity')}</p> : 
                            notifications.map(n => {
                                const isSuccess = n.type === 'success';
                                return (
                                    <div key={n.id} className={`p-3 text-sm rounded-lg border shadow-sm flex justify-between items-center ${isSuccess ? 'bg-green-50 text-green-900 border-green-200' : 'bg-red-50 text-red-900 border-red-200'}`}>
                                        <div className="flex items-start gap-3">
                                            <span className="text-2xl mt-0.5">{isSuccess ? '🍲' : '🔔'}</span>
                                            <div>
                                                <span className="block font-bold">{t('table_number')} {n.table}</span>
                                                <span className="block text-xs mt-0.5">{n.message}</span>
                                                <span className="text-[10px] opacity-60 mt-1 block font-mono">{n.time}</span>
                                            </div>
                                        </div>
                                        <button onClick={() => removeNotification(n.id)} className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors ${isSuccess ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>{t('ack')}</button>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 text-lg mb-4">{t('kitchen_progress')}</h3>
                    <div className="space-y-3">
                        {myOrders.length === 0 ? <p className="text-gray-400 text-sm">{t('no_active_orders')}</p> : (
                            myOrders.map(order => (
                                <div key={order._id} className="p-4 border rounded-lg bg-gray-50 flex justify-between items-center">
                                    <div>
                                        <span className="font-bold text-gray-800 block mb-1">{t('table_number')} {order.tableNumber}</span>
                                        <p className="text-xs text-gray-500">{order.items.length} {t('items')} • ₪{order.totalAmount}</p>
                                    </div>
                                    <Badge status={order.status} t={t} />
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Badge = ({ status, t }) => {
    const colors = { pending: 'bg-gray-200 text-gray-700', preparing: 'bg-blue-100 text-blue-800', ready: 'bg-green-100 text-green-800 border-green-200 border-2 animate-pulse', served: 'bg-gray-100 text-gray-400' };
    return <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${colors[status] || 'bg-gray-100'}`}>{t(status)}</span>;
};

export default WaiterDashboard;