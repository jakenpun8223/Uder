import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { socket } from '../socket'; 
import useAuth from '../hooks/useAuth'; // [MERGED] Added from your file
import { QRCodeSVG } from 'qrcode.react'; // [MERGED] Added from your file

const TableManagement = () => {
    const { user } = useAuth(); // [MERGED] Need user to get restaurant ID
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true); // [MERGED] Kept your loading state
    
    // Partner's Form state
    const [formData, setFormData] = useState({ 
        tableNumber: '', 
        capacity: '', 
        status: 'available' 
    });
    const [editingId, setEditingId] = useState(null); 
    const [message, setMessage] = useState('');

    const fetchTables = async () => {
        try {
            const res = await axios.get('/tables');
            setTables(res.data.sort((a, b) => a.tableNumber - b.tableNumber));
        } catch (err) { 
            console.error(err);
            setMessage("Failed to load tables.");
        } finally {
            setLoading(false); // [MERGED] Stop loading when done
        }
    };

    useEffect(() => {
        fetchTables();

        // Partner's Socket Listeners
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
                // UPDATE
                await axios.put(`/tables/${editingId}`, formData);
                setMessage(`Table ${formData.tableNumber} updated!`);
                setEditingId(null);
            } else {
                // CREATE
                await axios.post('/tables', {
                    tableNumber: parseInt(formData.tableNumber),
                    capacity: parseInt(formData.capacity)
                    // Default status is 'available' handled in backend
                });
                setMessage(`Table ${formData.tableNumber} created!`);
            }
            setFormData({ tableNumber: '', capacity: '', status: 'available' }); 
        } catch (err) {
            setMessage("Error: " + (err.response?.data?.message || err.message));
        }
    };

    const handleEdit = (table) => {
        setEditingId(table._id);
        setFormData({ 
            tableNumber: table.tableNumber, 
            capacity: table.capacity,
            status: table.status 
        });
        setMessage(`Editing Table ${table.tableNumber}...`);
    };

    const handleDelete = async (id) => {
        if(!window.confirm("Delete this table?")) return;
        try { 
            await axios.delete(`/tables/${id}`); 
        } catch (err) { 
            alert(err.message); 
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData({ tableNumber: '', capacity: '', status: 'available' });
        setMessage('');
    };

    if (loading) return <div className="p-10 text-center">Loading Tables...</div>;

    // [MERGED] URL base for QR codes
    const frontendUrl = window.location.origin;

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <header className="mb-6">
                <h1 className="text-3xl font-black text-gray-800">Table & QR Management</h1>
                <p className="text-gray-500 mt-2">Manage floor plan and generate QR codes for customers.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. CONTROL PANEL (Partner's Code) */}
                <div className="bg-white p-6 rounded shadow-md h-fit border-t-4 border-primary">
                    <h2 className="text-lg font-bold mb-4 border-b pb-2">
                        {editingId ? 'Edit Table' : 'Add New Table'}
                    </h2>
                    
                    {message && <div className="bg-blue-50 text-blue-800 p-2 text-sm rounded mb-4">{message}</div>}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Table Number</label>
                            <input 
                                type="number" required min="1"
                                value={formData.tableNumber}
                                onChange={e => setFormData({...formData, tableNumber: e.target.value})}
                                className="w-full border p-2 rounded focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Capacity</label>
                            <input 
                                type="number" required min="1"
                                value={formData.capacity}
                                onChange={e => setFormData({...formData, capacity: e.target.value})}
                                className="w-full border p-2 rounded focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>

                        {/* STATUS DROPDOWN (Only visible when editing) */}
                        {editingId && (
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
                                <select 
                                    value={formData.status}
                                    onChange={e => setFormData({...formData, status: e.target.value})}
                                    className="w-full border p-2 rounded focus:ring-2 focus:ring-primary outline-none bg-white"
                                >
                                    <option value="available">Available (Green)</option>
                                    <option value="occupied">Occupied (Red)</option>
                                    <option value="reserved">Reserved (Yellow)</option>
                                </select>
                            </div>
                        )}

                        <button type="submit" className={`py-2 rounded font-bold text-white transition ${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-primary hover:bg-orange-600'}`}>
                            {editingId ? 'Save Changes' : 'Add Table'}
                        </button>

                        {editingId && (
                            <button type="button" onClick={cancelEdit} className="text-gray-500 text-sm hover:underline">
                                Cancel Edit
                            </button>
                        )}
                    </form>
                </div>

                {/* 2. TABLE GRID (Combined Code) */}
                <div className="md:col-span-2 bg-white p-6 rounded shadow-md">
                    <h2 className="text-lg font-bold mb-4 border-b pb-2 flex justify-between">
                        <span>Floor Plan & QR Codes</span>
                        <span className="text-xs font-normal text-gray-500 mt-1">Real-time updates active 🟢</span>
                    </h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tables.map(table => {
                            // [MERGED] Generate URL for the specific table
                            const scanUrl = `${frontendUrl}/menu?restaurant=${user.restaurant}&table=${table.tableNumber}`;

                            return (
                                <div key={table._id} className={`
                                    border rounded-lg p-4 flex flex-col items-center relative group transition-all text-center
                                    ${editingId === table._id ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-gray-50 hover:shadow-md'}
                                `}>
                                    <span className="text-2xl font-black text-gray-700">Table {table.tableNumber}</span>
                                    <span className="text-xs text-gray-500 font-medium mt-1">Capacity: {table.capacity}</span>
                                    
                                    <span className={`mt-2 px-3 py-1 text-xs rounded-full uppercase font-bold ${
                                        table.status === 'available' ? 'bg-green-100 text-green-700' : 
                                        table.status === 'occupied' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {table.status}
                                    </span>

                                    {/* [MERGED] QR CODE RENDERER */}
                                    <div className="bg-white p-2 border-2 border-gray-100 rounded-lg shadow-sm mt-4 mb-2">
                                        <QRCodeSVG 
                                            value={scanUrl} 
                                            size={120} 
                                            level={"H"} 
                                        />
                                    </div>
                                    <p className="text-[9px] text-gray-400 font-mono break-all w-full px-2">
                                        {scanUrl}
                                    </p>

                                    {/* Partner's Hover Action Buttons */}
                                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEdit(table)} className="bg-white border rounded p-1 hover:text-blue-600 text-gray-400 shadow-sm" title="Edit">
                                            ✏️
                                        </button>
                                        <button onClick={() => handleDelete(table._id)} className="bg-white border rounded p-1 hover:text-red-600 text-gray-400 shadow-sm" title="Delete">
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {tables.length === 0 && (
                        <div className="text-center text-gray-500 py-12 bg-gray-50 rounded-lg border border-gray-200 mt-4">
                            No tables created yet. Add your first table using the panel!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TableManagement;