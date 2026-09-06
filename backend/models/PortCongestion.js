import mongoose from 'mongoose';

const portCongestionSchema = new mongoose.Schema({
  port: { type: mongoose.Schema.Types.ObjectId, ref: 'Port', required: true },
  date: { type: Date, required: true },
  waitingDays: { type: Number },
  berthOccupancy: { type: Number },
  vesselsAtAnchorage: { type: Number },
  congestionLevel: { type: String }
}, {
  timestamps: true
});

const PortCongestion = mongoose.model('PortCongestion', portCongestionSchema);
export default PortCongestion;
