import { useWaiter } from '../context/WaiterContext';
import { useNavigate } from 'react-router-dom';

const WaiterNotifications = () => {
    const { notifications, removeNotification } = useWaiter();
    const navigate = useNavigate();

    if (notifications.length === 0) return null;

    return (
        <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 w-80">
            {notifications.map(notif => (
                <div 
                    key={notif.id} 
                    className="bg-white border-l-4 border-yellow-400 shadow-xl rounded-md p-4 animate-slide-in flex flex-col"
                >
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">🔔</span>
                            <div>
                                <h4 className="font-bold text-gray-800">Table {notif.table}</h4>
                                <p className="text-sm text-gray-600">{notif.message}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => removeNotification(notif.id)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>
                    </div>
                    
                    <div className="mt-3 flex gap-2">
                        <button 
                            onClick={() => {
                                removeNotification(notif.id);
                                navigate('/kitchen'); // Or wherever you handle requests
                            }}
                            className="flex-1 bg-yellow-100 text-yellow-700 text-xs font-bold py-1 px-2 rounded hover:bg-yellow-200"
                        >
                            Acknowledge
                        </button>
                    </div>
                    <span className="text-[10px] text-gray-400 text-right mt-1">{notif.time}</span>
                </div>
            ))}
        </div>
    );
};

export default WaiterNotifications;