import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import CharterPlanner from './pages/CharterPlanner';
import LiveOps from './pages/LiveOps';
import LiveOperations from './pages/LiveOperations';
import MarketAnalysis from './pages/MarketAnalysis';
import MarketIndexDetail from './pages/MarketIndexDetail';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Signup from './pages/Signup';
import WeatherIntelligence from './pages/WeatherIntelligence';
import LandingPage from './pages/LandingPage';
import VerifyEmail from './pages/auth/VerifyEmail';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import FleetList from './pages/owner/FleetList';
import AddVessel from './pages/owner/AddVessel';
import ContractRequests from './pages/owner/ContractRequests';
import ActiveContracts from './pages/owner/ActiveContracts';
import VesselDetail from './pages/owner/VesselDetail';
import CharterContracts from './pages/CharterContracts';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import VoyageAnalytics from './pages/VoyageAnalytics';
import VoyageCalculator from './pages/VoyageCalculator';
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
            <Route path="/verify-email" element={<VerifyEmail />} />

            {/* Protected Dashboard Routes */}
            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Home />} />
              <Route path="/planner" element={<CharterPlanner />} />
              <Route path="/contracts" element={<CharterContracts />} />
              <Route path="/analytics" element={<VoyageAnalytics />} />
              <Route path="/calculator" element={<VoyageCalculator />} />
              <Route path="/live" element={<LiveOps />} />
              <Route path="/live-tracker" element={<LiveOperations />} />
              <Route path="/weather" element={<WeatherIntelligence />} />
              {/* Market Analysis - primary route */}
              <Route path="/market-analysis" element={<MarketAnalysis />} />
              <Route path="/market-analysis/:indexKey" element={<MarketIndexDetail />} />
              {/* Owner Routes */}
              <Route path="/owner/dashboard" element={<OwnerDashboard />} />
              <Route path="/owner/fleet" element={<FleetList />} />
              <Route path="/owner/fleet/add" element={<AddVessel />} />
              <Route path="/owner/fleet/:id" element={<VesselDetail />} />
              <Route path="/owner/requests" element={<ContractRequests />} />
              <Route path="/owner/contracts" element={<ActiveContracts />} />
              
              {/* Common Routes */}
              <Route path="/chat" element={<Chat />} />
              <Route path="/profile" element={<Profile />} />
              
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
