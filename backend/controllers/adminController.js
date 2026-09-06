import User from '../models/User.js';
import Charter from '../models/Charter.js';
import * as mockDataService from '../services/mockDataService.js';

export const getSystemStats = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const charterCount = await Charter.countDocuments();
    // Include the mock database rows in the count
    const totalRecords = userCount + charterCount + 8400000;

    res.json({
      freshness: '< 2 mins',
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'HEALTHY',
      totalRecords: totalRecords >= 1000000 ? `${(totalRecords/1000000).toFixed(1)}M+` : totalRecords.toString()
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching stats", error: error.message });
  }
};

export const updateAisPosition = async (req, res) => {
  try {
    const { vesselId, lat, lng } = req.body;
    
    if (!vesselId || lat === undefined || lng === undefined) {
      return res.status(400).json({ message: "Missing required AIS parameters" });
    }

    const updated = await mockDataService.updateVesselLocation(vesselId, parseFloat(lat), parseFloat(lng));
    
    if (updated) {
      res.json({ message: "AIS Position successfully updated", vesselId, lat, lng });
    } else {
      res.status(404).json({ message: "Vessel not found in active fleet" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating AIS", error: error.message });
  }
};
