import { useState, useEffect } from 'react';
import axios from '../api/axios';
import useAuth from '../hooks/useAuth';

const CATEGORIES = ['Main', 'Sushi', 'Drinks', 'Dessert', 'Starters'];
const ALLERGENS = ['lactose', 'gluten', 'shellfish', 'peanut', 'nuts', 'soy', 'eggs', 'fish', 'sesame'];

const MenuManager = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        category: 'Main',
        description: '',
        ingredients: '',
        allergens: []
    });

    // Fetch All Products (Kitchen sees everything, even unavailable)
    const fetchProducts = async () => {
        try {
            const { data } = await axios.get('/products/all');
            setProducts(data);
        } catch (err) {
            console.error("Failed to load menu", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Handle Form Input
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckbox = (allergen) => {
        setFormData(prev => {
            const current = prev.allergens;
            if (current.includes(allergen)) {
                return { ...prev, allergens: current.filter(a => a !== allergen) };
            } else {
                return { ...prev, allergens: [...current, allergen] };
            }
        });
    };

    // Submit (Create or Update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Format ingredients from string to array
        const payload = {
            ...formData,
            ingredients: formData.ingredients.split(',').map(i => i.trim()).filter(i => i)
        };

        try {
            if (editingId) {
                await axios.put(`/products/${editingId}`, payload);
                alert("Dish updated!");
            } else {
                await axios.post('/products', payload);
                alert("New Dish Created!");
            }
            // Reset and Refresh
            setEditingId(null);
            setFormData({ name: '', price: '', category: 'Main', description: '', ingredients: '', allergens: [] });
            fetchProducts();
        } catch (err) {
            alert(err.response?.data?.message || "Error saving product");
        }
    };

    // Edit Mode
    const handleEdit = (product) => {
        setEditingId(product._id);
        setFormData({
            name: product.name,
            price: product.price,
            category: product.category,
            description: product.description || '',
            ingredients: product.ingredients.join(', '),
            allergens: product.allergens || []
        });
        window.scrollTo(0,0);
    };

    // Delete
    const handleDelete = async (id) => {
        if(!window.confirm("Are you sure you want to delete this dish completely?")) return;
        try {
            await axios.delete(`/products/${id}`);
            fetchProducts();
        } catch (err) {
            alert("Error deleting");
        }
    };

    // Toggle Availability (86'ing items)
    const handleToggle = async (id) => {
        try {
            await axios.patch(`/products/${id}/toggle`);
            // Optimistic Update
            setProducts(prev => prev.map(p => 
                p._id === id ? { ...p, isAvailable: !p.isAvailable } : p
            ));
        } catch (err) {
            alert("Could not update availability");
        }
    };

    if (loading) return <div className="p-10 text-center">Loading Menu Data...</div>;

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-3xl font-black text-gray-800 mb-8 uppercase tracking-wide">
                Menu <span className="text-primary">Manager</span>
            </h1>

            {/* --- Editor Form --- */}
            <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-primary mb-10">
                <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Dish' : 'Add New Dish'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="name" value={formData.name} onChange={handleChange} placeholder="Dish Name" className="border p-2 rounded w-full" required />
                        <div className="flex gap-2">
                            <input name="price" type="number" value={formData.price} onChange={handleChange} placeholder="Price" className="border p-2 rounded w-full" required />
                            <select name="category" value={formData.category} onChange={handleChange} className="border p-2 rounded">
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="border p-2 rounded w-full h-20" />
                    
                    <input name="ingredients" value={formData.ingredients} onChange={handleChange} placeholder="Ingredients (comma separated: Rice, Nori, Salmon)" className="border p-2 rounded w-full" required />

                    <div>
                        <span className="font-bold text-sm block mb-2">Allergens:</span>
                        <div className="flex flex-wrap gap-3">
                            {ALLERGENS.map(a => (
                                <label key={a} className="flex items-center space-x-1 cursor-pointer bg-gray-50 px-2 py-1 rounded border">
                                    <input 
                                        type="checkbox" 
                                        checked={formData.allergens.includes(a)} 
                                        onChange={() => handleCheckbox(a)}
                                        className="accent-primary"
                                    />
                                    <span className="text-sm capitalize">{a}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="submit" className="bg-primary text-white px-6 py-2 rounded font-bold hover:bg-orange-600 transition">
                            {editingId ? 'Update Dish' : 'Add to Menu'}
                        </button>
                        {editingId && (
                            <button type="button" onClick={() => { setEditingId(null); setFormData({name:'', price:'', category:'Main', description:'', ingredients:'', allergens:[]}); }} className="bg-gray-500 text-white px-4 py-2 rounded font-bold hover:bg-gray-600">
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* --- Product List --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                    <div key={product._id} className={`border rounded-lg p-4 shadow-sm relative ${!product.isAvailable ? 'bg-gray-100 opacity-90' : 'bg-white'}`}>
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg">{product.name}</h3>
                            <span className="font-mono font-bold text-primary">${product.price}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                        <div className="flex flex-wrap gap-1 mb-3">
                            <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">{product.category}</span>
                            {product.allergens.map(a => (
                                <span key={a} className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{a}</span>
                            ))}
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-between border-t pt-3 mt-2">
                            <button 
                                onClick={() => handleToggle(product._id)}
                                className={`text-xs font-bold px-3 py-1 rounded border ${product.isAvailable ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-300 text-gray-700'}`}
                            >
                                {product.isAvailable ? 'AVAILABLE' : 'SOLD OUT'}
                            </button>
                            <div className="flex gap-2">
                                <button onClick={() => handleEdit(product)} className="text-blue-500 hover:underline text-sm font-medium">Edit</button>
                                <button onClick={() => handleDelete(product._id)} className="text-red-500 hover:underline text-sm font-medium">Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MenuManager;