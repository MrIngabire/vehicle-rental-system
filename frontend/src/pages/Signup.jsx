import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../api';

export default function Signup() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    first_name: '', last_name: '', username: '', email: '',
    phone: '', registration_number: '', department: 'Individual',
    password: '', password2: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      await authAPI.register(form);
      toast.success('Account created! Please sign in.');
      nav('/');
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        setErrors(data);
        toast.error('Please fix the highlighted fields.');
      } else {
        toast.error('Registration failed. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, name, type = 'text', required = true, placeholder = '' }) => (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
        {label}{required && ' *'}
      </label>
      <input
        type={type}
        value={form[name]}
        onChange={update(name)}
        required={required}
        placeholder={placeholder}
        className={`w-full px-3.5 py-2.5 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-blue-600 ${
          errors[name] ? 'border-rose-400 bg-rose-50' : 'border-slate-300'
        }`}
      />
      {errors[name] && (
        <p className="text-xs text-rose-600 mt-1">
          {Array.isArray(errors[name]) ? errors[name][0] : errors[name]}
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Left branding */}
        <div className="md:w-2/5 bg-blue-600 p-8 sm:p-10 text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                <i className="fa-solid fa-car-side text-2xl text-amber-400"></i>
              </div>
              <span className="text-xl font-bold tracking-wider uppercase text-blue-100">Kigali Drive</span>
            </div>
            <h1 className="text-2xl font-extrabold mb-3">Create Your Account</h1>
            <p className="text-blue-100 text-sm leading-relaxed">
              Join Kigali Drive to book vehicles, track invoices, and manage your rentals — all in one place.
            </p>
            <ul className="mt-6 space-y-2 text-xs text-blue-100">
              <li><i className="fa-solid fa-check mr-2 text-amber-400"></i> Real-time fleet availability</li>
              <li><i className="fa-solid fa-check mr-2 text-amber-400"></i> Instant booking confirmations</li>
              <li><i className="fa-solid fa-check mr-2 text-amber-400"></i> Digital invoices & history</li>
            </ul>
          </div>
          <div className="mt-8 pt-6 border-t border-blue-500/40 text-xs text-blue-200">
            Already registered?{' '}
            <Link to="/" className="underline text-white font-semibold">Sign in instead →</Link>
          </div>
        </div>

        {/* Right form */}
        <div className="md:w-3/5 p-8 sm:p-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Sign Up</h2>
          <p className="text-xs text-slate-500 mb-6">Customer registration — takes less than a minute</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="First Name" name="first_name" placeholder="Ben" />
              <Field label="Last Name" name="last_name" placeholder="Bazirake" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Username" name="username" placeholder="benbazirake" />
              <Field label="Email" name="email" type="email" placeholder="you@example.rw" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Phone" name="phone" required={false} placeholder="+250 78X XXX XXX" />
              <Field label="ID / Registration No." name="registration_number" required={false}
                placeholder="BBICTR/2024/45385" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                Account Type
              </label>
              <select
                value={form.department}
                onChange={update('department')}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white"
              >
                <option>Individual</option>
                <option>Corporate Client</option>
                <option>Tourist</option>
                <option>NGO Staff</option>
                <option>Government Official</option>
                <option>Mount Kigali University</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Password" name="password" type="password" placeholder="Min 8 characters" />
              <Field label="Confirm Password" name="password2" type="password" placeholder="Repeat password" />
            </div>

            {errors.non_field_errors && (
              <p className="text-xs text-rose-600">{errors.non_field_errors[0]}</p>
            )}

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? 'Creating account...' : 'Create Account'}
              <i className="fa-solid fa-arrow-right text-xs"></i>
            </button>

            <p className="text-xs text-slate-400 text-center pt-2">
              By signing up you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}