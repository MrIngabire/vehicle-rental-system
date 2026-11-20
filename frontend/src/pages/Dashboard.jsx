import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import CustomerView from '../components/CustomerView';
import ManagerView from '../components/ManagerView';
import AdminView from '../components/AdminView';

const roleBadgeText = {
  customer: 'Customer Account',
  manager: 'Fleet Manager',
  admin: 'System Administrator',
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [screen, setScreen] = useState(
    user.role === 'customer' ? 'customer' :
    user.role === 'manager' ? 'manager' : 'admin'
  );

  const handleLogout = () => { logout(); nav('/'); };

  const tabs = user.role === 'customer'
    ? [{ id: 'customer', label: 'Fleet Inventory', icon: 'fa-grid-2' },
       { id: 'reservation', label: 'New Booking', icon: 'fa-calendar-plus' },
       { id: 'mybookings', label: 'My Bookings', icon: 'fa-list-check' }]
    : user.role === 'manager'
    ? [{ id: 'manager', label: 'Fleet Manager', icon: 'fa-clipboard-check' },
       { id: 'vehicles', label: 'Vehicle Fleet', icon: 'fa-car' }]
    : [{ id: 'admin', label: 'System Overview', icon: 'fa-chart-line' },
       { id: 'users', label: 'User Management', icon: 'fa-users' },
       { id: 'reports', label: 'Reports', icon: 'fa-file-lines' }];

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-800">
      <header className="bg-slate-900 text-white shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-amber-400">
              <i className="fa-solid fa-car-side"></i>
            </div>
            <div>
              <span className="font-bold text-base text-white">Kigali Drive</span>
              <span className="text-xs text-blue-400 block -mt-1 hidden sm:block">Vehicle Rental MIS</span>
            </div>
          </div>
          <nav className="flex items-center gap-1 overflow-x-auto">
            {tabs.map(t => (
              <button key={t.id} onClick={()=>setScreen(t.id)}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg transition flex items-center gap-2 whitespace-nowrap ${
                  screen === t.id ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}>
                <i className={`fa-solid ${t.icon} text-xs`}></i>
                <span>{t.label}</span>
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <span className="bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs px-2.5 py-1 rounded-full font-semibold hidden md:inline-block">
              {roleBadgeText[user.role]}
            </span>
            <button onClick={handleLogout}
              className="text-xs bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 transition flex items-center gap-1.5">
              <i className="fa-solid fa-right-from-bracket"></i>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {screen === 'customer' && <CustomerView mode="fleet" onSwitch={setScreen} />}
        {screen === 'reservation' && <CustomerView mode="reservation" onSwitch={setScreen} />}
        {screen === 'mybookings' && <CustomerView mode="mybookings" onSwitch={setScreen} />}
        {screen === 'manager' && <ManagerView mode="pending" />}
        {screen === 'vehicles' && <ManagerView mode="vehicles" />}
        {screen === 'admin' && <AdminView mode="overview" onSwitch={setScreen} />}
        {screen === 'users' && <AdminView mode="users" onSwitch={setScreen} />}
        {screen === 'reports' && <AdminView mode="reports" onSwitch={setScreen} />}
      </main>

      <footer className="bg-white border-t border-slate-200 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-400">
          Vehicle Rental and Booking Management System © 2026 • Bazirake Ben • Mount Kigali University
        </div>
      </footer>
    </div>
  );
}