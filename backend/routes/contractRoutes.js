import express from 'express';
import { 
  createContractRequest, 
  getIncomingRequests, 
  updateContractStatus, 
  getActiveContracts,
  submitHandoverDetails,
  getMyCharterContracts
} from '../controllers/contractController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createContractRequest);
router.get('/requests', protect, getIncomingRequests);
router.get('/active', protect, getActiveContracts);
router.get('/my-contracts', protect, getMyCharterContracts);
router.put('/:id/status', protect, updateContractStatus);
router.put('/:id/handover', protect, submitHandoverDetails);

export default router;
