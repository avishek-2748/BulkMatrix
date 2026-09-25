import Availability from '../models/Availability.js';
import Vessel from '../models/Vessel.js';

// @desc    Add vessel availability/unavailability record
// @route   POST /api/availability
// @access  Private (Owner)
export const addAvailability = async (req, res) => {
  try {
    const { vesselId, busyFrom, busyTo, reason, location } = req.body;
    
    // Verify ownership
    const vessel = await Vessel.findById(vesselId);
    if (!vessel || vessel.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const availability = await Availability.create({
      vesselId,
      busyFrom,
      busyTo,
      reason,
      location
    });
    
    res.status(201).json(availability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get availability records for a vessel
// @route   GET /api/availability/:vesselId
// @access  Private
export const getAvailability = async (req, res) => {
  try {
    const records = await Availability.find({ vesselId: req.params.vesselId }).sort({ busyFrom: 1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
