import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ScanSession = () => {
    // Grab the ID and Table from the URL
    const { restaurantId, tableNumber } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (restaurantId && tableNumber) {
            // Save the customer's location in their browser
            localStorage.setItem('guest_restaurantId', restaurantId);
            localStorage.setItem('guest_tableNumber', tableNumber);
            
            // Send them straight to the menu!
            navigate('/menu');
        } else {
            navigate('/');
        }
    }, [restaurantId, tableNumber, navigate]);

    return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
            <div className="text-center animate-pulse">
                <div className="text-5xl mb-4">🍽️</div>
                <h2 className="text-xl font-bold text-gray-800">Setting your table...</h2>
            </div>
        </div>
    );
};

export default ScanSession;