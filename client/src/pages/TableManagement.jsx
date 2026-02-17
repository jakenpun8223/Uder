import { useState, useEffect } from 'react';
import axios from '../api/axios';
import useAuth from '../hooks/useAuth';
import { QRCodeSVG } from 'qrcode.react';

const TableManagement = () => {
    const { user } = useAuth();
    const [tables, setTables] = useState([]);
    const [newTableNumber, setNewTableNumber] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTables = async () => {
            try {
                const { data } = await axios.get('/tables');
                // Sort tables numerically
                const sortedTables = data.sort((a, b) => a.tableNumber - b.tableNumber);
                setTables(sortedTables);
            } catch (err) {
                console.error(err);
                setError("Failed to load tables.");
            } finally {
                setLoading(false);
            }
        };
        fetchTables();
    }, []);

    const handleAddTable = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const { data } = await axios.post('/tables', { tableNumber: Number(newTableNumber) });
            setTables(prev => [...prev, data].sort((a, b) => a.tableNumber - b.tableNumber));
            setNewTableNumber('');
        } catch (err) {
            setError(err.response?.data?.message || "Error adding table.");
        }
    };

    const handleDelete = async (tableId) => {
        if (!window.confirm("Are you sure you want to delete this table?")) return;
        try {
            await axios.delete(`/tables/${tableId}`);
            setTables(prev => prev.filter(t => t._id !== tableId));
        } catch (err) {
            alert("Failed to delete table.");
        }
    };

    if (loading) return <div className="p-10 text-center">Loading Tables...</div>;

    // The base URL for the QR code to point to (Your frontend URL)
    const frontendUrl = window.location.origin;

    return (
        <div className="max-w-6xl mx-auto p-6">
            <header className="mb-8">
                <h1 className="text-3xl font-black text-gray-800">Table & QR Management</h1>
                <p className="text-gray-500 mt-2">Add tables and generate QR codes for customers to scan.</p>
            </header>

            {/* Add Table Form */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8 max-w-md">
                <h2 className="font-bold text-lg mb-4">Add New Table</h2>
                {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</div>}
                
                <form onSubmit={handleAddTable} className="flex gap-4">
                    <input 
                        type="number"
                        min="1"
                        required
                        value={newTableNumber}
                        onChange={(e) => setNewTableNumber(e.target.value)}
                        placeholder="Table Number"
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
                    />
                    <button 
                        type="submit"
                        className="bg-primary hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg transition"
                    >
                        Add Table
                    </button>
                </form>
            </div>

            {/* Tables Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {tables.map(table => {
                    // Generate the specific Scan URL for this table
                    const scanUrl = `${frontendUrl}/scan/${user.restaurant}/${table.tableNumber}`;

                    return (
                        <div key={table._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center">
                            <h3 className="text-2xl font-black text-gray-800 mb-4">Table {table.tableNumber}</h3>
                            
                            {/* QR CODE */}
                            <div className="bg-white p-2 border-2 border-gray-100 rounded-lg shadow-sm mb-4">
                                <QRCodeSVG 
                                    value={scanUrl} 
                                    size={150} 
                                    level={"H"} // High error correction so it scans easily
                                />
                            </div>

                            <p className="text-[10px] text-gray-400 font-mono break-all mb-4">
                                {scanUrl}
                            </p>

                            <button 
                                onClick={() => handleDelete(table._id)}
                                className="mt-auto text-red-500 hover:text-red-700 text-sm font-bold uppercase"
                            >
                                Delete Table
                            </button>
                        </div>
                    );
                })}
            </div>

            {tables.length === 0 && (
                <div className="text-center text-gray-500 py-12 bg-gray-50 rounded-lg border border-gray-200">
                    No tables created yet. Add your first table above!
                </div>
            )}
        </div>
    );
};

export default TableManagement;