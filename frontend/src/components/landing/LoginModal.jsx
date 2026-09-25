import LogisticsAuthModal from './LogisticsAuthModal';

/**
 * Unified Login/Auth Modal for BulkMatrix
 * Directly integrates Sign In and Create Account (Sign Up) tabs
 * tailored for both Logistics Manager and Vessel Owner roles.
 */
const LoginModal = ({ role = 'logistics', onBack, onClose }) => {
  return <LogisticsAuthModal role={role} onBack={onBack} onClose={onClose} />;
};

export default LoginModal;
