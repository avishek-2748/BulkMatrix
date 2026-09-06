import mongoose from 'mongoose';

const vesselPositionSchema = new mongoose.Schema({
  vessel: { type: mongoose.Schema.Types.ObjectId, ref: 'Vessel', required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  speed: { type: Number },
  heading: { type: Number },
  timestamp: { type: Date, default: Date.now }
}, {
  timestamps: true
});

const VesselPosition = mongoose.model('VesselPosition', vesselPositionSchema);
export default VesselPosition;
