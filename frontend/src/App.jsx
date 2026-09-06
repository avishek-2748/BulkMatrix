import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import CharterPlanner from './pages/CharterPlanner';
import LiveOps from './pages/LiveOps';
import Analytics from './pages/Analytics';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Signup from './pages/Signup';
import WeatherIntelligence from './pages/WeatherIntelligence';
import ForecastHistory from './pages/ForecastHistory';
import { DataProvider } from './context/DataContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

const DashboardLayout = () => (
  <div className="flex h-screen overflow-hidden" style={{ background: 'var(--page-bg)', fontFamily: "'Inter', sans-serif" }}>
    <Sidebar />
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      <Navbar />
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected Dashboard Routes */}
            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path="/" element={<Home />} />
              <Route path="/planner" element={<CharterPlanner />} />
              <Route path="/live" element={<LiveOps />} />
              <Route path="/weather" element={<WeatherIntelligence />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/history" element={<ForecastHistory />} />
              {/* Admin Only Route */}
              <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><Admin /></ProtectedRoute>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
