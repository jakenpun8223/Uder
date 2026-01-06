import { useState } from 'react';
import useAuth from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        restaurantName: ''
    });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(formData.name, formData.email, formData.password, formData.restaurantName);;
      navigate('/kitchen'); // Redirect to dashboard after signup
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-primary">Owner Registration</h2>
          {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-bold mb-2">Restaurant Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Mama's Pizza"
                  className="w-full border p-2 rounded"
                  value={formData.restaurantName}
                  onChange={(e) => setFormData({...formData, restaurantName: e.target.value})}
                  />
              </div>
              
              {/* ... (Keep Name, Email, Password fields same as before) ... */}
              <div>
                <label className="block text-gray-700 font-bold mb-2">Manager Name</label>
                <input type="text" required className="w-full border p-2 rounded"
                    value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-2">Email</label>
                <input type="email" required className="w-full border p-2 rounded"
                    value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-2">Password</label>
                <input type="password" required className="w-full border p-2 rounded"
                    value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
              </div>

              <button type="submit" className="w-full bg-primary text-white font-bold py-2 rounded hover:bg-orange-600">
                Create Restaurant
              </button>
              </form>
              <div className="mt-4 text-center">
                <Link to="/login" className="text-sm text-gray-500 hover:text-primary">Already have an account? Login</Link>
              </div>
            </div>
        </div>
    );
};

export default Register;