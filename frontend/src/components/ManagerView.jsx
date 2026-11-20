import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { bookingAPI, vehicleAPI } from '../api';

export default function ManagerView({ mode }) {
  const [pending, setPending] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [feedback, setFeedback] = useState({});

  const load = () => {
    if (mode === 'pending') bookingAPI.pending().then(r => setPending(r.data));
    if (mode === 'vehicles') vehicleAPI.list().then(r => setVehicles(r.data));
  };
  useEffect(load, [mode]);

  const handleAction = async (id, action) => {
    try {
      await bookingAPI[action](id, feedback[id] || '');
      toast.success(`Booking ${action}d`);
      setFeedback({ ...feedback, [id]: '' });
      load();
    } catch { toast.error('Operation failed'); }
  };

  const setStatus = async (id, status) => {
    try {
      await vehicleAPI.setStatus(id, status);
      toast.success(`Vehicle marked ${status}`);
      load();
    } catch { toast.error('Update failed'); }
  };

  if (mode === 'pending') return (
    <div>
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Fleet Manager Review Queue</h2>
          <p className="text-sm text-slate-500">Review bookings, assign vehicles, approve or reject</p>
        </div>
        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-lg border border-amber-200">
          <i className="fa-solid fa-clock mr-1"></i> {pending.length} Pending Approval
        </span>
      </div>
      <div className="space-y-6">
        {pending.map(b => (
          <div key={b.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 p-4 border-b flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded">{b.reference}</span>
                <span className="text-xs text-slate-500">Submitted {new Date(b.created_at).toLocaleString()}</span>
              </div>
              <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full border border-amber-200">Status: Pending Review</span>
            </div>
            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <span className="text-xs text-slate-400 uppercase">Customer</span>
                    <p className="text-sm font-bold">{b.customer_details?.full_name}</p>
                    <p className="text-xs text-slate-500">{b.customer_details?.registration_number || b.customer_details?.email}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 uppercase">Requested Vehicle</span>
                    <p className="text-sm font-bold">{b.requested_unit || b.vehicle_details?.model || '—'}</p>
                    <p className="text-xs text-blue-600">{b.requested_category}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 uppercase">Rental Duration</span>
                    <p className="text-sm font-bold">{b.pickup_date} → {b.return_date}</p>
                    <p className="text-xs text-slate-500">{b.days} Day(s)</p>
                  </div>
                </div>
                {b.special_notes && (
                  <div className="bg-slate-50 p-3 rounded text-xs">
                    <strong>Special Notes:</strong> {b.special_notes}
                  </div>
                )}
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border flex flex-col justify-between">
                <div>
                  <label className="block text-xs font-semibold mb-1 uppercase">Manager Feedback</label>
                  <textarea rows="2" value={feedback[b.id] || ''}
                    onChange={(e)=>setFeedback({ ...feedback, [b.id]: e.target.value })}
                    placeholder="Approval conditions or reason..."
                    className="w-full text-xs p-2 border rounded mb-3 bg-white"></textarea>
                </div>
                <div className="flex gap-2">
                  <button onClick={()=>handleAction(b.id, 'approve')}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 rounded flex items-center justify-center gap-1">
                    <i className="fa-solid fa-check"></i> Approve
                  </button>
                  <button onClick={()=>handleAction(b.id, 'reject')}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold py-2 rounded flex items-center justify-center gap-1">
                    <i className="fa-solid fa-xmark"></i> Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {pending.length === 0 && <p className="text-sm text-slate-500">No pending bookings.</p>}
      </div>
    </div>
  );

  if (mode === 'vehicles') return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Fleet Management</h2>
      <p className="text-sm text-slate-500 mb-6">Update vehicle availability or maintenance status</p>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="py-3 px-4">Vehicle</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Daily Rate</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {vehicles.map(v => (
              <tr key={v.id}>
                <td className="py-3 px-4 font-bold text-sm">{v.make} {v.model}<span className="block text-xs text-slate-500">{v.license_plate}</span></td>
                <td className="py-3 px-4 text-xs">{v.category}</td>
                <td className="py-3 px-4 text-xs">{Number(v.daily_rate).toLocaleString()} RWF</td>
                <td className="py-3 px-4">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    v.status === 'available' ? 'bg-emerald-100 text-emerald-800' :
                    v.status === 'booked' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                  }`}>{v.status}</span>
                </td>
                <td className="py-3 px-4 text-right space-x-1">
                  <button onClick={()=>setStatus(v.id, 'available')} className="text-xs text-emerald-700 font-semibold hover:underline">Available</button>
                  <button onClick={()=>setStatus(v.id, 'booked')} className="text-xs text-amber-700 font-semibold hover:underline">Booked</button>
                  <button onClick={()=>setStatus(v.id, 'maintenance')} className="text-xs text-slate-700 font-semibold hover:underline">Maintenance</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return null;
}