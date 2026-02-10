import { useState, useEffect } from 'react';
import axios from '../api/axios';

const TableManagement = () => {
    const [tables, setTables] = useState([]);
    // Form state
    const [newTable, setNewTable] = useState({ tableNumber: '', capacity: '' });
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    // Load existing tables
    const fetchTables = async () => {
        try {
            const res = await axios.get('/tables');
            setTables(res.data.sort((a, b) => a.tableNumber - b.tableNumber));
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchTables();
    }, []);

    const handleAddTable = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsError(false);

        try {
            // Using the Admin-only route: POST /api/tables
            await axios.post('/tables', {
                tableNumber: parseInt(newTable.tableNumber),
                capacity: parseInt(newTable.capacity)
            });

            setMessage(`Table ${newTable.tableNumber} created successfully!`);
            setNewTable({ tableNumber: '', capacity: '' });
            fetchTables(); // Refresh list
        } catch (err) {
            setIsError(true);
            setMessage(err.response?.data?.message || "Failed to create table");
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Table Management</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* CREATE FORM */}
                <div className="bg-white p-6 rounded shadow-md h-fit">
                    <h2 className="text-lg font-semibold mb-4 border-b pb-2">Add New Table</h2>
                    
                    {message && (
                        <div className={`p-2 mb-4 text-sm rounded ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleAddTable} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Table Number</label>
                            <input 
                                type="number" 
                                required
                                value={newTable.tableNumber}
                                onChange={e => setNewTable({...newTable, tableNumber: e.target.value})}
                                className="w-full border p-2 rounded focus:ring-2 focus:ring-primary outline-none"
                                placeholder="e.g. 15"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                            <input 
                                type="number" 
                                required
                                value={newTable.capacity}
                                onChange={e => setNewTable({...newTable, capacity: e.target.value})}
                                className="w-full border p-2 rounded focus:ring-2 focus:ring-primary outline-none"
                                placeholder="e.g. 4"
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="bg-primary hover:bg-red-600 text-white font-bold py-2 rounded transition-colors"
                        >
                            Add Table
                        </button>
                    </form>
                </div>

                {/* TABLE LIST */}
                <div className="md:col-span-2 bg-white p-6 rounded shadow-md">
                    <h2 className="text-lg font-semibold mb-4 border-b pb-2">Current Floor Plan</h2>
                    
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {tables.map(table => (
                            <div key={table._id} className="border rounded p-3 flex flex-col items-center bg-gray-50 relative">
                                <span className="text-xl font-bold text-gray-700">{table.tableNumber}</span>
                                <span className="text-xs text-gray-500">Cap: {table.capacity}</span>
                                <div className={`mt-2 text-[10px] px-2 py-0.5 rounded-full ${
                                    table.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                    {table.status}
                                </div>
                            </div>
                        ))}
                    </div>
                    {tables.length === 0 && <p className="text-gray-500 text-center py-4">No tables defined yet.</p>}
                </div>
            </div>
        </div>
    );
};

export default TableManagement;