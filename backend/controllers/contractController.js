import Contract from '../models/Contract.js';
import Vessel from '../models/Vessel.js';
import Notification from '../models/Notification.js';

// @desc    Create a new contract request (Logistic Manager -> Owner)
// @route   POST /api/contracts
// @access  Private
export const createContractRequest = async (req, res) => {
  try {
    const { vesselOwnerId, cargoType, volume, originPort, destinationPort, arrivalWindowStart, arrivalWindowEnd, contractType } = req.body;
    
    const contract = new Contract({
      logisticManagerId: req.user._id,
      vesselOwnerId,
      cargoType,
      volume,
      originPort,
      destinationPort,
      arrivalWindowStart,
      arrivalWindowEnd,
      contractType,
      status: 'PENDING'
    });
    
    await contract.save();

    // Create notification for owner
    await Notification.create({
      userId: vesselOwnerId,
      title: 'New Contract Request',
      message: `You have received a new ${contractType} request for ${volume}t of ${cargoType}.`,
      type: 'CONTRACT_REQUEST',
      relatedEntityId: contract._id,
      relatedEntityType: 'Contract'
    });

    res.status(201).json(contract);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get incoming contract requests for owner
// @route   GET /api/contracts/requests
// @access  Private (Owner)
export const getIncomingRequests = async (req, res) => {
  try {
    const requests = await Contract.find({ 
      vesselOwnerId: req.user._id,
      status: { $in: ['PENDING', 'NEGOTIATING'] } 
    }).populate('logisticManagerId', 'name company');
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update contract status (Accept/Reject)
// @route   PUT /api/contracts/:id/status
// @access  Private (Owner)
export const updateContractStatus = async (req, res) => {
  try {
    const { status, vesselId } = req.body;
    const contract = await Contract.findById(req.params.id);
    
    if (!contract) return res.status(404).json({ message: 'Contract not found' });
    if (contract.vesselOwnerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    contract.status = status;
    if (vesselId) {
      contract.vesselId = vesselId;
    }
    
    await contract.save();

    // Notify manager
    await Notification.create({
      userId: contract.logisticManagerId,
      title: 'Contract Update',
      message: `Your contract request was ${status.toLowerCase()} by the owner.`,
      type: 'CONTRACT_UPDATE',
      relatedEntityId: contract._id,
      relatedEntityType: 'Contract'
    });

    res.json(contract);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get active/upcoming contracts
// @route   GET /api/contracts/active
// @access  Private (Owner)
export const getActiveContracts = async (req, res) => {
  try {
    const contracts = await Contract.find({ 
      vesselOwnerId: req.user._id,
      status: { $in: ['ACCEPTED', 'ACTIVE'] } 
    }).populate('logisticManagerId', 'name company')
      .populate('vesselId', 'vesselName imoNumber');
    
    res.json(contracts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit handover details
// @route   PUT /api/contracts/:id/handover
// @access  Private (Owner)
export const submitHandoverDetails = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ message: 'Contract not found' });
    
    contract.handoverDetails = req.body;
    contract.status = 'ACTIVE';
    if (req.body.vesselId) {
      contract.vesselId = req.body.vesselId;
    }
    await contract.save();

    // Notify manager that voyage has commenced
    await Notification.create({
      userId: contract.logisticManagerId,
      title: 'Voyage Handover Completed',
      message: `The vessel owner has submitted handover details for your ${contract.cargoType} cargo. Status is now ACTIVE.`,
      type: 'CONTRACT_UPDATE',
      relatedEntityId: contract._id,
      relatedEntityType: 'Contract'
    }).catch(err => console.error('Notification error:', err));

    res.json(contract);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all charter contracts requested by the logged-in Logistic Manager
// @route   GET /api/contracts/my-contracts
// @access  Private (Logistic Manager / User)
export const getMyCharterContracts = async (req, res) => {
  try {
    const contracts = await Contract.find({ logisticManagerId: req.user._id })
      .populate('vesselOwnerId', 'name company email')
      .populate('vesselId', 'vesselName imoNumber vesselClass flag dwt')
      .sort({ createdAt: -1 });

    res.json(contracts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
