import { useState, useEffect } from 'react';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const KitchenDashboard = ({ socket }) => {
    const { t } = useTranslation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    const playKitchenDing = () => {
        try { const audio = new Audio("https://actions.google.com/sounds/v1/alarms/dinner_bell_triangle.ogg"); audio.play().catch(e => console.error(e)); } catch (e) { }
    };

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await axios.get('/orders');
                setOrders(data.filter(o => ['pending', 'preparing', 'ready'].includes(o.status)));
            } catch (err) { } finally { setLoading(false); }
        };
        fetchOrders();
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!socket) return;
        if (!socket.connected) socket.connect();
        const handleNewOrder = (newOrder) => {
            setOrders((prev) => [newOrder, ...prev]);
            toast(`NEW ORDER: Table ${newOrder.tableNumber}`, { icon: '🚨', duration: 6000, style: { background: '#f97316', color: '#fff', fontWeight: 'bold' } });
            playKitchenDing();
        };
        const handleOrderUpdated = (updatedOrder) => setOrders((prev) => prev.map((order) => order._id === updatedOrder._id ? updatedOrder : order));
        socket.on('new_order', handleNewOrder);
        socket.on('order_updated', handleOrderUpdated);
        return () => { socket.off('new_order', handleNewOrder); socket.off('order_updated', handleOrderUpdated); };
    }, [socket]);

    const handleStatusUpdate = async (orderId, newStatus) => {
        setOrders(prev => prev.map(order => order._id === orderId ? { ...order, status: newStatus } : order));
        try { await axios.patch(`/orders/${orderId}/status`, { status: newStatus }); } catch (err) {}
    };

    const getMinutesWaiting = (createdAt) => Math.floor((currentTime - new Date(createdAt)) / 60000);

    if (loading) return <div className="flex h-screen items-center justify-center bg-gray-100 text-gray-500 font-bold uppercase tracking-widest">{t('loading_system')}</div>;

    const columns = { pending: orders.filter(o => o.status === 'pending'), preparing: orders.filter(o => o.status === 'preparing'), ready: orders.filter(o => o.status === 'ready') };

    return (
        <div className="min-h-screen bg-gray-100 p-4 font-sans text-gray-800">
            <header className="mb-6 flex items-center justify-between border-b-2 border-gray-200 pb-4">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900">{t('kitchen_display')}</h1>
                    <p className="text-sm font-medium text-gray-500">{t('live_service_monitor')}</p>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold text-gray-800">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    <div className="text-xs font-bold uppercase tracking-wide text-gray-400">{t('active_orders')}: {orders.length}</div>
                </div>
            </header>
            
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 h-[calc(100vh-140px)]">
                <StatusColumn title={t('inbound_orders')} orders={columns.pending} borderColor="border-gray-400" headerBg="bg-gray-800" headerText="text-white" btnClass="bg-gray-800 hover:bg-gray-900 text-white" actionLabel={t('start_prep')} nextStatus="preparing" onAction={handleStatusUpdate} getMinutesWaiting={getMinutesWaiting} t={t} />
                <StatusColumn title={t('preparing')} orders={columns.preparing} borderColor="border-orange-500" headerBg="bg-orange-500" headerText="text-white" btnClass="bg-orange-500 hover:bg-orange-600 text-white" actionLabel={t('mark_ready')} nextStatus="ready" onAction={handleStatusUpdate} getMinutesWaiting={getMinutesWaiting} t={t} />
                <StatusColumn title={t('ready_for_pickup')} orders={columns.ready} borderColor="border-green-500" headerBg="bg-green-500" headerText="text-white" btnClass="bg-green-500 hover:bg-green-600 text-white" actionLabel={t('order_served')} nextStatus="served" onAction={handleStatusUpdate} getMinutesWaiting={getMinutesWaiting} t={t} />
            </div>
        </div>
    );
};

const StatusColumn = ({ title, orders, borderColor, headerBg, headerText, btnClass, actionLabel, nextStatus, onAction, getMinutesWaiting, t }) => (
    <div className={`flex flex-col rounded-sm bg-gray-50 border-t-4 shadow-sm ${borderColor} h-full overflow-hidden`}>
        <div className={`${headerBg} ${headerText} p-3 flex justify-between items-center shadow-md z-10`}>
            <h2 className="text-sm font-bold uppercase tracking-wider">{title}</h2>
            <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold">{orders.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {orders.map(order => {
                const mins = getMinutesWaiting(order.createdAt);
                const isLate = mins > 15;
                return (
                    <div key={order._id} className="bg-white border border-gray-200 rounded-sm shadow-sm flex flex-col relative overflow-hidden group">
                        {isLate && <div className="absolute top-0 left-0 w-1 h-full bg-red-600 animate-pulse" />}
                        <div className="p-3 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                            <div>
                                <span className="block text-lg font-black text-gray-800 leading-none">TBL {order.tableNumber}</span>
                                <span className="text-[10px] font-mono text-gray-400 uppercase">ID: {order._id.slice(-6)}</span>
                            </div>
                            <div className={`text-right ${isLate ? 'text-red-600' : 'text-gray-500'}`}>
                                <span className={`block text-xl font-bold leading-none ${isLate ? 'animate-pulse' : ''}`}>{mins}<span className="text-xs align-top">m</span></span>
                            </div>
                        </div>
                        <div className="p-3 space-y-2 flex-1">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-gray-800 bg-gray-100 px-1.5 rounded text-xs border border-gray-300">{item.quantity}</span>
                                        <span className="text-gray-700 font-medium">{item.name || item.product?.name}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => onAction(order._id, nextStatus)} className={`w-full py-3 text-xs font-bold uppercase tracking-widest transition-colors ${btnClass}`}>{actionLabel}</button>
                    </div>
                );
            })}
            {orders.length === 0 && <div className="h-32 flex flex-col items-center justify-center text-gray-400 opacity-60"><span className="text-4xl mb-2">✓</span><span className="text-xs uppercase font-bold tracking-wide">{t('all_clear')}</span></div>}
        </div>
    </div>
);

export default KitchenDashboard;