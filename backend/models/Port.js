import mongoose from 'mongoose';

const portSchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: { type: String, required: true },
  region: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
  maxDraft: { type: Number },
  maxLOA: { type: Number },
  maxBeam: { type: Number },
  dischargeRate: { type: Number }, // tonnes per day
  congestionLevel: { 
    type: String,
    enum: ['low', 'medium', 'high']
  },
  averageWaitingDays: { type: Number }
}, {
  timestamps: true
});

const Port = mongoose.model('Port', portSchema);
export default Port;
