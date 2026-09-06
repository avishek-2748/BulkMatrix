import * as mlService from '../services/mlService.js';
import Charter from '../models/Charter.js';

export const generateRecommendation = async (req, res) => {
  try {
    const params = req.body;
    // Basic validation
    if (!params.cargo_volume_tonnes || !params.origin_port || !params.destination_ports) {
      return res.status(400).json({ message: "Missing required charter parameters" });
    }
    
    // Call ML service abstraction
    const recommendation = await mlService.getCharterRecommendation(params);
    
    // Save to Database mapping frontend params to our schema
    const charter = await Charter.create({
      user: req.user._id, // Available because of protect middleware
      cargoVolume: params.cargo_volume_tonnes,
      commodity: params.commodity === 'Coal' ? 'coal' : 'iron_ore',
      originPort: params.origin_port,
      destinationPorts: params.destination_ports,
      contractType: params.contract_type === 'Spot' ? 'spot' : params.contract_type === 'Short Term' ? 'short_term' : 'medium_term',
      arrivalWindowStart: params.arrival_window_start,
      arrivalWindowEnd: params.arrival_window_end,
      recommendedVessel: recommendation.vesselRecommendation?.class,
      marketSignal: recommendation.marketSignal?.signal,
      status: 'recommended'
    });

    res.status(201).json({
      ...recommendation,
      charterId: charter._id
    });
  } catch (error) {
    res.status(500).json({ message: "Error generating recommendation", error: error.message });
  }
};
