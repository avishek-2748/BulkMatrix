import Vessel from '../models/Vessel.js';

// @desc    Add a new vessel
// @route   POST /api/vessels
// @access  Private (Owner)
export const addVessel = async (req, res) => {
  try {
    const vessel = new Vessel({
      ownerId: req.user._id,
      ...req.body
    });
    const createdVessel = await vessel.save();
    res.status(201).json(createdVessel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all vessels owned by current user
// @route   GET /api/vessels
// @access  Private (Owner)
export const getMyVessels = async (req, res) => {
  try {
    const vessels = await Vessel.find({ ownerId: req.user._id });
    res.json(vessels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get vessel details
// @route   GET /api/vessels/:id
// @access  Private (Owner)
export const getVesselById = async (req, res) => {
  try {
    const vessel = await Vessel.findById(req.params.id);
    if (!vessel) return res.status(404).json({ message: 'Vessel not found' });
    
    if (vessel.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this vessel' });
    }
    
    res.json(vessel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update vessel details
// @route   PUT /api/vessels/:id
// @access  Private (Owner)
export const updateVessel = async (req, res) => {
  try {
    const vessel = await Vessel.findById(req.params.id);
    if (!vessel) return res.status(404).json({ message: 'Vessel not found' });

    if (vessel.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this vessel' });
    }

    const updatedVessel = await Vessel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedVessel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a vessel
// @route   DELETE /api/vessels/:id
// @access  Private (Owner)
export const deleteVessel = async (req, res) => {
  try {
    const vessel = await Vessel.findById(req.params.id);
    if (!vessel) return res.status(404).json({ message: 'Vessel not found' });

    if (vessel.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this vessel' });
    }

    await vessel.deleteOne();
    res.json({ message: 'Vessel removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get live positions of all owned vessels
// @route   GET /api/vessels/live-tracking
// @access  Private (Owner)
export const getLiveTracking = async (req, res) => {
  try {
    // For now, this returns the static lat/lon stored on the vessel.
    // Future integration with MarineTraffic API would fetch actual live data here.
    const vessels = await Vessel.find({ ownerId: req.user._id }).select('vesselName imoNumber latitude longitude status eta destination');
    res.json(vessels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
