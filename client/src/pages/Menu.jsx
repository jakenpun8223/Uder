import { useState, useEffect } from 'react';
import axios from '../api/axios';

const Menu = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                // Public route only returns available items
                const { data } = await axios.get('/products');
                setProducts(data);
                // Extract unique categories for filtering/sorting
                const cats = [...new Set(data.map(p => p.category))];
                setCategories(cats);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchMenu();
    }, []);

    if (loading) return <div className="text-center p-10">Loading Menu...</div>;

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tight">Our <span className="text-primary">Menu</span></h1>
                <p className="text-gray-500 mt-2">Fresh ingredients, made to order.</p>
            </div>

            {categories.map(cat => (
                <div key={cat} className="mb-12">
                    <h2 className="text-2xl font-bold border-b-2 border-gray-100 pb-2 mb-6 text-gray-800">{cat}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {products.filter(p => p.category === cat).map(item => (
                            <div key={item._id} className="group flex flex-col justify-between bg-white hover:shadow-lg transition-shadow duration-300 rounded-lg p-5 border border-gray-100">
                                <div>
                                    <div className="flex justify-between items-baseline mb-2">
                                        <h3 className="font-bold text-xl text-gray-800">{item.name}</h3>
                                        <span className="text-lg font-bold text-primary">${item.price}</span>
                                    </div>
                                    <p className="text-gray-600 text-sm mb-3 leading-relaxed">{item.description}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {item.allergens && item.allergens.map(allergen => (
                                            <span key={allergen} className="text-[10px] font-bold uppercase tracking-wider text-red-500 bg-red-50 px-2 py-1 rounded">
                                                {allergen}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Menu;