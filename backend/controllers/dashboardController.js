import * as mockDataService from '../services/mockDataService.js';

export const getDashboardKPIs = async (req, res) => {
  try {
    const kpis = await mockDataService.getKPIs();
    res.json(kpis);
  } catch (error) {
    res.status(500).json({ message: "Error fetching KPIs", error: error.message });
  }
};
