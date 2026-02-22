import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { socket } from '../socket'; 
import useAuth from '../hooks/useAuth'; 
import { QRCodeSVG } from 'qrcode.react'; 
import { useTranslation } from 'react-i18next';

const TableManagement = () => {
    const { t } = useTranslation();
    const { user } = useAuth(); 
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true); 
    const [formData, setFormData] = useState({ tableNumber: '', capacity: '', status: 'available' });
    const [editingId, setEditingId] = useState(null); 
    const [message, setMessage] = useState('');

    const fetchTables = async () => {
        try {
            const res = await axios.get('/tables');
            setTables(res.data.sort((a, b) => a.tableNumber - b.tableNumber));
        } catch (err) { setMessage("Failed to load tables."); } 
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchTables();
        socket.on('table_updated', (updatedTable) => setTables(prev => prev.map(t => t._id === updatedTable._id ? updatedTable : t)));
        socket.on('table_added', (newTable) => setTables(prev => [...prev, newTable].sort((a, b) => a.tableNumber - b.tableNumber)));
        socket.on('table_deleted', (deletedId) => setTables(prev => prev.filter(t => t._id !== deletedId)));
        return () => { socket.off('table_updated'); socket.off('table_added'); socket.off('table_deleted'); };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`/tables/${editingId}`, formData);
                setEditingId(null);
            } else {
                await axios.post('/tables', { tableNumber: parseInt(formData.tableNumber), capacity: parseInt(formData.capacity) });
            }
            setFormData({ tableNumber: '', capacity: '', status: 'available' }); 
        } catch (err) { setMessage("Error: " + (err.response?.data?.message || err.message)); }
    };

    const handleEdit = (table) => {
        setEditingId(table._id);
        setFormData({ tableNumber: table.tableNumber, capacity: table.capacity, status: table.status });
    };

    const handleDelete = async (id) => {
        if(!window.confirm("Delete this table?")) return;
        try { await axios.delete(`/tables/${id}`); } catch (err) { alert(err.message); }
    };

    if (loading) return <div className="p-10 text-center">{t('loading')}</div>;
    const frontendUrl = window.location.origin;

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <header className="mb-6">
                <h1 className="text-3xl font-black text-gray-800">{t('table_qr_mgmt')}</h1>
                <p className="text-gray-500 mt-2">{t('manage_floor_plan')}</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded shadow-md h-fit border-t-4 border-primary">
                    <h2 className="text-lg font-bold mb-4 border-b pb-2">{editingId ? t('edit_table') : t('add_new_table')}</h2>
                    {message && <div className="bg-blue-50 text-blue-800 p-2 text-sm rounded mb-4">{message}</div>}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">{t('table_number')}</label>
                            <input type="number" required min="1" value={formData.tableNumber} onChange={e => setFormData({...formData, tableNumber: e.target.value})} className="w-full border p-2 rounded outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">{t('capacity')}</label>
                            <input type="number" required min="1" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} className="w-full border p-2 rounded outline-none" />
                        </div>
                        {editingId && (
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">{t('status')}</label>
                                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full border p-2 rounded outline-none bg-white">
                                    <option value="available">{t('available_green')}</option>
                                    <option value="occupied">{t('occupied_red')}</option>
                                    <option value="reserved">{t('reserved_yellow')}</option>
                                </select>
                            </div>
                        )}
                        <button type="submit" className="py-2 rounded font-bold text-white transition bg-primary hover:bg-orange-600">{editingId ? t('save_changes') : t('add_table')}</button>
                        {editingId && <button type="button" onClick={() => {setEditingId(null); setFormData({ tableNumber: '', capacity: '', status: 'available' })}} className="text-gray-500 text-sm hover:underline">{t('cancel_edit')}</button>}
                    </form>
                </div>

                <div className="md:col-span-2 bg-white p-6 rounded shadow-md">
                    <h2 className="text-lg font-bold mb-4 border-b pb-2 flex justify-between">
                        <span>{t('floor_plan_qr')}</span><span className="text-xs font-normal text-gray-500 mt-1">{t('real_time_active')}</span>
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tables.map(table => {
                            const scanUrl = `${frontendUrl}/menu?restaurant=${user.restaurant}&table=${table.tableNumber}`;
                            return (
                                <div key={table._id} className={`border rounded-lg p-4 flex flex-col items-center relative group transition-all text-center ${editingId === table._id ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-gray-50 hover:shadow-md'}`}>
                                    <span className="text-2xl font-black text-gray-700">{t('table_number')} {table.tableNumber}</span>
                                    <span className="text-xs text-gray-500 font-medium mt-1">{t('capacity')}: {table.capacity}</span>
                                    <span className={`mt-2 px-3 py-1 text-xs rounded-full uppercase font-bold ${table.status === 'available' ? 'bg-green-100 text-green-700' : table.status === 'occupied' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800'}`}>{table.status}</span>
                                    <div className="bg-white p-2 border-2 border-gray-100 rounded-lg shadow-sm mt-4 mb-2"><QRCodeSVG value={scanUrl} size={120} level={"H"} /></div>
                                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEdit(table)} className="bg-white border rounded p-1 hover:text-blue-600 text-gray-400 shadow-sm" title={t('edit')}>✏️</button>
                                        <button onClick={() => handleDelete(table._id)} className="bg-white border rounded p-1 hover:text-red-600 text-gray-400 shadow-sm" title={t('delete')}>🗑️</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {tables.length === 0 && <div className="text-center text-gray-500 py-12 bg-gray-50 rounded-lg border border-gray-200 mt-4">{t('no_tables_yet')}</div>}
                </div>
            </div>
        </div>
    );
};

export default TableManagement;