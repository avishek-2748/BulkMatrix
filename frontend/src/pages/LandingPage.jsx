import { useState, useEffect } from 'react';
import LandingNavbar from '../components/landing/LandingNavbar';
import HeroSection from '../components/landing/HeroSection';
import RoleSection from '../components/landing/RoleSection';
import PlatformSection from '../components/landing/PlatformSection';
import HowItWorks from '../components/landing/HowItWorks';
import FreightForecastPreview from '../components/landing/FreightForecastPreview';
import WeatherPreview from '../components/landing/WeatherPreview';
import VesselIntelligence from '../components/landing/VesselIntelligence';
import FinalCTA from '../components/landing/FinalCTA';
import LandingFooter from '../components/landing/LandingFooter';
import LoginModal from '../components/landing/LoginModal';
import RoleSelector from '../components/landing/RoleSelector';

const LandingPage = () => {
  const [modalState, setModalState] = useState(null); // null | 'role' | 'logistics' | 'vessel'

  const openRoleSelector = () => setModalState('role');
  const openLoginAs = (role) => setModalState(role); // 'logistics' | 'vessel'
  const closeModal = () => setModalState(null);

  // Lock body scroll when modal open
  useEffect(() => {
    if (modalState) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [modalState]);

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', overflowX: 'hidden' }}>
      <LandingNavbar onLoginClick={openRoleSelector} />

      <HeroSection
        onLoginLogistics={() => openLoginAs('logistics')}
        onLoginVessel={() => openLoginAs('vessel')}
      />

      <RoleSection
        onLoginLogistics={() => openLoginAs('logistics')}
        onLoginVessel={() => openLoginAs('vessel')}
      />

      <PlatformSection />
      <HowItWorks />
      <FreightForecastPreview />
      <WeatherPreview />
      <VesselIntelligence />

      <FinalCTA
        onLoginLogistics={() => openLoginAs('logistics')}
        onLoginVessel={() => openLoginAs('vessel')}
      />
      <LandingFooter />

      {/* Modals */}
      {modalState === 'role' && (
        <RoleSelector
          onSelect={openLoginAs}
          onClose={closeModal}
        />
      )}
      {(modalState === 'logistics' || modalState === 'vessel') && (
        <LoginModal
          role={modalState}
          onBack={openRoleSelector}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default LandingPage;
