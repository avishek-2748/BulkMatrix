import mongoose from 'mongoose';

const contractSchema = new mongoose.Schema({
  logisticManagerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vesselOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vesselId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vessel' }, // Can be null during initial request if open
  cargoType: { type: String, required: true },
  volume: { type: Number, required: true },
  originPort: { type: String, required: true },
  destinationPort: { type: String, required: true },
  arrivalWindowStart: { type: Date, required: true },
  arrivalWindowEnd: { type: Date, required: true },
  contractType: { type: String, required: true }, // e.g., Voyage, Time Charter
  status: { 
    type: String, 
    enum: ['PENDING', 'NEGOTIATING', 'ACCEPTED', 'REJECTED', 'ACTIVE', 'COMPLETED', 'CANCELLED'], 
    default: 'PENDING' 
  },
  // Vessel Handover details (Post-Deal)
  handoverDetails: {
    captainName: String,
    captainContact: String,
    mmsi: String,
    estimatedDeparture: Date,
    estimatedArrival: Date
  }
}, { timestamps: true });

const Contract = mongoose.model('Contract', contractSchema);
export default Contract;
