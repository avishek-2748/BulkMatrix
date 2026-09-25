import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import CharterPlanner from './pages/CharterPlanner';
import LiveOps from './pages/LiveOps';
import MarketAnalysis from './pages/MarketAnalysis';
import MarketIndexDetail from './pages/MarketIndexDetail';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Signup from './pages/Signup';
import WeatherIntelligence from './pages/WeatherIntelligence';
import LandingPage from './pages/LandingPage';
import { DataProvider } from './context/DataContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

const DashboardLayout = () => {
  const location = useLocation();
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F4FAFD', color: '#23466B', fontFamily: "'Inter', sans-serif" }}>
      <Navbar />
      <main
        key={location.pathname}
        className="flex-1 page-enter"
        style={{ width: '100%', maxWidth: '1600px', margin: '0 auto', padding: '32px 36px 56px', boxSizing: 'border-box' }}
      >
        <Outlet />
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected Dashboard Routes */}
            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Home />} />
              <Route path="/planner" element={<CharterPlanner />} />
              <Route path="/live" element={<LiveOps />} />
              <Route path="/weather" element={<WeatherIntelligence />} />
              {/* Market Analysis - primary route */}
              <Route path="/market-analysis" element={<MarketAnalysis />} />
              <Route path="/market-analysis/:indexKey" element={<MarketIndexDetail />} />
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
