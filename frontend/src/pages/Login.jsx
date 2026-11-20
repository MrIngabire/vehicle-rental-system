import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [username, setUsername] = useState('customer');
  const [password, setPassword] = useState('customer123');
  const [loading, setLoading] = useState(false);

  const roleMap = {
    customer: { u: 'customer', p: 'customer123' },
    manager: { u: 'manager', p: 'manager123' },
    admin: { u: 'admin', p: 'admin123' },
  };

  const handleRoleChange = (e) => {
    const r = e.target.value;
    setUsername(roleMap[r].u);
    setPassword(roleMap[r].p);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(username, password);
      toast.success('Login successful');
      nav('/dashboard');
    } catch (err) {
      toast.error('Invalid credentials');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        <div className="md:w-1/2 bg-blue-600 p-8 sm:p-12 text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                <i className="fa-solid fa-car-side text-2xl text-amber-400"></i>
              </div>
              <span className="text-xl font-bold tracking-wider uppercase text-blue-100">Kigali Drive</span>
            </div>
            <h1 className="text-3xl font-extrabold mb-3">Vehicle Rental & Booking Management System</h1>
            <p className="text-blue-100 text-sm">Streamlined mobility solutions and real-time fleet management across Rwanda.</p>
          </div>
          <div className="mt-8 pt-6 border-t border-blue-500/40 text-xs text-blue-200 flex justify-between">
            <span>Case Study: Car Rental Company</span>
            <span className="bg-blue-700/60 px-2.5 py-1 rounded-full">Rwanda</span>
          </div>
        </div>
        <div className="md:w-1/2 p-8 sm:p-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Sign In to Account</h2>
          <p className="text-xs text-slate-500 mb-6">Select your user role to access the personalized portal</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">Username</label>
              <div className="relative">
                <i className="fa-solid fa-envelope absolute left-3.5 top-3.5 text-slate-400 text-sm"></i>
                <input value={username} onChange={(e)=>setUsername(e.target.value)} required
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">Password</label>
              <div className="relative">
                <i className="fa-solid fa-lock absolute left-3.5 top-3.5 text-slate-400 text-sm"></i>
                <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">Quick Role Select</label>
              <select onChange={handleRoleChange} defaultValue="customer"
                className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg bg-white">
                <option value="customer">Customer Portal</option>
                <option value="manager">Fleet Manager Interface</option>
                <option value="admin">Administrator Overview</option>
              </select>
            </div>
            <button disabled={loading} type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? 'Signing in...' : 'Access Portal'} <i className="fa-solid fa-arrow-right text-xs"></i>
            </button>
          </form>
          <p className="text-xs text-slate-400 mt-6 text-center">Default credentials provided for demo purposes</p>
          <p className="text-xs text-slate-500 mt-4 text-center">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-600 font-semibold hover:underline">
                Create one →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}