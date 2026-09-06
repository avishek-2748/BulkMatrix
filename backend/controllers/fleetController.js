import * as mockDataService from '../services/mockDataService.js';

export const getAllFleet = async (req, res) => {
  try {
    const fleet = await mockDataService.getFleet();
    res.json(fleet);
  } catch (error) {
    res.status(500).json({ message: "Error fetching fleet", error: error.message });
  }
};

export const getVessel = async (req, res) => {
  try {
    const vessel = await mockDataService.getVesselById(req.params.id);
    if (!vessel) {
      return res.status(404).json({ message: "Vessel not found" });
    }
    res.json(vessel);
  } catch (error) {
    res.status(500).json({ message: "Error fetching vessel", error: error.message });
  }
};
