import mongoose from 'mongoose';

const vesselSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional for backward compatibility with existing data
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
  yearBuilt: { type: Number },
  flag: { type: String },
  fuelType: { type: String, enum: ['VLSFO', 'HSFO'] },
  speed: { type: Number },
  fuelConsumption: { type: Number },
  latitude: { type: Number },
  longitude: { type: Number },
  destination: { type: String },
  eta: { type: Date },
  status: { 
    type: String, 
    enum: ['AVAILABLE', 'ON_CHARTER', 'MAINTENANCE', 'available', 'sailing', 'waiting', 'berthed', 'delayed'],
    default: 'AVAILABLE'
  }
}, {
  timestamps: true
});

const Vessel = mongoose.model('Vessel', vesselSchema);
export default Vessel;
