import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { socket } from '../socket'; // Import socket

const TableManagement = () => {
    const [tables, setTables] = useState([]);
    
    // Form state (Used for both Create and Edit)
    const [formData, setFormData] = useState({ tableNumber: '', capacity: '' });
    const [editingId, setEditingId] = useState(null); // If set, we are editing this ID
    
    const [message, setMessage] = useState('');

    const fetchTables = async () => {
        try {
            const res = await axios.get('/tables');
            setTables(res.data.sort((a, b) => a.tableNumber - b.tableNumber));
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        fetchTables();

        // --- REAL TIME LISTENERS ---
        socket.on('table_updated', (updatedTable) => {
            setTables(prev => prev.map(t => t._id === updatedTable._id ? updatedTable : t));
        });

        socket.on('table_added', (newTable) => {
            setTables(prev => [...prev, newTable].sort((a, b) => a.tableNumber - b.tableNumber));
        });

        socket.on('table_deleted', (deletedId) => {
            setTables(prev => prev.filter(t => t._id !== deletedId));
        });

        return () => {
            socket.off('table_updated');
            socket.off('table_added');
            socket.off('table_deleted');
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                // UPDATE MODE
                await axios.put(`/tables/${editingId}`, formData);
                setMessage(`Table ${formData.tableNumber} updated!`);
                setEditingId(null);
            } else {
                // CREATE MODE
                await axios.post('/tables', {
                    tableNumber: parseInt(formData.tableNumber),
                    capacity: parseInt(formData.capacity)
                });
                setMessage(`Table ${formData.tableNumber} created!`);
            }
            setFormData({ tableNumber: '', capacity: '' }); // Reset form
        } catch (err) {
            setMessage("Error: " + (err.response?.data?.message || err.message));
        }
    };

    const handleEdit = (table) => {
        setEditingId(table._id);
        setFormData({ tableNumber: table.tableNumber, capacity: table.capacity });
        setMessage(`Editing Table ${table.tableNumber}...`);
    };

    const handleDelete = async (id) => {
        if(!window.confirm("Delete this table?")) return;
        try {
            await axios.delete(`/tables/${id}`);
        } catch (err) { alert(err.message); }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData({ tableNumber: '', capacity: '' });
        setMessage('');
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Table Management</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. CONTROL PANEL (Create / Edit Form) */}
                <div className="bg-white p-6 rounded shadow-md h-fit border-t-4 border-primary">
                    <h2 className="text-lg font-bold mb-4 border-b pb-2">
                        {editingId ? 'Edit Table' : 'Add New Table'}
                    </h2>
                    
                    {message && <div className="bg-blue-50 text-blue-800 p-2 text-sm rounded mb-4">{message}</div>}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Table Number</label>
                            <input 
                                type="number" required
                                value={formData.tableNumber}
                                onChange={e => setFormData({...formData, tableNumber: e.target.value})}
                                className="w-full border p-2 rounded focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Capacity</label>
                            <input 
                                type="number" required
                                value={formData.capacity}
                                onChange={e => setFormData({...formData, capacity: e.target.value})}
                                className="w-full border p-2 rounded focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>

                        <button type="submit" className={`py-2 rounded font-bold text-white transition ${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-primary hover:bg-orange-600'}`}>
                            {editingId ? 'Update Table' : 'Add Table'}
                        </button>

                        {editingId && (
                            <button type="button" onClick={cancelEdit} className="text-gray-500 text-sm hover:underline">
                                Cancel Edit
                            </button>
                        )}
                    </form>
                </div>

                {/* 2. TABLE GRID (Clean View) */}
                <div className="md:col-span-2 bg-white p-6 rounded shadow-md">
                    <h2 className="text-lg font-bold mb-4 border-b pb-2 flex justify-between">
                        <span>Floor Plan</span>
                        <span className="text-xs font-normal text-gray-500 mt-1">Real-time updates active 🟢</span>
                    </h2>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {tables.map(table => (
                            <div key={table._id} className={`
                                border rounded-lg p-3 flex flex-col items-center relative group transition-all
                                ${editingId === table._id ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-gray-50 hover:shadow-md'}
                            `}>
                                <span className="text-2xl font-black text-gray-700">{table.tableNumber}</span>
                                <span className="text-xs text-gray-500 font-medium">Capacity: {table.capacity}</span>
                                
                                <span className={`mt-2 px-2 py-0.5 text-[10px] rounded-full uppercase font-bold ${
                                    table.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                    {table.status}
                                </span>

                                {/* HOVER ACTIONS */}
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEdit(table)} className="bg-white border rounded p-1 hover:text-blue-600 text-gray-400 shadow-sm" title="Edit">
                                        ✏️
                                    </button>
                                    <button onClick={() => handleDelete(table._id)} className="bg-white border rounded p-1 hover:text-red-600 text-gray-400 shadow-sm" title="Delete">
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    {tables.length === 0 && <p className="text-gray-400 text-center py-10">No tables found.</p>}
                </div>
            </div>
        </div>
    );
};

export default TableManagement;