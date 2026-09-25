import mongoose from 'mongoose';

const availabilitySchema = new mongoose.Schema({
  vesselId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vessel', required: true },
  busyFrom: { type: Date, required: true },
  busyTo: { type: Date, required: true },
  status: { type: String, enum: ['ON_CHARTER', 'MAINTENANCE'], required: true },
  contractId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract' } // Optional, if linked to a charter
}, { timestamps: true });

const Availability = mongoose.model('Availability', availabilitySchema);
export default Availability;
