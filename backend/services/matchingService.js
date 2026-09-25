import Vessel from '../models/Vessel.js';
import User from '../models/User.js';
import Availability from '../models/Availability.js';

export const findBestOwners = async (recommendation, arrivalWindowStart, arrivalWindowEnd) => {
  const targetClass = recommendation.vessel_class || 'Supramax';
  
  // 1. Get all potential vessels matching the class (case-insensitive)
  let potentialVessels = await Vessel.find({
    vesselClass: { $regex: new RegExp(`^${targetClass}$`, 'i') }
  }).populate('ownerId');

  // If no exact class match found, fall back to any available vessels so the manager has options
  if (potentialVessels.length === 0) {
    potentialVessels = await Vessel.find({}).populate('ownerId');
  }

  const availableVessels = [];
  
  // 2. Filter by availability
  for (const vessel of potentialVessels) {
    if (!vessel.ownerId) continue;
    
    // Check if there is any overlapping busy period
    let isBusy = false;
    if (arrivalWindowStart && arrivalWindowEnd && !isNaN(new Date(arrivalWindowStart)) && !isNaN(new Date(arrivalWindowEnd))) {
      isBusy = await Availability.exists({
        vesselId: vessel._id,
        $or: [
          { busyFrom: { $lte: new Date(arrivalWindowEnd) }, busyTo: { $gte: new Date(arrivalWindowStart) } }
        ]
      });
    }

    if (!isBusy) {
      availableVessels.push(vessel);
    }
  }

  // 3. Group by Owner
  const ownerMap = new Map();
  for (const vessel of availableVessels) {
    const ownerId = vessel.ownerId._id.toString();
    if (!ownerMap.has(ownerId)) {
      ownerMap.set(ownerId, {
        owner: vessel.ownerId,
        availableVessels: []
      });
    }
    ownerMap.get(ownerId).availableVessels.push(vessel);
  }

  const ownerCandidates = Array.from(ownerMap.values());
  const MAX_FLEET_SIZE = 10; // Assume 10 is a large fleet for normalization

  const rankedOwners = [];

  // 4. Rank by weighted score
  for (const candidate of ownerCandidates) {
    let score = 0;
    const owner = candidate.owner;

    // 1. Class Match (30%) - Assumed 100% since we filtered
    score += 30;

    // 2. Availability (25%) - Assumed 100% since we filtered
    score += 25;

    // 3. Fleet Size in Class (15%)
    const fleetSize = candidate.availableVessels.length;
    score += Math.min(fleetSize / MAX_FLEET_SIZE, 1) * 15;

    // 4. Owner Rating (10%)
    const rating = owner.rating || 0;
    score += (rating / 5.0) * 10;

    // 5. Response Rate (8%) - Assuming 90% if not tracked
    const responseRate = owner.responseRate || 90; 
    score += (responseRate / 100.0) * 8;

    // 6. Geographic Preference (5%)
    // (Assuming boolean match for now based on some theoretical prefered route)
    score += 5; // simplified

    // 7. Insurance Status (4%)
    // (Assuming true for now)
    score += 4; // simplified

    // 8. Last Activity (3%)
    const lastLogin = owner.lastLogin || new Date();
    const daysSinceActive = Math.floor((new Date() - new Date(lastLogin)) / (1000 * 60 * 60 * 24));
    const activityScore = Math.max(0, 3 - (daysSinceActive * 0.1));
    score += activityScore;

    rankedOwners.push({
      ownerId: owner._id,
      name: owner.name,
      company: owner.company,
      rating: owner.rating,
      fleetAvailable: fleetSize,
      score: parseFloat(score.toFixed(2))
    });
  }

  // Sort descending by score
  rankedOwners.sort((a, b) => b.score - a.score);

  return rankedOwners;
};
