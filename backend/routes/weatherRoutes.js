/**
 * weatherRoutes.js
 * Routes for weather and marine data.
 */

import { Router } from 'express';
import { getPorts, getCurrentWeather, getForecast } from '../controllers/weatherController.js';

const router = Router();

// GET /api/weather/ports — list all supported Indian ports
router.get('/ports', getPorts);

// GET /api/weather/current/:portId — live weather + marine data for a port
router.get('/current/:portId', getCurrentWeather);

// GET /api/weather/forecast/:portId — 16-day hourly forecast + 7-day marine forecast
router.get('/forecast/:portId', getForecast);

export default router;
