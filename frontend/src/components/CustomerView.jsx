import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { vehicleAPI, bookingAPI } from '../api';
import { useAuth } from '../context/AuthContext';

export default function CustomerView({ mode, onSwitch }) {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [form, setForm] = useState({
    requested_category: '', requested_unit: '',
    pickup_date: '2026-11-20', return_date: '2026-11-24',
    driver_option: 'self', special_notes: '',
  });

  useEffect(() => {
    if (mode === 'fleet' || mode === 'reservation') {
      vehicleAPI.available({ search, category }).then(r => setVehicles(r.data));
    }
    if (mode === 'mybookings') {
      bookingAPI.list().then(r => setMyBookings(r.data));
    }
  }, [mode, search, category]);

  const presetReservation = (v) => {
    setSelectedVehicle(v);
    setForm(f => ({ ...f, requested_category: v.category, requested_unit: `${v.make} ${v.model}` }));
    onSwitch('reservation');
  };

  const submitReservation = async (e) => {
    e.preventDefault();
    try {
      await bookingAPI.create(form);
      toast.success('Reservation submitted! Awaiting Fleet Manager approval.');
      setForm({ ...form, requested_unit: '', special_notes: '' });
      onSwitch('mybookings');
    } catch (err) {
      toast.error('Submission failed. Check dates.');
    }
  };

  if (mode === 'fleet') return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Available Rental Fleet</h2>
          <p className="text-sm text-slate-500">Browse and reserve available vehicles</p>
        </div>
        <button onClick={() => onSwitch('reservation')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 self-start">
          <i className="fa-solid fa-plus text-xs"></i> Create Custom Reservation
        </button>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <i className="fa-solid fa-magnifying-glass text-slate-400 text-sm"></i>
          <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search vehicle make or model..."
            className="w-full text-sm outline-none" />
        </div>
        <select value={category} onChange={(e)=>setCategory(e.target.value)}
          className="text-xs border rounded-lg px-3 py-2 bg-slate-50">
          <option value="">All Categories</option>
          <option>SUV 4x4 Safari</option>
          <option>Executive Sedan</option>
          <option>Compact Economy</option>
          <option>Coaster / Minibus</option>
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map(v => (
          <div key={v.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md">
            <div className="relative h-48 bg-slate-200">
              <img src={v.image_url} alt={v.model} className="w-full h-full object-cover" />
              <span className="absolute top-3 right-3 bg-emerald-500 text-white text-xs px-2.5 py-1 rounded-full font-semibold">
                Available
              </span>
            </div>
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{v.make} {v.model}</h3>
                  <p className="text-xs text-slate-500">{v.category} • {v.year}</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-extrabold text-blue-600">{Number(v.daily_rate).toLocaleString()}</span>
                  <span className="text-xs text-slate-500 block">RWF / day</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 my-4 pt-3 border-t text-xs text-slate-600">
                <span><i className="fa-solid fa-users mr-1"></i> {v.seats} Seats</span>
                <span><i className="fa-solid fa-gears mr-1"></i> {v.transmission}</span>
                <span><i className="fa-solid fa-gas-pump mr-1"></i> {v.fuel_type}</span>
              </div>
              <button onClick={()=>presetReservation(v)}
                className="w-full bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 font-semibold py-2.5 rounded-lg text-xs transition">
                Book This Vehicle
              </button>
            </div>
          </div>
        ))}
        {vehicles.length === 0 && <p className="text-sm text-slate-500 col-span-3">No available vehicles.</p>}
      </div>
    </div>
  );

  if (mode === 'reservation') return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Vehicle Reservation Form</h2>
            <p className="text-xs text-blue-100 mt-0.5">Submit your rental dates and preferences</p>
          </div>
          <i className="fa-solid fa-calendar-check text-3xl text-blue-300/60"></i>
        </div>
        <form onSubmit={submitReservation} className="p-6 sm:p-8 space-y-6">
          <div className="bg-slate-50 p-4 rounded-xl border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                {user.full_name?.split(' ').map(n=>n[0]).join('').slice(0,2)}
              </div>
              <div>
                <h4 className="text-sm font-bold">{user.full_name}</h4>
                <p className="text-xs text-slate-500">Reg: {user.registration_number || '—'} • Customer Account</p>
              </div>
            </div>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-semibold">Verified Client</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1 uppercase">Vehicle Category *</label>
              <select required value={form.requested_category}
                onChange={(e)=>setForm({...form, requested_category: e.target.value})}
                className="w-full px-3.5 py-2.5 text-sm border rounded-lg bg-white">
                <option value="">Select Category...</option>
                <option>SUV 4x4 Safari</option>
                <option>Executive Sedan</option>
                <option>Compact Economy</option>
                <option>Coaster / Minibus</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 uppercase">Preferred Vehicle Unit</label>
              <input value={form.requested_unit}
                onChange={(e)=>setForm({...form, requested_unit: e.target.value})}
                placeholder="e.g. Toyota Land Cruiser Prado TX"
                className="w-full px-3.5 py-2.5 text-sm border rounded-lg" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1 uppercase">Pickup Date *</label>
              <input type="date" required value={form.pickup_date}
                onChange={(e)=>setForm({...form, pickup_date: e.target.value})}
                className="w-full px-3.5 py-2.5 text-sm border rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 uppercase">Return Date *</label>
              <input type="date" required value={form.return_date}
                onChange={(e)=>setForm({...form, return_date: e.target.value})}
                className="w-full px-3.5 py-2.5 text-sm border rounded-lg" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 uppercase">Driver Option</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { v: 'self', l: 'Self-Drive' },
                { v: 'chauffeur', l: 'Professional Chauffeur' },
                { v: 'safari', l: 'Safari Guide + Driver' },
              ].map(o => (
                <label key={o.v} className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 text-xs">
                  <input type="radio" name="driver" checked={form.driver_option===o.v}
                    onChange={()=>setForm({...form, driver_option: o.v})} />
                  {o.l}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 uppercase">Special Requirements / Pickup Location</label>
            <textarea rows="3" value={form.special_notes}
              onChange={(e)=>setForm({...form, special_notes: e.target.value})}
              placeholder="Airport transfer, GPS, child seat, itinerary..."
              className="w-full px-3.5 py-2.5 text-sm border rounded-lg"></textarea>
          </div>
          <div className="pt-4 border-t flex justify-end gap-3">
            <button type="button" onClick={()=>onSwitch('customer')}
              className="px-5 py-2.5 rounded-lg border text-slate-700 font-semibold text-sm hover:bg-slate-100">Cancel</button>
            <button type="submit"
              className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center gap-2">
              <i className="fa-solid fa-paper-plane text-xs"></i> Submit Booking Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (mode === 'mybookings') return (
    <div>
      <h2 className="text-2xl font-bold mb-2">My Bookings</h2>
      <p className="text-sm text-slate-500 mb-6">Track status and review your invoices</p>
      <div className="space-y-4">
        {myBookings.map(b => (
          <div key={b.id} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex flex-wrap justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded">{b.reference}</span>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                  b.status === 'approved' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                  b.status === 'rejected' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                  b.status === 'completed' ? 'bg-slate-100 text-slate-700 border-slate-200' :
                  'bg-amber-100 text-amber-800 border-amber-200'
                }`}>Status: {b.status.toUpperCase()}</span>
              </div>
              <span className="text-xs text-slate-500">{new Date(b.created_at).toLocaleDateString()}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-3">
              <div>
                <span className="text-xs text-slate-400 uppercase">Vehicle</span>
                <p className="text-sm font-bold">{b.vehicle_details ? `${b.vehicle_details.make} ${b.vehicle_details.model}` : b.requested_unit || b.requested_category}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase">Pickup</span>
                <p className="text-sm font-bold">{b.pickup_date}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase">Return</span>
                <p className="text-sm font-bold">{b.return_date}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase">Total Invoice</span>
                <p className="text-sm font-bold text-blue-700">{Number(b.total_amount).toLocaleString()} RWF</p>
              </div>
            </div>
            {b.manager_feedback && (
              <div className="text-xs bg-slate-50 p-2.5 rounded border">
                <strong>Manager feedback:</strong> {b.manager_feedback}
              </div>
            )}
          </div>
        ))}
        {myBookings.length === 0 && <p className="text-sm text-slate-500">No bookings yet.</p>}
      </div>
    </div>
  );

  return null;
}