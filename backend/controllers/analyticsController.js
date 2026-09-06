import * as mockAnalyticsService from '../services/mockAnalyticsService.js';
import * as mlService from '../services/mlService.js';

export const getFreightAnalytics = async (req, res) => {
  try {
    const data = await mockAnalyticsService.getFreightData();
    res.json(data);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

export const getCongestionAnalytics = async (req, res) => {
  try {
    const data = await mockAnalyticsService.getCongestionData();
    res.json(data);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

export const getRiskCalendar = async (req, res) => {
  try {
    const data = await mockAnalyticsService.getRiskCalendarData();
    res.json(data);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

export const getCommodityAnalytics = async (req, res) => {
  try {
    const data = await mockAnalyticsService.getCommodityData();
    res.json(data);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

export const getFxAnalytics = async (req, res) => {
  try {
    const data = await mockAnalyticsService.getFxData();
    res.json(data);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

export const getFuelAnalytics = async (req, res) => {
  try {
    const data = await mockAnalyticsService.getFuelData();
    res.json(data);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

export const runScenarioSimulation = async (req, res) => {
  try {
    const params = req.body;
    const impact = await mlService.simulateScenario(params);
    res.json(impact);
  } catch (error) {
    res.status(500).json({ message: "Error running scenario", error: error.message });
  }
};
