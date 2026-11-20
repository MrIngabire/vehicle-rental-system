import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { userAPI, reportAPI } from '../api';

export default function AdminView({ mode, onSwitch }) {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [financial, setFinancial] = useState(null);
  const [activity, setActivity] = useState(null);
  const [newUser, setNewUser] = useState({ username: '', email: '', first_name: '', last_name: '', role: 'customer', password: '' });

  const load = async () => {
  try {
    if (mode === 'overview') {
      const r = await reportAPI.financial();
      setStats(r.data);
    }
    if (mode === 'users') {
      const r = await userAPI.list();
      setUsers(r.data);
    }
    if (mode === 'reports') {
      const [fin, act] = await Promise.all([
        reportAPI.financial(),
        reportAPI.activity(),
      ]);
      setFinancial(fin.data);
      setActivity(act.data);
    }
  } catch (err) {
    console.error('AdminView load failed:', err);
    toast.error('Failed to load data');
  }
};

useEffect(() => {
  load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [mode]);

  const createUser = async (e) => {
    e.preventDefault();
    try {
      await userAPI.create(newUser);
      toast.success('User created');
      setNewUser({ username: '', email: '', first_name: '', last_name: '', role: 'customer', password: '' });
      load();
    } catch { toast.error('Creation failed. Username may exist.'); }
  };

  const deleteUser = async (id) => {
    if (!confirm('Delete this user?')) return;
    await userAPI.remove(id);
    toast.success('User removed');
    load();
  };

  const changeRole = async (id, role) => {
    await userAPI.update(id, { role });
    toast.success('Role updated');
    load();
  };

  const toggleActive = async (u) => {
    await userAPI.update(u.id, { is_active: !u.is_active });
    toast.success('Access updated');
    load();
  };

  const exportReport = () => {
    const txt = JSON.stringify({ financial, activity }, null, 2);
    const blob = new Blob([txt], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `report_${Date.now()}.json`;
    a.click();
  };

  if (mode === 'overview') return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">System Management Overview</h2>
          <p className="text-sm text-slate-500">High-level metrics and system control</p>
        </div>
        <button onClick={exportReport} className="bg-slate-900 text-white text-xs font-semibold px-3 py-2 rounded flex items-center gap-1.5">
          <i className="fa-solid fa-file-export"></i> Export Report
        </button>
      </div>
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">Total Fleet</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><i className="fa-solid fa-car"></i></div>
            </div>
            <span className="text-3xl font-extrabold">{stats.fleet_total} Units</span>
            <span className="text-xs text-emerald-600 font-semibold block mt-1">{stats.fleet_available} Available</span>
          </div>
          <div className="bg-white p-5 rounded-xl border">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">Active Bookings</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"><i className="fa-solid fa-calendar-check"></i></div>
            </div>
            <span className="text-3xl font-extrabold">{stats.approved_bookings}</span>
            <span className="text-xs text-slate-500 block mt-1">{stats.pending_bookings} Pending</span>
          </div>
          <div className="bg-white p-5 rounded-xl border">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">Total Revenue</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center"><i className="fa-solid fa-money-bill-wave"></i></div>
            </div>
            <span className="text-3xl font-extrabold">{Number(stats.total_revenue).toLocaleString()}</span>
            <span className="text-xs text-slate-500 block mt-1">RWF</span>
          </div>
          <div className="bg-white p-5 rounded-xl border">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">System Users</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center"><i className="fa-solid fa-users"></i></div>
            </div>
            <span className="text-3xl font-extrabold">{stats.total_users}</span>
            <span className="text-xs text-blue-600 font-semibold block mt-1">3 Roles Configured</span>
          </div>
        </div>
      )}
    </div>
  );

  if (mode === 'users') return (
    <div>
      <h2 className="text-2xl font-bold mb-2">User & Role Management</h2>
      <p className="text-sm text-slate-500 mb-6">Add staff, change roles, revoke access</p>

      <form onSubmit={createUser} className="bg-white p-5 rounded-xl border mb-6 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <input required placeholder="Username" value={newUser.username} onChange={(e)=>setNewUser({...newUser, username: e.target.value})} className="px-3 py-2 text-sm border rounded" />
        <input placeholder="Email" value={newUser.email} onChange={(e)=>setNewUser({...newUser, email: e.target.value})} className="px-3 py-2 text-sm border rounded" />
        <input placeholder="First name" value={newUser.first_name} onChange={(e)=>setNewUser({...newUser, first_name: e.target.value})} className="px-3 py-2 text-sm border rounded" />
        <input placeholder="Last name" value={newUser.last_name} onChange={(e)=>setNewUser({...newUser, last_name: e.target.value})} className="px-3 py-2 text-sm border rounded" />
        <input required placeholder="Password" type="password" value={newUser.password} onChange={(e)=>setNewUser({...newUser, password: e.target.value})} className="px-3 py-2 text-sm border rounded" />
        <div className="flex gap-2">
          <select value={newUser.role} onChange={(e)=>setNewUser({...newUser, role: e.target.value})} className="px-3 py-2 text-sm border rounded bg-white flex-1">
            <option value="customer">Customer</option>
            <option value="manager">Fleet Manager</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit" className="bg-blue-600 text-white text-xs font-semibold px-3 py-2 rounded">Add</button>
        </div>
      </form>

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Access</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map(u => (
                <tr key={u.id}>
                  <td className="py-3 px-4">
                    <div className="font-bold text-sm">{u.full_name}</div>
                    <div className="text-xs text-slate-500">{u.email || u.username}</div>
                  </td>
                  <td className="py-3 px-4">
                    <select value={u.role} onChange={(e)=>changeRole(u.id, e.target.value)}
                      className="text-xs font-bold border rounded px-2 py-1 bg-white">
                      <option value="customer">Customer</option>
                      <option value="manager">Fleet Manager</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-bold flex items-center gap-1 ${u.is_active ? 'text-emerald-600' : 'text-rose-600'}`}>
                      <span className={`w-2 h-2 rounded-full ${u.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                      {u.is_active ? 'Active' : 'Revoked'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button onClick={()=>toggleActive(u)} className="text-xs text-blue-600 font-semibold hover:underline">
                      {u.is_active ? 'Revoke' : 'Reactivate'}
                    </button>
                    <button onClick={()=>deleteUser(u.id)} className="text-xs text-rose-600 font-semibold hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  if (mode === 'reports') return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Financial & Activity Reports</h2>
          <p className="text-sm text-slate-500">Audit trail and performance analytics</p>
        </div>
        <button onClick={exportReport} className="bg-slate-900 text-white text-xs font-semibold px-3 py-2 rounded flex items-center gap-1.5">
          <i className="fa-solid fa-file-export"></i> Download JSON
        </button>
      </div>
      {financial && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl border"><span className="text-xs text-slate-400 uppercase">Revenue</span><p className="text-xl font-extrabold mt-1">{Number(financial.total_revenue).toLocaleString()} RWF</p></div>
          <div className="bg-white p-4 rounded-xl border"><span className="text-xs text-slate-400 uppercase">Approved</span><p className="text-xl font-extrabold mt-1">{financial.approved_bookings}</p></div>
          <div className="bg-white p-4 rounded-xl border"><span className="text-xs text-slate-400 uppercase">Pending</span><p className="text-xl font-extrabold mt-1">{financial.pending_bookings}</p></div>
          <div className="bg-white p-4 rounded-xl border"><span className="text-xs text-slate-400 uppercase">Rejected</span><p className="text-xl font-extrabold mt-1">{financial.rejected_bookings}</p></div>
        </div>
      )}
      {activity && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="p-4 border-b"><h3 className="font-bold">Recent Activity (Last 10 Bookings)</h3></div>
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Vehicle</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {activity.recent_activity.map((a, i) => (
                <tr key={i}>
                  <td className="py-3 px-4 text-xs font-bold">{a.reference}</td>
                  <td className="py-3 px-4 text-xs">{a.customer}</td>
                  <td className="py-3 px-4 text-xs">{a.vehicle}</td>
                  <td className="py-3 px-4 text-xs font-semibold uppercase">{a.status}</td>
                  <td className="py-3 px-4 text-xs">{new Date(a.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return null;
}