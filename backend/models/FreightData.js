import mongoose from 'mongoose';

const freightDataSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  bdi: { type: Number },
  bci: { type: Number },
  bpi: { type: Number },
  bsi: { type: Number },
  bhsi: { type: Number },
  freightRate: { type: Number },
  vesselClass: { type: String },
  route: { type: String }
}, {
  timestamps: true
});

const FreightData = mongoose.model('FreightData', freightDataSchema);
export default FreightData;
