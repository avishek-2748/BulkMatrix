import mongoose from 'mongoose';

const vesselSchema = new mongoose.Schema({
  vesselName: { type: String, required: true },
  imoNumber: { type: String, required: true, unique: true },
  vesselClass: { 
    type: String, 
    enum: ['Handysize', 'Supramax', 'Panamax', 'Capesize'],
    required: true 
  },
  dwt: { type: Number },
  draft: { type: Number },
  loa: { type: Number },
  beam: { type: Number },
  speed: { type: Number },
  fuelConsumption: { type: Number },
  latitude: { type: Number },
  longitude: { type: Number },
  destination: { type: String },
  eta: { type: Date },
  status: { 
    type: String, 
    enum: ['available', 'sailing', 'waiting', 'berthed', 'delayed'],
    default: 'available'
  }
}, {
  timestamps: true
});

const Vessel = mongoose.model('Vessel', vesselSchema);
export default Vessel;
