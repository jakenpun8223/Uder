import { useState, useEffect } from 'react';
import axios from '../api/axios';
import useAuth from '../hooks/useAuth';
import { socket } from '../socket';

const CATEGORIES = ['Main', 'Sushi', 'Drinks', 'Dessert', 'Starters'];
const ALLERGENS = ['lactose', 'gluten', 'shellfish', 'peanut', 'nuts', 'soy', 'eggs', 'fish', 'sesame'];

const MenuManager = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        name: '', price: '', category: 'Main', description: '', ingredients: '', allergens: []
    });

    const fetchProducts = async () => {
        try {
            const { data } = await axios.get('/products/all');
            setProducts(data);
        } catch (err) { console.error(err); } 
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchProducts();

        const handleUpdate = (updatedProduct) => {
            setProducts(prev => {
                const exists = prev.find(p => p._id === updatedProduct._id);
                if (exists) return prev.map(p => p._id === updatedProduct._id ? updatedProduct : p);
                return [...prev, updatedProduct];
            });
        };

        const handleDelete = (deletedId) => {
            setProducts(prev => prev.filter(p => p._id !== deletedId));
        };

        socket.on('menu_updated', handleUpdate);
        socket.on('menu_deleted', handleDelete);

        return () => {
            socket.off('menu_updated', handleUpdate);
            socket.off('menu_deleted', handleDelete);
        };
    }, []);

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleCheckbox = (allergen) => {
        setFormData(prev => {
            const current = prev.allergens;
            return current.includes(allergen) 
                ? { ...prev, allergens: current.filter(a => a !== allergen) }
                : { ...prev, allergens: [...current, allergen] };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = { ...formData, ingredients: formData.ingredients.split(',').map(i => i.trim()).filter(i => i) };

        try {
            if (editingId) {
                await axios.put(`/products/${editingId}`, payload);
            } else {
                await axios.post('/products', payload);
            }
            setEditingId(null);
            setFormData({ name: '', price: '', category: 'Main', description: '', ingredients: '', allergens: [] });
            fetchProducts();
        } catch (err) { alert(err.response?.data?.message || "Error saving"); }
    };

    const handleEdit = (product) => {
        setEditingId(product._id);
        setFormData({
            name: product.name, price: product.price, category: product.category,
            description: product.description || '', ingredients: product.ingredients.join(', '), allergens: product.allergens || []
        });
        window.scrollTo(0,0);
    };

    const handleDelete = async (id) => {
        if(!window.confirm("Delete this dish completely?")) return;
        try { await axios.delete(`/products/${id}`); fetchProducts(); } catch (err) { alert("Error deleting"); }
    };

    const handleToggle = async (id) => {
        try {
            await axios.patch(`/products/${id}/toggle`);
            setProducts(prev => prev.map(p => p._id === id ? { ...p, isAvailable: !p.isAvailable } : p));
        } catch (err) { alert("Error"); }
    };

    if (loading) return <div className="p-10 text-center">Loading Menu Data...</div>;

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-6 pb-20">
            <h1 className="text-2xl md:text-3xl font-black text-gray-800 mb-6 uppercase tracking-wide">
                Menu <span className="text-primary">Manager</span>
            </h1>

            <div className="bg-white p-4 md:p-6 rounded-lg shadow-md border-t-4 border-primary mb-8">
                <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Dish' : 'Add New Dish'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <input name="name" value={formData.name} onChange={handleChange} placeholder="Dish Name" className="border p-2 rounded w-full" required />
                        <div className="flex gap-2 w-full md:w-auto">
                            <input name="price" type="number" value={formData.price} onChange={handleChange} placeholder="Price (₪)" className="border p-2 rounded w-full md:w-32" required />
                            <select name="category" value={formData.category} onChange={handleChange} className="border p-2 rounded w-full md:w-auto">
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="border p-2 rounded w-full h-20" />
                    <input name="ingredients" value={formData.ingredients} onChange={handleChange} placeholder="Ingredients (comma separated)" className="border p-2 rounded w-full" required />

                    <div>
                        <span className="font-bold text-sm block mb-2">Allergens:</span>
                        <div className="flex flex-wrap gap-2">
                            {ALLERGENS.map(a => (
                                <label key={a} className="flex items-center space-x-1 cursor-pointer bg-gray-50 px-2 py-1 rounded border text-sm">
                                    <input type="checkbox" checked={formData.allergens.includes(a)} onChange={() => handleCheckbox(a)} className="accent-primary" />
                                    <span className="capitalize">{a}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button type="submit" className="w-full sm:w-auto bg-primary text-white px-6 py-3 md:py-2 rounded font-bold hover:bg-orange-600 transition">
                            {editingId ? 'Update Dish' : 'Add to Menu'}
                        </button>
                        {editingId && (
                            <button type="button" onClick={() => { setEditingId(null); setFormData({name:'', price:'', category:'Main', description:'', ingredients:'', allergens:[]}); }} className="w-full sm:w-auto bg-gray-500 text-white px-4 py-3 md:py-2 rounded font-bold hover:bg-gray-600">
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {products.map(product => (
                    <div key={product._id} className={`border rounded-lg p-4 shadow-sm relative ${!product.isAvailable ? 'bg-gray-100 opacity-90' : 'bg-white'}`}>
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg leading-tight w-3/4">{product.name}</h3>
                            {/* CHANGED TO SHEKEL HERE */}
                            <span className="font-mono font-bold text-primary text-lg">₪{product.price}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                        
                        <div className="flex items-center justify-between border-t pt-3 mt-auto">
                            <button onClick={() => handleToggle(product._id)} className={`text-[10px] md:text-xs font-bold px-2 py-1 rounded border ${product.isAvailable ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-300 text-gray-700'}`}>
                                {product.isAvailable ? 'AVAILABLE' : 'SOLD OUT'}
                            </button>
                            <div className="flex gap-3">
                                <button onClick={() => handleEdit(product)} className="text-blue-500 font-bold text-sm">Edit</button>
                                <button onClick={() => handleDelete(product._id)} className="text-red-500 font-bold text-sm">Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MenuManager;