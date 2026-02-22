import { useState, useEffect } from 'react';
import axios from '../api/axios';
import useAuth from '../hooks/useAuth';
import { socket } from '../socket';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast'; // IMPORT TOAST

const CATEGORIES = ['Main', 'Sushi', 'Drinks', 'Dessert', 'Starters'];
const ALLERGENS = ['lactose', 'gluten', 'shellfish', 'peanut', 'nuts', 'soy', 'eggs', 'fish', 'sesame'];

const MenuManager = () => {
    const { t } = useTranslation();
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
        } catch (err) { 
            toast.error("Error loading products"); 
        } 
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
                toast.success(t('update_dish') + "!");
            } else {
                await axios.post('/products', payload);
                toast.success(t('add_to_menu') + "!");
            }
            setEditingId(null);
            setFormData({ name: '', price: '', category: 'Main', description: '', ingredients: '', allergens: [] });
            fetchProducts();
        } catch (err) { 
            toast.error(err.response?.data?.message || "Error saving"); 
        }
    };

    const handleEdit = (product) => {
        setEditingId(product._id);
        setFormData({
            name: product.name, price: product.price, category: product.category,
            description: product.description || '', ingredients: product.ingredients.join(', '), allergens: product.allergens || []
        });
        window.scrollTo(0,0);
    };

    // REMOVED WINDOW.CONFIRM AND ADDED TOAST
    const handleDelete = async (id) => {
        try { 
            await axios.delete(`/products/${id}`); 
            toast.success(t('delete') + "!");
            fetchProducts(); 
        } catch (err) { 
            toast.error("Error deleting"); 
        }
    };

    const handleToggle = async (id) => {
        try {
            // Wait for the exact response from the database
            const { data } = await axios.patch(`/products/${id}/toggle`);
            
            // Update the screen using the confirmed Database object
            setProducts(prev => prev.map(p => p._id === id ? data : p));
            toast.success("Status updated!");
            
        } catch (err) { 
            toast.error(err.response?.data?.message || "Error updating status"); 
        }
    };

    if (loading) return <div className="p-10 text-center">{t('loading')}</div>;

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-6 pb-20">
            <h1 className="text-2xl md:text-3xl font-black text-gray-800 mb-6 uppercase tracking-wide">
                {t('menu_manager').split(' ')[0]} <span className="text-primary">{t('menu_manager').split(' ')[1] || ''}</span>
            </h1>

            <div className="bg-white p-4 md:p-6 rounded-lg shadow-md border-t-4 border-primary mb-8">
                <h2 className="text-xl font-bold mb-4">{editingId ? t('edit_dish') : t('add_new_dish')}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <input name="name" value={formData.name} onChange={handleChange} placeholder={t('dish_name')} className="border p-2 rounded w-full" required />
                        <div className="flex gap-2 w-full md:w-auto">
                            <input name="price" type="number" value={formData.price} onChange={handleChange} placeholder={t('price_ils')} className="border p-2 rounded w-full md:w-32" required />
                            <select name="category" value={formData.category} onChange={handleChange} className="border p-2 rounded w-full md:w-auto rtl:bg-right">
                                {CATEGORIES.map(c => <option key={c} value={c}>{t('cat_' + c.toLowerCase())}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <textarea name="description" value={formData.description} onChange={handleChange} placeholder={t('description')} className="border p-2 rounded w-full h-20" />
                    <input name="ingredients" value={formData.ingredients} onChange={handleChange} placeholder={t('ingredients_comma')} className="border p-2 rounded w-full" required />

                    <div>
                        <span className="font-bold text-sm block mb-2">{t('allergens_label')}</span>
                        <div className="flex flex-wrap gap-2">
                            {ALLERGENS.map(a => (
                                <label key={a} className="flex items-center space-x-1 rtl:space-x-reverse cursor-pointer bg-gray-50 px-2 py-1 rounded border text-sm">
                                    <input type="checkbox" checked={formData.allergens.includes(a)} onChange={() => handleCheckbox(a)} className="accent-primary" />
                                    <span className="capitalize">{t('allergen_' + a)}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button type="submit" className="w-full sm:w-auto bg-primary text-white px-6 py-3 md:py-2 rounded font-bold hover:bg-orange-600 transition">
                            {editingId ? t('update_dish') : t('add_to_menu')}
                        </button>
                        {editingId && (
                            <button type="button" onClick={() => { setEditingId(null); setFormData({name:'', price:'', category:'Main', description:'', ingredients:'', allergens:[]}); }} className="w-full sm:w-auto bg-gray-500 text-white px-4 py-3 md:py-2 rounded font-bold hover:bg-gray-600">
                                {t('cancel')}
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
                            <span className="font-mono font-bold text-primary text-lg">₪{product.price}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                        
                        <div className="flex items-center justify-between border-t pt-3 mt-auto">
                            <button onClick={() => handleToggle(product._id)} className={`text-[10px] md:text-xs font-bold px-2 py-1 rounded border ${product.isAvailable ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-300 text-gray-700'}`}>
                                {product.isAvailable ? t('available_caps') : t('sold_out_caps')}
                            </button>
                            <div className="flex gap-3">
                                <button onClick={() => handleEdit(product)} className="text-blue-500 font-bold text-sm">{t('edit')}</button>
                                <button onClick={() => handleDelete(product._id)} className="text-red-500 font-bold text-sm">{t('delete')}</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MenuManager;