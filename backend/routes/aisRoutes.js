import express from 'express';
import Vessel from '../models/Vessel.js';

const router = express.Router();

// Generate some random coordinates near major routes for demo purposes
const basePoints = [
  { lat: 1.290270, lng: 103.851959 }, // Singapore
  { lat: 21.050302, lng: 107.288220 }, // Vietnam
  { lat: 29.868336, lng: 121.543991 }, // Ningbo
  { lat: -20.312213, lng: 118.575005 }, // Port Hedland
  { lat: 25.204849, lng: 55.270782 }, // Dubai
];

const standardFleet = [
  { vesselName: 'Ocean Giant', vesselClass: 'Capesize', status: 'ON_CHARTER', owner: 'Star Bulk Carriers', baseLat: 17.6868, baseLng: 83.2185 }, // Vizag
  { vesselName: 'Baltic Horizon', vesselClass: 'Supramax', status: 'AVAILABLE', owner: 'Oldendorff', baseLat: 20.8258, baseLng: 86.9749 }, // Dhamra
  { vesselName: 'Cape Discovery', vesselClass: 'Capesize', status: 'ON_CHARTER', owner: 'Berge Bulk', baseLat: -20.3122, baseLng: 118.5750 }, // Port Hedland
  { vesselName: 'Golden Saguenay', vesselClass: 'Panamax', status: 'AVAILABLE', owner: 'Golden Ocean', baseLat: 1.2902, baseLng: 103.8519 }, // Singapore
  { vesselName: 'Nordic Bulk', vesselClass: 'Ultramax', status: 'ON_CHARTER', owner: 'Norden A/S', baseLat: 25.2048, baseLng: 55.2707 }, // Dubai
];

router.get('/live', async (req, res) => {
  try {
    const vessels = await Vessel.find().populate('ownerId', 'company name');
    const timeOffset = Date.now() / 100000;

    // Map registered DB vessels
    const liveVessels = vessels.map((vessel, i) => {
      const base = basePoints[i % basePoints.length];
      const moveX = Math.sin(timeOffset + i) * 0.4;
      const moveY = Math.cos(timeOffset + i) * 0.4;

      return {
        _id: vessel._id,
        vesselName: vessel.vesselName,
        vesselClass: vessel.vesselClass,
        status: vessel.status,
        owner: vessel.ownerId ? (vessel.ownerId.company || vessel.ownerId.name) : 'Fleet Owner',
        position: {
          lat: parseFloat((base.lat + moveX).toFixed(4)),
          lng: parseFloat((base.lng + moveY).toFixed(4))
        },
        speed: (10 + (Math.sin(timeOffset * 2 + i) * 4)).toFixed(1), // 6-14 knots
        heading: Math.floor(Math.abs(Math.sin(timeOffset + i)) * 360),
        isMyFleet: true
      };
    });

    // Supplement with tracked global vessels along major bulk routes
    standardFleet.forEach((std, idx) => {
      const moveX = Math.sin(timeOffset + idx + 10) * 0.35;
      const moveY = Math.cos(timeOffset + idx + 10) * 0.35;

      liveVessels.push({
        _id: `std-vessel-${idx}`,
        vesselName: std.vesselName,
        vesselClass: std.vesselClass,
        status: std.status,
        owner: std.owner,
        position: {
          lat: parseFloat((std.baseLat + moveX).toFixed(4)),
          lng: parseFloat((std.baseLng + moveY).toFixed(4))
        },
        speed: (11 + (Math.cos(timeOffset * 2 + idx) * 3)).toFixed(1),
        heading: Math.floor(Math.abs(Math.cos(timeOffset + idx)) * 360),
        isMyFleet: false
      });
    });

    res.json(liveVessels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
