import express from 'express';
import { 
  getFreightAnalytics, 
  getCongestionAnalytics, 
  getRiskCalendar, 
  getCommodityAnalytics,
  getFxAnalytics,
  getFuelAnalytics,
  runScenarioSimulation 
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/freight', protect, getFreightAnalytics);
router.get('/congestion', protect, getCongestionAnalytics);
router.get('/risk-calendar', protect, getRiskCalendar);
router.get('/commodity', protect, getCommodityAnalytics);
router.get('/fx', protect, getFxAnalytics);
router.get('/fuel', protect, getFuelAnalytics);
router.post('/scenario', protect, runScenarioSimulation);

export default router;
