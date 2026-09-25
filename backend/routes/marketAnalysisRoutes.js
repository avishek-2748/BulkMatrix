import express from 'express';
import {
  getMarketOverview,
  getMarketIndexDetail,
  getLatestMacroIndicators,
} from '../controllers/marketAnalysisController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Main market overview endpoint
router.get('/overview', protect, getMarketOverview);

// Latest indicators for Charter Planner & forecasting systems
router.get('/macro-indicators', protect, getLatestMacroIndicators);

// Specific routes for the 6 core indices
router.get('/fuel', protect, (req, res, next) => {
  req.params.indexKey = 'fuel';
  getMarketIndexDetail(req, res, next);
});

router.get('/usd-inr', protect, (req, res, next) => {
  req.params.indexKey = 'usd-inr';
  getMarketIndexDetail(req, res, next);
});

router.get('/dxy', protect, (req, res, next) => {
  req.params.indexKey = 'dxy';
  getMarketIndexDetail(req, res, next);
});

router.get('/bdi', protect, (req, res, next) => {
  req.params.indexKey = 'bdi';
  getMarketIndexDetail(req, res, next);
});

router.get('/coal', protect, (req, res, next) => {
  req.params.indexKey = 'coal';
  getMarketIndexDetail(req, res, next);
});

router.get('/iron-ore', protect, (req, res, next) => {
  req.params.indexKey = 'iron-ore';
  getMarketIndexDetail(req, res, next);
});

// Dynamic route for any market index
router.get('/:indexKey', protect, getMarketIndexDetail);

export default router;
