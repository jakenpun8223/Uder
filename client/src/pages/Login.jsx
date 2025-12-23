import { useState } from "react";
import useAuth from "../hooks/useAuth"; // Get the login function
import { useNavigate } from "react-router-dom"; // For redirection

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // 1. Send credentials to backend (via AuthContext)
      await login(email, password);

      // 2. If successful, redirect to the Kitchen dashboard
      navigate("/kitchen");
    } catch (err) {
      // 3. Handle errors (e.g. wrong password)
      setError(err.response?.data?.msg || "Failed to login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md border-t-4 border-primary">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Staff Login
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@uder.com"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
