import { useState } from 'react';
import axios from '../api/axios';

const StaffManagement = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'staff' });
    const [message, setMessage] = useState('');

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            // This hits the new endpoint we made: /api/users/staff
            await axios.post('/users/staff', formData);
            setMessage(`Success! Added ${formData.name}`);
            setFormData({ name: '', email: '', password: '', role: 'staff' }); // Reset
        } catch (err) {
            setMessage("Error: " + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="p-6 bg-white rounded shadow-md max-w-lg mx-auto mt-10">
            <h2 className="text-xl font-bold mb-4">Add New Staff Member</h2>
            {message && <div className={`p-2 mb-4 rounded ${message.includes('Error') ? 'bg-red-100' : 'bg-green-100'}`}>{message}</div>}
            
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
                <input type="text" placeholder="Name" className="border p-2 rounded" required 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                
                <input type="email" placeholder="Email" className="border p-2 rounded" required 
                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                
                <input type="password" placeholder="Password" className="border p-2 rounded" required 
                    value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                
                <select className="border p-2 rounded" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                    <option value="staff">Waiter (Staff)</option>
                    <option value="kitchen">Kitchen</option>
                </select>

                <button type="submit" className="bg-primary text-white py-2 rounded font-bold">Create User</button>
            </form>
        </div>
    );
};

export default StaffManagement;