import { useEffect, useState } from 'react';
import { useWaiter } from '../context/WaiterContext';
import axios from '../api/axios';
import { useTranslation } from 'react-i18next';

const TableSelector = () => {
    const { t } = useTranslation();
    const { myTables, toggleTable } = useWaiter();
    const [dbTables, setDbTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTables = async () => {
            try {
                const response = await axios.get('/tables');
                setDbTables(response.data.sort((a, b) => a.tableNumber - b.tableNumber));
            } catch (err) { setError("Could not load tables from server."); } 
            finally { setLoading(false); }
        };
        fetchTables();
    }, []);

    if (loading) return <div className="text-gray-500 text-sm animate-pulse">{t('loading')}</div>;
    if (error) return <div className="text-red-500 text-sm">{error}</div>;

    return (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6 border border-gray-200">
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-700">🔔 {t('my_station_click')}</h3>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{myTables.length} {t('active')}</span>
            </div>
            <div className="flex flex-wrap gap-2">
                {dbTables.map(table => (
                    <button key={table._id} onClick={() => toggleTable(table.tableNumber)}
                        className={`w-12 h-12 rounded-lg font-bold transition-all border-2 flex flex-col items-center justify-center ${myTables.includes(table.tableNumber) ? 'bg-primary border-primary text-white shadow-lg scale-105' : 'bg-white border-gray-200 text-gray-400 hover:border-primary hover:text-primary'}`}>
                        <span className="text-sm">{table.tableNumber}</span>
                        <span className="text-[8px] font-normal opacity-70">{table.capacity}p</span>
                    </button>
                ))}
            </div>
            <p className="text-xs text-gray-400 mt-3 italic">{t('only_receive_alerts')}</p>
        </div>
    );
};

export default TableSelector;