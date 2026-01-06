import { useState } from 'react';
import axios from '../api/axios';
import { useSearchParams } from 'react-router-dom';

const CallWaiter = () => {
    const [searchParams] = useSearchParams();
    // Try to get table from URL (e.g., /menu?table=5)
    const urlTable = searchParams.get('table');
    
    const [tableNumber, setTableNumber] = useState(urlTable || '');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error

    const handleCall = async () => {
        if (!tableNumber) return;
        setStatus('loading');
        try {
            await axios.post(`/tables/${tableNumber}/request-assistance`);
            setStatus('success');
            // Reset after 5 seconds so they can call again if needed
            setTimeout(() => setStatus('idle'), 5000);
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {status === 'success' ? (
                <div className="bg-green-500 text-white px-6 py-4 rounded-full shadow-xl animate-bounce">
                    ✓ Waiter Notified!
                </div>
            ) : (
                <div className="bg-white p-2 rounded-2xl shadow-xl border border-gray-200 flex flex-col items-center gap-2">
                    {!urlTable && (
                        <input 
                            type="number" 
                            placeholder="Table #" 
                            className="w-20 text-center border border-gray-300 rounded p-1 text-sm"
                            value={tableNumber}
                            onChange={(e) => setTableNumber(e.target.value)}
                        />
                    )}
                    <button 
                        onClick={handleCall}
                        disabled={!tableNumber || status === 'loading'}
                        className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded-xl shadow-md transition transform hover:scale-105 flex items-center gap-2"
                    >
                        <span className="text-xl">🔔</span>
                        {status === 'loading' ? 'Calling...' : 'Call Waiter'}
                    </button>
                    {status === 'error' && <span className="text-xs text-red-500">Error. Try again.</span>}
                </div>
            )}
        </div>
    );
};

export default CallWaiter;